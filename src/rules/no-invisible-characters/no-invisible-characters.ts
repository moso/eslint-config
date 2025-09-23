import {
    createRule,
    getFixer,
    getValue,
} from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleListener } from '@typescript-eslint/utils/ts-eslint';

const combinePattern = (...patterns: ReadonlyArray<RegExp | string>) => {
    const source = patterns
        .map((pattern) => (typeof pattern === 'string' ? pattern : pattern.source))
        .join('');
    return new RegExp(`[${source}]`, 'u');
};

const makeProgramListener = (
    pattern: RegExp,
    onReport: (node: TSESTree.Token, kind: string) => void,
): RuleListener => ({
    Program: (program: TSESTree.Program) => {
        (program.tokens ?? []).reduce((acc, token) => {
            const value = getValue(token);
            if (value !== false && pattern.test(value)) onReport(token, 'code');
            return acc;
        }, []);

        (program.comments ?? []).reduce((acc, comment) => {
            if (pattern.test(comment.value)) onReport(comment, 'comment');
            return acc;
        }, []);
    },
});

// Generated using
// https://github.com/hediet/vscode-unicode-data
// https://npm.io/regexgen
const invisiblePattern = combinePattern(
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

export default createRule({
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
    create: (context) => makeProgramListener(invisiblePattern, (node: TSESTree.Token) => {
        const matcher = new RegExp(invisiblePattern.source, 'gu');
        const fix = getFixer(node, matcher);

        context.report({
            node,
            messageId: 'noInvisibleCharacter',
            fix,
        });
    }),
});
