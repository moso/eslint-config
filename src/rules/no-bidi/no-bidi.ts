import {
    createRule,
    escape,
    getFixer,
    getValue,
} from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

const BIDI_PATTERN = /[\u061C\u202A-\u202E\u2066-\u2069]/u;

export default createRule({
    name: 'no-bidi',
    meta: {
        type: 'problem',
        fixable: 'code',
        docs: {
            description: 'Detect and stop trojan source attacks.',
            recommended: 'recommended',
            url: 'https://dimensiondev.github.io/eslint-plugin/src/rules/unicode/no-bidi',
        },
        schema: [],
        messages: {
            noBidi: 'Detected potential trojan source attack with unicode bidi introduced in this {{kind}}: {{text}}.',
        },
    },
    create: (context) => {
        const onReport = (node: TSESTree.Token, kind: string) => {
            const matcher = new RegExp(BIDI_PATTERN.source, 'gu');
            const data = { kind, text: escape(node.value, matcher) };
            context.report({
                node,
                data,
                messageId: 'noBidi',
                fix: getFixer(node, matcher),
            });
        };

        return {
            Program: (program: TSESTree.Program) => {
                (program.tokens ?? []).reduce((acc, token) => {
                    const value = getValue(token);
                    if (value !== false && BIDI_PATTERN.test(value))
                        onReport(token, 'code');
                    return acc;
                }, []);

                (program.comments ?? []).reduce((acc, comment) => {
                    if (BIDI_PATTERN.test(comment.value))
                        onReport(comment, 'comment');
                    return acc;
                }, []);
            },
        };
    },
});
