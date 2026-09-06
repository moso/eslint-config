import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';

import {
    createRule,
    getReturnExpression,
    isSameIdentifier,
    wrap,
} from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';
import type { ReportFixFunction, SourceCode } from '@typescript-eslint/utils/ts-eslint';

import type { createRuleType } from '../utils';

type RedundantDeclaration = TSESTree.VariableDeclaration & {
    declarations: [TSESTree.VariableDeclarator & { init: TSESTree.Expression }];
};

const isRedundantVariable = (
    node: TSESTree.Node | undefined,
    exit: TSESTree.ReturnStatement,
): node is RedundantDeclaration => {
    if (!node) return false;

    return (
        node.type === AST_NODE_TYPES.VariableDeclaration &&
        node.declarations.length === 1 &&
        node.declarations[0].init !== null &&
        isSameIdentifier(exit.argument, node.declarations[0].id)
    );
};

const isSelfReferencing = (source: Readonly<SourceCode>, variable: RedundantDeclaration): boolean => {
    const { init } = variable.declarations[0];

    return source.getDeclaredVariables(variable).some(({ references }) =>
        references.some(({ identifier }) => identifier.range[0] >= init.range[0] && identifier.range[1] <= init.range[1]));
};

const isRedundantVariableFixer = (
    source: Readonly<SourceCode>,
    variable: RedundantDeclaration,
    exit: TSESTree.ReturnStatement & { argument: TSESTree.Identifier },
): ReportFixFunction => (fixer) => {
    const { init, id } = variable.declarations[0];

    const replaced = getReturnExpression(init);
    const modified = wrap(source.getText(replaced), (input) => {
        if (!id.typeAnnotation) return input;

        const annotation = source.getText(id.typeAnnotation.typeAnnotation);
        return `(${input}) as ${replaced === init ? annotation : `Promise<${annotation}>`}`;
    });

    return [fixer.remove(variable), fixer.replaceText(exit.argument, modified)];
};

const isReturnStatement = (node: TSESTree.Node): node is TSESTree.ReturnStatement & { argument: TSESTree.Identifier } => (
    node.type === AST_NODE_TYPES.ReturnStatement && isIdentifier(node.argument)
);

const ruleNoRedundantVariables: createRuleType = createRule({
    name: 'no-redundant-variable',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow redundant variables.',
            recommended: 'stylistic',
            url: 'https://dimensiondev.github.io/eslint-plugin/src/rules/no-redundant-variable',
        },
        fixable: 'code',
        schema: [],
        messages: {
            noRedundantVar: 'Return the value directly instead of assigning it to a redundant variable.',
        },
    },
    create: (context) => ({
        BlockStatement: ({ body }: TSESTree.BlockStatement) => {
            let mut_previous: TSESTree.Statement | undefined;

            for (const statement of body) {
                if (!isReturnStatement(statement)) {
                    mut_previous = statement;
                    continue;
                }

                if (isRedundantVariable(mut_previous, statement) && !isSelfReferencing(context.sourceCode, mut_previous)) {
                    context.report({
                        node: statement,
                        messageId: 'noRedundantVar',
                        fix: isRedundantVariableFixer(context.sourceCode, mut_previous, statement),
                    });
                }

                return;
            }
        },
    }),
});

export default ruleNoRedundantVariables;
