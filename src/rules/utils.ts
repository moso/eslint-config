/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison, functional/no-mixed-types, functional/no-throw-statements */
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { RuleListener } from '@typescript-eslint/utils/eslint-utils';

import type {
    ReportFixFunction,
    RuleContext,
    RuleMetaData,
    RuleRecommendation,
} from '@typescript-eslint/utils/ts-eslint';

export type { RuleContext } from '@typescript-eslint/utils/ts-eslint';

export type ExportedRuleModule<
    TOptions extends ReadonlyArray<unknown> = unknown[],
    TMessageIDs extends string = string,
> = {
    create: (context: Readonly<RuleContext<TMessageIDs, TOptions>>) => RuleListener;
    readonly meta: Metadata<TMessageIDs>;
    readonly name: string;
};

export type RuleModule<
    TResolvedOptions,
    TOptions extends ReadonlyArray<unknown>,
    TMessageIds extends string,
    TMetaDocs = unknown,
> = {
    create: (
        context: Readonly<RuleContext<TMessageIds, TOptions>>,
        options: TResolvedOptions,
    ) => RuleListener;
    readonly meta: Metadata<TMessageIds, TMetaDocs>;
    readonly name: string;
    resolveOptions?: (...options: TOptions) => TResolvedOptions;
};

type Metadata<
    TMessageIds extends string,
    PluginDocs = unknown,
> = RuleMetaData<TMessageIds, PluginDocs & { recommended?: RuleRecommendation }> & {
    hidden?: boolean;
};

export const createRule = <
    TResolvedOptions,
    TOptions extends ReadonlyArray<unknown>,
    TMessageIds extends string,
    PluginDocs = unknown,
>({
    name,
    meta,
    create,
    resolveOptions,
}: RuleModule<
    TResolvedOptions,
    TOptions,
    TMessageIds,
    PluginDocs
>) => Object.freeze({
    name,
    meta: meta as RuleMetaData<TMessageIds>,
    create: (context: Readonly<RuleContext<TMessageIds, TOptions>>) => {
        const options = resolveOptions?.(...context.options) ?? (context.options[0] as TResolvedOptions);
        const listener = Object.entries(create(context, options));
        return Object.fromEntries(listener.filter((pair) => pair[1])) as RuleListener;
    },
});

export const closest = (
    node: TSESTree.Node | undefined,
    test: ((node: TSESTree.Node) => boolean) | string,
): TSESTree.Node | undefined => {
    const testTest = typeof test === 'string'
        ? (node: TSESTree.Node) => node.type === test
        : test;

    return node && (testTest(node) ? node : closest(node.parent, testTest));
};

export const escape = (input: string, pattern: RegExp) => input.replace(pattern, (match) => {
    const point = match.codePointAt(0);
    return (typeof point === 'number' && point > 65_535)
        ? `\\u{${(point).toString(16).padStart(4, '0').toUpperCase()}}`
        : `\\u${(point)?.toString(16).padStart(4, '0').toUpperCase()}`;
});

export const getFixer = (token: TSESTree.Token, pattern: RegExp): ReportFixFunction | undefined => {
    switch (token.type) {
        case 'JSXText': {
            return (fixer) => {
                const modified = token.value.replace(
                    pattern,
                    (match) => `&#x${(match.codePointAt(0))?.toString(16).padStart(4, '0').toUpperCase()};`,
                );
                return fixer.replaceText(token, modified);
            };
        }
        case 'RegularExpression': {
            return (fixer) => {
                const mut_flags = new Set(token.regex.flags);
                mut_flags.add('u');
                const re = new RegExp(escape(token.regex.pattern, pattern), [...mut_flags].join(''));
                return fixer.replaceText(token, re.toString());
            };
        }
        case 'String':
        case 'Template': {
            return (fixer) => {
                const prefix = token.value.slice(0, 1);
                const suffix = token.value.slice(-1);
                const modified = escape(token.value.slice(1, -1), pattern);
                return fixer.replaceText(token, `${prefix}${modified}${suffix}`);
            };
        }
        case AST_TOKEN_TYPES.Boolean: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.Boolean case'); }
        case AST_TOKEN_TYPES.Identifier: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.Identifier case'); }
        case AST_TOKEN_TYPES.JSXIdentifier: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.JSXIdentifier case'); }
        case AST_TOKEN_TYPES.PrivateIdentifier: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.PrivateIdentifier case'); }
        case AST_TOKEN_TYPES.JSXText: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.JSXText case'); }
        case AST_TOKEN_TYPES.Keyword: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.Keyword case'); }
        case AST_TOKEN_TYPES.Null: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.Null case'); }
        case AST_TOKEN_TYPES.Numeric: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.Numeric case'); }
        case AST_TOKEN_TYPES.Punctuator: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.Punctuator case'); }
        case AST_TOKEN_TYPES.RegularExpression: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.RegularExpression case'); }
        case AST_TOKEN_TYPES.String: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.String case'); }
        case AST_TOKEN_TYPES.Template: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.Template case'); }
        case AST_TOKEN_TYPES.Block: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.Block case'); }
        case AST_TOKEN_TYPES.Line: { throw new Error('Not implemented yet: AST_TOKEN_TYPES.Line case'); }

        default: {
            return undefined;
        }
    }
};

export const getReturnExpression = (node: TSESTree.Node) => {
    if (node.type !== AST_NODE_TYPES.AwaitExpression) return node;
    if (closest(node, AST_NODE_TYPES.TryStatement)) return node;
    return node.argument;
};

export const getValue = (token: TSESTree.Token) => {
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    switch (token.type) {
        case AST_TOKEN_TYPES.Identifier: {
            if (token.value.startsWith('#')) return token.value.slice(1);
            return token.value;
        }
        case AST_TOKEN_TYPES.JSXIdentifier:
        case AST_TOKEN_TYPES.JSXText: {
            return token.value;
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

export const isFunctionLike = (
    node?: null | TSESTree.Node,
): node is TSESTree.ArrowFunctionExpression | TSESTree.FunctionDeclaration | TSESTree.FunctionExpression & { returnType?: TSESTree.TSTypeAnnotation } => {
    const allowedTypes = [
        AST_NODE_TYPES.ArrowFunctionExpression,
        AST_NODE_TYPES.FunctionDeclaration,
        AST_NODE_TYPES.FunctionExpression,
    ];
    return node ? allowedTypes.includes(node.type) && 'returnType' in node : false;
};

export const isIdentifierName = (node: null | TSESTree.Node | undefined, name?: unknown) => {
    if (!isIdentifier(node)) return false;
    if (typeof name === 'function') return Boolean((name as (name: string) => unknown)(node.name));
    if (Array.isArray(name)) return name.includes(node.name);
    return node.name === name;
};

export const isSameIdentifier = (a: null | TSESTree.Node | undefined, b: null | TSESTree.Node | undefined) => a?.type === AST_NODE_TYPES.Identifier && b?.type === a.type && a.name === b.name;

export const isIdentifierFunction = (node?: TSESTree.Node) => {
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

const mut_warned = new Set<string>();

export const warnOnce = (message: string): void => {
    if (mut_warned.has(message)) return;

    mut_warned.add(message);
    console.warn(message);
};

export const wrap = <T, R = T>(input: T, callback: (input: T) => R) => callback(input);
