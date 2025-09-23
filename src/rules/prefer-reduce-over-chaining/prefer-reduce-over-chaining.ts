import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

const arrayHighOrderFunctions = new Set([
    'filter',
    'forEach',
    'map',
    'reduce',
    'reduceRight',
]);

const isArrayHigherOrderFunction = (node: TSESTree.Node): node is TSESTree.MemberExpressionNonComputedName => {
    if (node.type !== AST_NODE_TYPES.MemberExpression) return false;
    if (node.computed) return false;
    if (node.property.type !== AST_NODE_TYPES.Identifier) return false;

    return arrayHighOrderFunctions.has(node.property.name) && node.parent.type === AST_NODE_TYPES.CallExpression;
};

export default createRule({
    name: 'prefer-reduce-over-chaining',
    meta: {
        type: 'problem',
        docs: {
            description: 'Prefer `.reduce()` over chaining `.map()` and `.filter()` methods.',
            recommended: 'recommended',
            url: 'https://github.com/SukkaW/eslint-config-sukka/blob/master/packages/eslint-plugin-sukka/src/rules/no-chain-array-higher-order-functions/index.ts',
        },
        fixable: 'code',
        schema: [],
        messages: {
            preferReduceOverChaining: 'Detected the chaining of array methods: {{methods}}. Replace with `.reduce` to reduce array iterations and improve performance.',
        },
    },
    create: (context) => ({
        MemberExpression: (node: TSESTree.MemberExpression) => {
            if (!(isArrayHigherOrderFunction(node))) return;
            const parent = node.parent as TSESTree.CallExpression;
            if (isArrayHigherOrderFunction(parent.parent)) {
                context.report({
                    node: parent,
                    messageId: 'preferReduceOverChaining',
                    data: {
                        methods: `arr.${(node.property as TSESTree.Identifier).name}().${(parent.parent.property as TSESTree.Identifier).name}()`,
                    },
                });
            }
        },
    }),
});
