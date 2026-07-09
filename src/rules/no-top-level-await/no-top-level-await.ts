import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { createRuleType } from '../utils';

const ruleNoTopLevelAwait: createRuleType = createRule({
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
        let mut_functionDepth = 0;
        const enter = (): void => {
            mut_functionDepth += 1;
        };
        const exit = (): void => {
            mut_functionDepth -= 1;
        };

        return {
            'ArrowFunctionExpression': enter,
            'ArrowFunctionExpression:exit': exit,
            'FunctionDeclaration': enter,
            'FunctionDeclaration:exit': exit,
            'FunctionExpression': enter,
            'FunctionExpression:exit': exit,

            'AwaitExpression': (node: TSESTree.AwaitExpression) => {
                if (mut_functionDepth === 0) {
                    context.report({
                        node,
                        messageId: 'noTopLevelAwait',
                    });
                }
            },
        };
    },
});

export default ruleNoTopLevelAwait;
