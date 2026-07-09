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
    /\u00AD\u034F\u061C\u17B4\u17B5\uFEFF\uFFFC/u,
    /\u180B-\u180E/u,
    /\u200B-\u200F/u,
    /\u202A-\u202E/u,
    /\u2060-\u206F/u,
    /\uFE00-\uFE0F/u,
    /\uFFF0-\uFFF8/u,
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
