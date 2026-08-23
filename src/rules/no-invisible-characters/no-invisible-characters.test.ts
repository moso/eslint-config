import { runTest } from '../tests';
import module from './no-invisible-characters';

const valids = [
    'ABC',
    'false',
    'true',
    'null',
    'const answer = 1;',
    'const re = /plain/u;',
    'const template = `plain`;',
    'class Example { #hidden = 1; }',
    'const element = <div className="x">text</div>;',
    '// plain line comment\n/* plain block comment */',
];

runTest({
    module,
    valid: valids,
    invalid: [
        {
            code: '"\u{E0100}example\u{E0100}"',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: '"\\u{E0100}example\\u{E0100}"',
        },
        {
            code: '"a\u{200B}b"',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: '"a\\u200Bb"',
        },
        {
            code: '"a\u{AD}b"',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: '"a\\u00ADb"',
        },
        {
            code: 'const template = `a\u{200B}b`;',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: 'const template = `a\\u200Bb`;',
        },
        {
            code: 'const element = <div>a\u{200B}b</div>;',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: 'const element = <div>a&#x200B;b</div>;',
        },
        {
            code: 'const re = /a\u{200B}b/;',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: 'const re = /a\\u200Bb/u;',
        },
        {
            code: 'const re = /a\u{200B}b/gi;',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: 'const re = /a\\u200Bb/giu;',
        },
        {
            code: 'const a\u{200D}b = 1;',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: null,
        },
        {
            code: 'class Example { #a\u{200D}b = 1; }',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: null,
        },
        {
            code: 'const element = <a\u{200D}b />;',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: null,
        },
        {
            code: '// a\u{200B}b',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: null,
        },
        {
            code: '/* a\u{200B}b */',
            errors: [{ messageId: 'noInvisibleCharacter' }],
            output: null,
        },
    ],
});
