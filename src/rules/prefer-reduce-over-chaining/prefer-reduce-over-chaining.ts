import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { createRuleType } from '../utils';

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

const rulePreferReduceOverChaining: createRuleType = createRule({
    name: 'prefer-reduce-over-chaining',
    meta: {
        type: 'problem',
        docs: {
            description: 'Prefer `.reduce()` over chaining `.map()` and `.filter()` methods.',
            recommended: 'recommended',
            url: 'https://github.com/SukkaW/eslint-plugin-sukka/blob/master/src/rules/no-chain-array-higher-order-functions/index.ts',
        },
        schema: [],
        messages: {
            preferReduceOverChaining: 'Detected the chaining of array methods: {{methods}}. Replace with `.reduce` to reduce array iterations and improve performance.',
        },
    },
    create: (context) => ({
        MemberExpression: (node: TSESTree.MemberExpression) => {
            if (!isArrayHigherOrderFunction(node)) return;

            const { parent } = node;
            if (parent.type !== AST_NODE_TYPES.CallExpression) return;
            if (!isArrayHigherOrderFunction(parent.parent)) return;

            context.report({
                node: parent,
                messageId: 'preferReduceOverChaining',
                data: {
                    methods: `arr.${node.property.name}().${parent.parent.property.name}()`,
                },
            });
        },
    }),
});

export default rulePreferReduceOverChaining;
