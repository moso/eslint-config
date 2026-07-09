import tsEslintParser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import globals from 'globals';
import { afterAll, describe, it } from 'vitest';

import type { InvalidTestCase, ValidTestCase } from '@typescript-eslint/rule-tester';
import type { TSESLint } from '@typescript-eslint/utils';

import type { ExportedRuleModule } from './utils';

type TestCaseGenerator<T, R = T> = (ReadonlyArray<R>) | ((cast: (input: T) => T) => Generator<R>);

type TestOptions<TOptions extends ReadonlyArray<unknown>, TMessageIds extends string> = {
    invalid?: TestCaseGenerator<InvalidTestCase<TMessageIds, TOptions>>;
    module: ExportedRuleModule<TOptions, TMessageIds>;
    valid?: TestCaseGenerator<ValidTestCase<TOptions>, string | ValidTestCase<TOptions>>;
};

const identity = <T>(input: T): T => input;

RuleTester.afterAll = afterAll;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.itSkip = it.skip;
RuleTester.describe = describe;
RuleTester.describeSkip = describe.skip;

const ruleTest = new RuleTester({
    languageOptions: {
        ecmaVersion: 'latest',
        globals: {
            ...globals.browser,
            ...globals.node,
        },
        parser: tsEslintParser,
        parserOptions: {
            ecmaFeatures: { jsx: true },
            warnOnUnsupportedTypeScriptVersion: false,
        },
        sourceType: 'module',
    },
    linterOptions: {
        reportUnusedDisableDirectives: false,
    },
});

export function runTest<TOptions extends ReadonlyArray<unknown>, TMessageIds extends string>(
    { invalid, module, valid }: Readonly<TestOptions<TOptions, TMessageIds>>,
    extraRules?: Record<string, TSESLint.AnyRuleModule>,
): void {
    const $invalid = typeof invalid === 'function'
        ? [...invalid(identity)]
        : (invalid);
    const $valid = typeof valid === 'function'
        ? [...valid(identity)]
        : (valid);

    const tester = extraRules
        ? (() => {
            const extraRulesTester = new RuleTester({
                languageOptions: {
                    globals: {
                        ...globals.browser,
                        ...globals.node,
                    },
                    parser: tsEslintParser,
                    parserOptions: {
                        ecmaFeatures: { jsx: true },
                        warnOnUnsupportedTypeScriptVersion: false,
                    },
                    sourceType: 'module',
                },
                linterOptions: {
                    reportUnusedDisableDirectives: false,
                },
            });

            for (const [name, rule] of Object.entries(extraRules)) extraRulesTester.defineRule(name, rule);

            return extraRulesTester;
        })()
        : ruleTest;

    tester.run(module.name, module, {
        valid: ($valid?.flat() ?? []).map((item, index) => {
            if (typeof item === 'string') return item;

            return {
                ...item,
                name: `${item.name ?? 'valid'} #${index}`,
            };
        }),

        invalid: ($invalid?.flat() ?? []).map((item, index) => ({
            ...item,
            name: `${item.name ?? 'invalid'} #${index}`,
        })),
    });
};
