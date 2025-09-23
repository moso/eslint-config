import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, isFunctionLike } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';
import type { ReportFixFunction, RuleContext } from '@typescript-eslint/utils/ts-eslint';

const isTriggering = (node: TSESTree.Node, maximumStatements: number) => {
    if (node.type !== AST_NODE_TYPES.IfStatement || node.alternate !== null) return false;

    const { consequent } = node;
    return (
        (consequent.type === AST_NODE_TYPES.ExpressionStatement && maximumStatements === 0) ||
        (consequent.type === AST_NODE_TYPES.BlockStatement && consequent.body.length > maximumStatements)
    );
};

const makeFixer = (
    context: Readonly<RuleContext<string, unknown[]>>,
    parent: TSESTree.Statement,
): ReportFixFunction => (fixer) => {
    if (parent.type !== AST_NODE_TYPES.IfStatement) return [];

    const { test, consequent } = parent;

    const bodyText = consequent.type === AST_NODE_TYPES.BlockStatement
        ? context.sourceCode.getText(consequent).slice(1, -1).trim()
        : context.sourceCode.getText(consequent);

    return [
        fixer.insertTextBefore(test, '!('),
        fixer.insertTextAfter(test, ')'),
        fixer.replaceText(consequent, 'return;'),
        fixer.insertTextAfter(parent, `\n${bodyText}`),
    ];
};

export type Options = {
    maximumStatements: number;
};

export default createRule({
    name: 'prefer-early-return',
    meta: {
        type: 'problem',
        docs: {
            description: 'Prefer early returns over full-body conditional wrapping in function declarations.',
            recommended: 'stylistic',
            url: 'https://dimensiondev.github.io/eslint-plugin/src/rules/prefer-early-return',
        },
        fixable: 'code',
        schema: [
            {
                type: 'object',
                properties: {
                    maximumStatements: { type: 'integer', minimum: 0 },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            preferEarlyReturn: 'Prefer an early return to a conditionally-wrapped function body.',
        },
    },
    resolveOptions: (options?: Options) => options?.maximumStatements ?? 1,
    create: (context, maximumStatements: number) => ({
        BlockStatement: ({ body, parent }: TSESTree.BlockStatement) => {
            if (!isFunctionLike(parent)) return;

            const simplifiable = body.length === 1 && isTriggering(body[0], maximumStatements);
            if (!simplifiable) return;

            context.report({
                node: body[0],
                messageId: 'preferEarlyReturn',
                fix: makeFixer(context, body[0]),
            });
        },
    }),
});
