import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

const isTopType = (node: TSESTree.Node) =>
    node.type === AST_NODE_TYPES.TSAnyKeyword || node.type === AST_NODE_TYPES.TSUnknownKeyword;

const isTypeReference = (node: TSESTree.Node | undefined) =>
    node && node.type === AST_NODE_TYPES.TSAsExpression && node.typeAnnotation.type === AST_NODE_TYPES.TSTypeReference;

export default createRule({
    name: 'no-force-cast-via-top-type',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow casting a type `T` to unrelated or incompatible type `Q` via `T as any as Q`.',
            recommended: 'recommended',
            url: 'https://dimensiondev.github.io/eslint-plugin/src/rules/type/no-force-cast-via-top-type',
        },
        schema: [],
        messages: {
            noForceCast: 'Do not cast this expression to another type by `as {{type}} as T`.',
        },
    },
    create: (context) => ({
        TSAsExpression: (node: TSESTree.TSAsExpression) => {
            if (!isTopType(node.typeAnnotation)) return;
            if (!isTypeReference(node.parent)) return;

            const type = node.typeAnnotation.type === AST_NODE_TYPES.TSAnyKeyword ? 'any' : 'unknown';

            context.report({
                node,
                messageId: 'noForceCast',
                data: { type },
            });
        },
    }),
});
