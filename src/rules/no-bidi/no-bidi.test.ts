import { dedent } from 'ts-dedent';

import { runTest } from '../tests';
import module from './no-bidi';

const valids = [
    'const foo = "bar"',
    'const hello = "world"',
    'console.log("Hello World")',
    'const unicode = "café"',
    'const emoji = "👍"',
    'const japanese = "こんにちは"',
    'const arabic = "مرحبا"',
    'const hebrew = "שלום"',
];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: 'const foo = "Hello\u{202E}World"',
            errors: [
                {
                    messageId: 'noBidi',
                    data: {
                        kind: 'code',
                        text: String.raw `"Hello\u202EWorld"`,
                    },
                },
            ],
            output: 'const foo = "Hello\\u202EWorld"',
        },
        {
            code: 'const bar = "Test\u{61C}String"',
            errors: [
                {
                    messageId: 'noBidi',
                    data: {
                        kind: 'code',
                        text: String.raw `"Test\u061CString"`,
                    },
                },
            ],
            output: 'const bar = "Test\\u061CString"',
        },
        {
            code: 'const test = "Data\u{202D}Value"',
            errors: [
                {
                    messageId: 'noBidi',
                    data: {
                        kind: 'code',
                        text: String.raw `"Data\u202DValue"`,
                    },
                },
            ],
            output: 'const test = "Data\\u202DValue"',
        },
        {
            code: 'const sample = "Info\u{2066}Item"',
            errors: [
                {
                    messageId: 'noBidi',
                    data: {
                        kind: 'code',
                        text: String.raw `"Info\u2066Item"`,
                    },
                },
            ],
            output: 'const sample = "Info\\u2066Item"',
        },
        {
            code: 'const example = "Text\u{2067}Here"',
            errors: [
                {
                    messageId: 'noBidi',
                    data: {
                        kind: 'code',
                        text: String.raw `"Text\u2067Here"`,
                    },
                },
            ],
            output: 'const example = "Text\\u2067Here"',
        },
        {
            code: 'const content = "Word\u{2068}There"',
            errors: [
                {
                    messageId: 'noBidi',
                    data: {
                        kind: 'code',
                        text: String.raw `"Word\u2068There"`,
                    },
                },
            ],
            output: 'const content = "Word\\u2068There"',
        },
        {
            code: 'const value = "Line\u{2069}End"',
            errors: [
                {
                    messageId: 'noBidi',
                    data: {
                        kind: 'code',
                        text: String.raw `"Line\u2069End"`,
                    },
                },
            ],
            output: 'const value = "Line\\u2069End"',
        },
        {
            code: dedent `
              const accessLevel = "user";
              if (accessLevel != "user\u202E \u2066// Check if admin\u2069 \u2066") {
                  console.log("You are an admin.")
              }
            `,
            errors: [
                {
                    messageId: 'noBidi',
                    data: {
                        kind: 'code',
                        text: String.raw `"user\u202E \u2066// Check if admin\u2069 \u2066"`,
                    },
                },
            ],
            output: dedent `
              const accessLevel = "user";
              if (accessLevel != "user\\u202E \\u2066// Check if admin\\u2069 \\u2066") {
                  console.log("You are an admin.")
              }
            `,
        },
    ],
});
