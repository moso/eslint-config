import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, isIdentifierFunction, isIdentifierName } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { createRuleType } from '../utils';

const ruleNoUnneededArrayFlatMap: createRuleType = createRule({
    name: 'no-unneeded-array-flat-map',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow `Array#flatMap((x) => x)` when simpler alternatives exist.',
            url: 'https://dimensiondev.github.io/eslint-plugin/src/rules/array/no-unneeded-flat-map',
            recommended: 'stylistic',
        },
        fixable: 'code',
        schema: [],
        messages: {
            noUnneededArrayFlatMap: 'Use `Array#flat()` instead of `Array#flatMap()` with an identity callback.',
        },
    },
    create: (context) => ({
        CallExpression: (node: TSESTree.CallExpression) => {
            if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return;

            const isFlatMap = isIdentifierName(node.callee.property, 'flatMap');
            if (!isFlatMap || !isIdentifierFunction(node.arguments[0])) return;

            const { property } = node.callee;

            context.report({
                node,
                messageId: 'noUnneededArrayFlatMap',
                fix: (fixer) => [
                    fixer.replaceText(property, 'flat'),
                    fixer.replaceTextRange([node.arguments[0].range[0], node.range[1] - 1], ''),
                ],
            });
        },
    }),
});

export default ruleNoUnneededArrayFlatMap;
