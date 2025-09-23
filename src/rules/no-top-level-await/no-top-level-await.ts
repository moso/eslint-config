import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

export default createRule({
    name: 'no-top-level-await',
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent using top-level await.',
            recommended: 'recommended',
            url: 'https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-top-level-await.ts',
        },
        schema: [],
        messages: {
            noTopLevelAwait: 'Do not use await at top-level.',
        },
    },
    create: (context) => {
        const source = context.sourceCode;

        return {
            AwaitExpression: (node: TSESTree.AwaitExpression) => {
                const ancestors = source.getAncestors(node);
                const isInsideFunction = ancestors.some((ancestor: TSESTree.Node) =>
                    ancestor.type === AST_NODE_TYPES.FunctionDeclaration ||
                    ancestor.type === AST_NODE_TYPES.FunctionExpression ||
                    ancestor.type === AST_NODE_TYPES.ArrowFunctionExpression);

                if (!isInsideFunction) {
                    context.report({
                        node,
                        messageId: 'noTopLevelAwait',
                    });
                }
            },
        };
    },
});
