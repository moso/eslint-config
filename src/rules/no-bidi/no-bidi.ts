import {
    createRule,
    escape,
    getFixer,
    makeProgramListener,
} from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { createRuleType } from '../utils';

const BIDI_PATTERN = /[\u061C\u202A-\u202E\u2066-\u2069]/u;
const BIDI_PATTERN_GLOBAL = new RegExp(BIDI_PATTERN.source, 'gu');

const ruleNoBidi: createRuleType = createRule({
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
    create: (context) => makeProgramListener(BIDI_PATTERN, (node: TSESTree.Token, kind: string) => {
        context.report({
            node,
            data: { kind, text: escape(node.value, BIDI_PATTERN_GLOBAL) },
            messageId: 'noBidi',
            fix: getFixer(node, BIDI_PATTERN_GLOBAL),
        });
    }),
});

export default ruleNoBidi;
