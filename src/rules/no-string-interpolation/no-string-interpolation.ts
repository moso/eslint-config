import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { createRuleType } from '../utils';

const isMultiline = ({ loc }: TSESTree.Node) => loc.start.line !== loc.end.line;

const ruleNoStringInterpolation: createRuleType = createRule({
    name: 'no-string-interpolation',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow simple string interpolation.',
            recommended: 'stylistic',
            url: 'https://dimensiondev.github.io/eslint-plugin/src/rules/string/no-interpolation',
        },
        schema: [],
        messages: {
            noStringInterpolation: 'Please extract this expression into its own variable.',
        },
    },
    create: (context) => ({
        TemplateLiteral: ({ expressions }: TSESTree.TemplateLiteral) => {
            for (const expression of expressions) {
                if (isMultiline(expression)) {
                    context.report({
                        node: expression,
                        messageId: 'noStringInterpolation',
                    });
                }
            }
        },
    }),
});

export default ruleNoStringInterpolation;
