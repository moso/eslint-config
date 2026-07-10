import { AST_NODE_TYPES, AST_TOKEN_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';

import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleListener } from '@typescript-eslint/utils/eslint-utils';
import type {
    ReportFixFunction,
    RuleContext,
    RuleMetaData,
    RuleRecommendation,
} from '@typescript-eslint/utils/ts-eslint';

/**
 * The shape of a rule module as exported by this plugin,
 * used by the shared test runner to type valid/invalid cases.
 */
export type ExportedRuleModule<TOptions extends ReadonlyArray<unknown> = ReadonlyArray<unknown>, TMessageIDs extends string = string> = {
    create: (context: Readonly<RuleContext<TMessageIDs, TOptions>>) => RuleListener;
    readonly meta: Metadata<TMessageIDs, unknown, TOptions>;
    readonly name: string;
};

type Metadata<
    TMessageIds extends string,
    PluginDocs = unknown,
    TOptions extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
> = RuleMetaData<TMessageIds, PluginDocs & { recommended?: RuleRecommendation }, TOptions> & {
    hidden?: boolean;
};

type RuleMeta = {
    recommended?: RuleRecommendation;
};

/**
 * Typed rule factory for every rule in this plugin.
 *
 * Wraps `ESLintUtils.RuleCreator` with the plugin's meta-docs shape,
 * and the rule name doubles as its documentation URL slug.
 */
export const createRule: ReturnType<typeof ESLintUtils.RuleCreator<RuleMeta>> = ESLintUtils.RuleCreator<RuleMeta>((name) => name);

/**
 * Walk up the AST from `node` and return the nearest ancestor
 * (or the node itself) matching a node type.
 * Basically the AST equivalent of `Element#closest`.
 */
const closest = (
    node: TSESTree.Node | null | undefined,
    test: TSESTree.Node['type'] | ((node: TSESTree.Node) => boolean),
): TSESTree.Node | undefined => {
    const predicate = typeof test === 'string'
        ? (node: TSESTree.Node) => node.type === test
        : test;

    const findClosest = (current: TSESTree.Node | null | undefined): TSESTree.Node | undefined => {
        if (!current) return undefined;
        return predicate(current) ? current : findClosest(current.parent);
    };

    return findClosest(node);
};

/**
 * Replace every `pattern` match in `input` with its unicode escape sequence
 * (`\uXXXX` for BMP code points, `\u{XXXXX}` beyond), making invisible or
 * bidirectional characters visible in source and report messages.
 *
 * @param input - The raw text to escape.
 * @param pattern - Which characters to escape; pass a `/g` regex to escape all occurrences.
 * @returns The text with matched characters replaced by their escape sequences.
 */
export const escape = (input: string, pattern: RegExp): string => input.replace(pattern, (match) => {
    const point = match.codePointAt(0);
    return (typeof point === 'number' && point > 65_535)
        ? `\\u{${(point).toString(16).padStart(4, '0').toUpperCase()}}`
        : `\\u${(point)?.toString(16).padStart(4, '0').toUpperCase()}`;
});

/**
 * Fixer that rewrites `pattern` matches inside a token to a safe,
 * escaped form dispatched on token type:
 * - HTML entities for JSXText
 * - A rebuilt regex with the `u` flag for RegularExpression
 * - Unicode escapes for String/Template tokens
 *
 * @param token - The offending token to rewrite.
 * @param pattern - Which characters to escape; pass a `/g` regex to fix all occurrences.
 * @returns A fix function, or `undefined` for token types that cannot be fixed safely.
 */
export const getFixer = (token: TSESTree.Token, pattern: RegExp): ReportFixFunction | undefined => {
    switch (token.type) {
        case AST_TOKEN_TYPES.JSXText: {
            return (fixer) => {
                const modified = token.value.replace(
                    pattern,
                    (match: string) =>
                        `&#x${(match.codePointAt(0))?.toString(16).padStart(4, '0').toUpperCase()};`,
                );
                return fixer.replaceText(token, modified);
            };
        }
        case AST_TOKEN_TYPES.RegularExpression: {
            return (fixer) => {
                const mut_flags = new Set(token.regex.flags);
                mut_flags.add('u');
                const re = new RegExp(escape(token.regex.pattern, pattern), [...mut_flags].join(''));
                return fixer.replaceText(token, re.toString());
            };
        }
        case AST_TOKEN_TYPES.String:
        case AST_TOKEN_TYPES.Template: {
            return (fixer) => {
                const prefix = token.value.slice(0, 1);
                const suffix = token.value.slice(-1);
                const modified = escape(token.value.slice(1, -1), pattern);
                return fixer.replaceText(token, `${prefix}${modified}${suffix}`);
            };
        }
        default: {
            return undefined;
        }
    }
};

/**
 * Resolve the expression a `return` should carry when inlining a variable.
 *
 * Unwraps `await` (the classic no-return-await optimization - `return promise`
 * flattens identically for the caller) except inside `try` blocks,
 * where the `await` is needed for `catch` to observe rejections.
 *
 * @param node - The variable initializer being inlined.
 * @returns `node.argument` for safe-to-unwrap awaits, otherwise `node` itself.
 */
export const getReturnExpression = (node: TSESTree.Node): TSESTree.Node => {
    if (node.type !== AST_NODE_TYPES.AwaitExpression) return node;
    if (closest(node, AST_NODE_TYPES.TryStatement)) return node;
    return node.argument;
};

/**
 * Extract the user-visible text of a token for pattern scanning:
 * string/template contents without quotes, regex pattern source,
 * identifier names or `false` for token types that carry no scannable text.
 */
const getValue = (token: TSESTree.Token): false | string => {
    switch (token.type) {
        case AST_TOKEN_TYPES.Block:
        case AST_TOKEN_TYPES.Boolean: {
            return false;
        }
        case AST_TOKEN_TYPES.Identifier: {
            if (token.value.startsWith('#')) return token.value.slice(1);
            return token.value;
        }
        case AST_TOKEN_TYPES.JSXIdentifier:
        case AST_TOKEN_TYPES.JSXText: {
            return token.value;
        }
        case AST_TOKEN_TYPES.Keyword:
        case AST_TOKEN_TYPES.Line:
        case AST_TOKEN_TYPES.Null:
        case AST_TOKEN_TYPES.Numeric: {
            return false;
        }
        case AST_TOKEN_TYPES.PrivateIdentifier: {
            return token.value;
        }
        case AST_TOKEN_TYPES.Punctuator: {
            return false;
        }
        case AST_TOKEN_TYPES.RegularExpression: {
            return token.regex.pattern;
        }
        case AST_TOKEN_TYPES.String:
        case AST_TOKEN_TYPES.Template: {
            return token.value.slice(1, -1);
        }
    }

    return false;
};

const functionLikeTypes: ReadonlySet<AST_NODE_TYPES> = new Set([
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.FunctionDeclaration,
    AST_NODE_TYPES.FunctionExpression,
]);

/**
 * Whether `node` is a function declaration, function expression, or arrow function.
 */
export const isFunctionLike = (
    node?: TSESTree.Node | null,
): node is TSESTree.ArrowFunctionExpression | TSESTree.FunctionDeclaration | TSESTree.FunctionExpression => {
    if (!node) return false;
    return functionLikeTypes.has(node.type);
};

/**
 * Whether `node` is an identifier matching `name` given as an exact string,
 * a list of accepted names, or a predicate over the identifier's name.
 */
export const isIdentifierName = (
    node: TSESTree.Node | null | undefined,
    name?: string | ReadonlyArray<string> | ((name: string) => unknown),
): boolean => {
    if (!isIdentifier(node)) return false;
    if (typeof name === 'string') return node.name === name;
    if (typeof name === 'function') return Boolean(name(node.name));
    return name?.includes(node.name) ?? false;
};

/**
 * Check if both identifiers have the same name.
 */
export const isSameIdentifier = (a: TSESTree.Node | null | undefined, b: TSESTree.Node | null | undefined): boolean =>
    a?.type === AST_NODE_TYPES.Identifier && b?.type === a.type && a.name === b.name;

/**
 * Whether `node` is an identity function: a single-parameter function that
 * returns its own parameter unchanged, in either expression form (`(x) => x`)
 * or block form (`(x) => { return x }`).
 */
export const isIdentifierFunction = (node?: TSESTree.Node): boolean => {
    if (!isFunctionLike(node)) return false;
    if (node.params.length !== 1) return false;
    if (node.params[0].type !== AST_NODE_TYPES.Identifier) return false;
    if (isSameIdentifier(node.params[0], node.body)) return true;

    return (
        node.body.type === AST_NODE_TYPES.BlockStatement &&
        node.body.body.length === 1 &&
        node.body.body[0].type === AST_NODE_TYPES.ReturnStatement &&
        isSameIdentifier(node.params[0], node.body.body[0].argument)
    );
};

export const isLiteralValue = (node: TSESTree.Node, value: string | ReadonlyArray<unknown> | RegExp): boolean => {
    if (node.type !== AST_NODE_TYPES.Literal) return false;
    if (typeof value === 'string') return node.value === value;
    if ('test' in value) return typeof node.value === 'string' && value.test(node.value);
    return value.includes(node.value);
};

export const makeProgramListener = (
    pattern: RegExp,
    onReport: (node: TSESTree.Token, kind: string) => void,
): RuleListener => ({
    Program: (program: TSESTree.Program) => {
        const tokens = program.tokens ?? [];
        const comments = program.comments ?? [];

        for (const token of tokens) {
            const value = getValue(token);
            if (value !== false && pattern.test(value)) onReport(token, 'code');
        }

        for (const comment of comments)
            if (pattern.test(comment.value)) onReport(comment, 'comment');
    },
});

/**
 * Apply `callback` to `input` and return the result.
 * Lets a derived value be computed inline where a statement would otherwise be needed.
 */
export const wrap = <T, R = T>(input: T, callback: (input: T) => R): R => callback(input);

/**
 * The widened rule type used to annotate every exported rule. Required by `isolatedDeclarations`.
 * Only widens the exported type, `messageId` and `options` checking inside
 * each `createRule` call is preserved by inference from the argument object.
 */
export type createRuleType = ReturnType<typeof createRule>;
