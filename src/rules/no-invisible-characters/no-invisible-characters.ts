import {
    createRule,
    getFixer,
    makeProgramListener,
} from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { createRuleType } from '../utils';

const combinePattern = (...patterns: ReadonlyArray<string | RegExp>) => {
    const source = patterns
        .map((pattern) => (typeof pattern === 'string' ? pattern : pattern.source))
        .join('');
    return new RegExp(`[${source}]`, 'u');
};

// Generated using
// https://github.com/hediet/vscode-unicode-data
// https://npm.io/regexgen
const INVISIBLE_PATTERN = combinePattern(
    /\u{AD}\u{34F}\u{61C}\u{17B4}\u{17B5}\u{FEFF}\u{FFFC}/u,
    /\u{180B}-\u{180E}/u,
    /\u{200B}-\u{200F}/u,
    /\u{202A}-\u{202E}/u,
    /\u{2060}-\u{206F}/u,
    /\u{FE00}-\u{FE0F}/u,
    /\u{FFF0}-\u{FFF8}/u,
    /\u{1D173}-\u{1D17A}/u,
    /\u{E0000}-\u{E007F}/u,
    /\u{E0100}-\u{E01EF}/u,
);

const INVISIBLE_PATTERN_GLOBAL = new RegExp(INVISIBLE_PATTERN.source, 'gu');

const ruleNoInvisibleCharacters: createRuleType = createRule({
    name: 'no-invisible-characters',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow invisible characters.',
            recommended: 'recommended',
            url: 'https://dimensiondev.github.io/eslint-plugin/src/rules/unicode/no-invisible',
        },
        fixable: 'code',
        schema: [],
        messages: {
            noInvisibleCharacter: 'Illegal character detected.',
        },
    },
    create: (context) => makeProgramListener(INVISIBLE_PATTERN, (node: TSESTree.Token) => {
        context.report({
            node,
            messageId: 'noInvisibleCharacter',
            fix: getFixer(node, INVISIBLE_PATTERN_GLOBAL),
        });
    }),
});

export default ruleNoInvisibleCharacters;
