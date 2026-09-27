import tsEslintParser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import globals from 'globals';
import { afterAll, describe, it } from 'vitest';

import type { InvalidTestCase, ValidTestCase } from '@typescript-eslint/rule-tester';

import type { ExportedRuleModule } from './utils';

type TestOptions<TOptions extends ReadonlyArray<unknown>, TMessageIds extends string> = {
    invalid: ReadonlyArray<InvalidTestCase<TMessageIds, TOptions>>;
    module: ExportedRuleModule<TOptions, TMessageIds>;
    valid: ReadonlyArray<string | ValidTestCase<TOptions>>;
};

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
): void {
    ruleTest.run(module.name, module, {
        valid: valid.map((item, index) => {
            if (typeof item === 'string') return item;

            return {
                ...item,
                name: `${item.name ?? 'valid'} #${index}`,
            };
        }),

        invalid: invalid.map((item, index) => ({
            ...item,
            name: `${item.name ?? 'invalid'} #${index}`,
        })),
    });
};
