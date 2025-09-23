import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

const isMultiline = ({ loc }: TSESTree.Node) => loc.start.line !== loc.end.line;

export default createRule({
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
        TemplateLiteral: (node: TSESTree.TemplateLiteral) => {
            node.expressions.reduce((acc, expression) => {
                if (isMultiline(expression)) {
                    context.report({
                        node: expression,
                        messageId: 'noStringInterpolation',
                    });
                }
                return acc;
            }, undefined);
        },
    }),
});
