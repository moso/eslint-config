import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { createRule, isIdentifierName } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';
import type { SourceCode } from '@typescript-eslint/utils/ts-eslint';

import type { createRuleType } from '../utils';

export type Guard =
    | 'check-parse-result'
    | 'encode-input-rule'
    | 'guard-array-index'
    | 'guard-derived-value'
    | 'use-direct-operands'
    | 'write-explicit-condition';

export type Options = {
    guards: ReadonlyArray<Guard>;
};

type FunctionNode =
    | TSESTree.ArrowFunctionExpression
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression;

type FunctionScope = {
    asserted: ReadonlySet<string>;
    numberParams: ReadonlySet<string>;
};

const allGuards: ReadonlyArray<Guard> = [
    'check-parse-result',
    'encode-input-rule',
    'guard-array-index',
    'guard-derived-value',
    'use-direct-operands',
    'write-explicit-condition',
];

const defaultGuards: ReadonlyArray<Guard> = [
    'check-parse-result',
    'guard-derived-value',
    'use-direct-operands',
    'write-explicit-condition',
];

const arithmeticOperators: ReadonlySet<string> = new Set([
    '%',
    '*',
    '**',
    '+',
    '-',
    '/',
]);
const parseFunctions: ReadonlyArray<string> = ['Number', 'parseFloat', 'parseInt'];
const indexNamePattern = /^(?:[ijk]|idx|index)$/iu;
const indexSuffixPattern = /(?:Idx|Index)$/u;

const isConsoleAssert = (statement: TSESTree.Statement): boolean => {
    if (statement.type !== AST_NODE_TYPES.ExpressionStatement) return false;
    if (statement.expression.type !== AST_NODE_TYPES.CallExpression) return false;

    const { callee } = statement.expression;
    return (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        !callee.computed &&
        isIdentifierName(callee.object, 'console') &&
        isIdentifierName(callee.property, 'assert')
    );
};

const isConsumedDirectly = (node: TSESTree.CallExpression): boolean => {
    const { parent } = node;
    if (parent.type === AST_NODE_TYPES.BinaryExpression) return arithmeticOperators.has(parent.operator);

    return parent.type === AST_NODE_TYPES.MemberExpression && parent.computed && parent.property === node;
};

const isGuardedIndex = (node: TSESTree.MemberExpression): boolean => {
    const { parent } = node;
    if (parent.type === AST_NODE_TYPES.TSNonNullExpression) return true;

    return parent.type === AST_NODE_TYPES.LogicalExpression && parent.operator === '??' && parent.left === node;
};

const isMathCall = (node: TSESTree.CallExpression, methods?: ReadonlyArray<string>): boolean => {
    const { callee } = node;
    return (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        !callee.computed &&
        isIdentifierName(callee.object, 'Math') &&
        (methods === undefined || isIdentifierName(callee.property, methods))
    );
};

const isWriteTarget = (node: TSESTree.MemberExpression): boolean => {
    const { parent } = node;
    if (parent.type === AST_NODE_TYPES.AssignmentExpression) return parent.left === node;
    if (parent.type === AST_NODE_TYPES.UpdateExpression) return true;

    return parent.type === AST_NODE_TYPES.UnaryExpression && parent.operator === 'delete';
};

const assertedNames = (node: FunctionNode, sourceCode: Readonly<SourceCode>): ReadonlySet<string> => {
    if (node.body.type !== AST_NODE_TYPES.BlockStatement) return new Set();

    const mut_names = new Set<string>();

    for (const statement of node.body.body) {
        if (!isConsoleAssert(statement)) break;

        for (const token of sourceCode.getTokens(statement))
            if (token.type === AST_TOKEN_TYPES.Identifier) mut_names.add(token.value);
    }

    return mut_names;
};

const looksLikeIndex = (node: TSESTree.Node): boolean => {
    if (node.type === AST_NODE_TYPES.BinaryExpression) return arithmeticOperators.has(node.operator);
    if (node.type === AST_NODE_TYPES.CallExpression) return isMathCall(node);

    return isIdentifierName(node, (name) => indexNamePattern.test(name) || indexSuffixPattern.test(name));
};

const numberParameterNames = (node: FunctionNode): ReadonlySet<string> => {
    const mut_names = new Set<string>();

    for (const parameter of node.params) {
        if (parameter.type !== AST_NODE_TYPES.Identifier) continue;
        if (parameter.typeAnnotation?.typeAnnotation.type !== AST_NODE_TYPES.TSNumberKeyword) continue;

        mut_names.add(parameter.name);
    }

    return mut_names;
};

const rulePreferStrictNumberGuards: createRuleType = createRule({
    name: 'prefer-strict-number-guards',
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce the syntactic patterns that keep numeric code analyzable.',
            recommended: 'stylistic',
            url: 'https://github.com/chenglou/freerange',
        },
        schema: [{
            type: 'object',
            description: 'Which of the Freerange authoring rules to enforce.',
            properties: {
                guards: {
                    type: 'array',
                    description: 'The audit codes to enforce. The heuristic `encode-input-rule` and `guard-array-index` are off by default.',
                    items: { type: 'string', enum: [...allGuards] },
                    uniqueItems: true,
                    default: [...defaultGuards],
                },
            },
            additionalProperties: false,
        }],
        messages: {
            checkParseResult: 'This can produce `NaN` or `±Infinity`. Check the result with `Number.isFinite` or `Number.isNaN` before using it.',
            encodeInputRule: 'The `number` parameter `{{name}}` is used as a divisor or an index without stating its rule. Open the function with `console.assert({{name}} >= 1)`, or normalise it at the use site with `Math.max`/`Math.floor`.',
            guardArrayIndex: 'Indexing with a computed value can yield `undefined`. Default it with `?? fallback`, or assert it with `!` once the index is known to be in range.',
            guardDerivedValue: 'Dividing by a calculation hides whether that calculation can be zero. Name it in a `const`, check that name for zero, then divide.',
            useDirectOperands: 'A nested division introduces a ratio that can round to zero. Use the direct operands instead - `a / (b / c)` is `(a * c) / b`.',
            writeExplicitCondition: '`0` is falsy, so a `||` fallback silently replaces a legitimate zero. Write `value === 0 ? fallback : value` instead.',
        },
    },
    defaultOptions: [{ guards: [...defaultGuards] }] as [Options],
    create: (context, [{ guards }]) => {
        const enabled: ReadonlySet<Guard> = new Set(guards);
        const mut_scopes: FunctionScope[] = [];

        const enterFunction = (node: FunctionNode) => {
            mut_scopes.push({
                asserted: assertedNames(node, context.sourceCode),
                numberParams: numberParameterNames(node),
            });
        };

        const exitFunction = () => mut_scopes.pop();

        const reportUnencodedInput = (node: TSESTree.Node) => {
            if (!enabled.has('encode-input-rule')) return;
            if (node.type !== AST_NODE_TYPES.Identifier) return;

            const scope = mut_scopes.at(-1);
            if (!scope) return;
            if (!scope.numberParams.has(node.name)) return;
            if (scope.asserted.has(node.name)) return;

            context.report({
                node,
                messageId: 'encodeInputRule',
                data: { name: node.name },
            });
        };

        return {
            'ArrowFunctionExpression': enterFunction,
            'ArrowFunctionExpression:exit': exitFunction,

            'BinaryExpression': (node: TSESTree.BinaryExpression) => {
                if (node.operator !== '/' && node.operator !== '%') return;

                const divisor = node.right;

                if (divisor.type === AST_NODE_TYPES.BinaryExpression && arithmeticOperators.has(divisor.operator)) {
                    const nested = divisor.operator === '/';
                    const guard: Guard = nested ? 'use-direct-operands' : 'guard-derived-value';
                    if (!enabled.has(guard)) return;

                    context.report({
                        node: divisor,
                        messageId: nested ? 'useDirectOperands' : 'guardDerivedValue',
                    });

                    return;
                }

                reportUnencodedInput(divisor);
            },

            'CallExpression': (node: TSESTree.CallExpression) => {
                if (!enabled.has('check-parse-result')) return;

                if (isIdentifierName(node.callee, parseFunctions) && isConsumedDirectly(node)) {
                    context.report({ node, messageId: 'checkParseResult' });
                    return;
                }

                if (!isMathCall(node, ['max', 'min'])) return;

                const unbounded = node.arguments.length === 0 ||
                    node.arguments.some((argument) => argument.type === AST_NODE_TYPES.SpreadElement);
                if (!unbounded) return;

                context.report({
                    node,
                    messageId: 'checkParseResult',
                });
            },

            'FunctionDeclaration': enterFunction,
            'FunctionDeclaration:exit': exitFunction,

            'FunctionExpression': enterFunction,
            'FunctionExpression:exit': exitFunction,

            'LogicalExpression': (node: TSESTree.LogicalExpression) => {
                if (!enabled.has('write-explicit-condition')) return;
                if (node.operator !== '||') return;
                if (node.right.type !== AST_NODE_TYPES.Literal) return;
                if (typeof node.right.value !== 'number') return;

                context.report({
                    node,
                    messageId: 'writeExplicitCondition',
                });
            },

            'MemberExpression': (node: TSESTree.MemberExpression) => {
                if (!node.computed) return;
                if (node.property.type === AST_NODE_TYPES.Literal) return;

                reportUnencodedInput(node.property);

                if (!enabled.has('guard-array-index')) return;
                if (!looksLikeIndex(node.property)) return;
                if (isGuardedIndex(node) || isWriteTarget(node)) return;

                context.report({
                    node,
                    messageId: 'guardArrayIndex',
                });
            },
        };
    },
});

export default rulePreferStrictNumberGuards;
