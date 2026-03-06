import {
    createRule,
    escape,
    getFixer,
    makeProgramListener,
} from '../utils';

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
    create: (context) => makeProgramListener(BIDI_PATTERN, (node, kind) => {
        const matcher = new RegExp(BIDI_PATTERN.source, 'gu');
        const data = { kind, text: escape(node.value, matcher) };
        context.report({
            node,
            data,
            messageId: 'noBidi',
            fix: getFixer(node, matcher),
        });
    }),
});
