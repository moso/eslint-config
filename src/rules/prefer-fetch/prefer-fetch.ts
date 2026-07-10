import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, isIdentifierName, isLiteralValue } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { createRuleType } from '../utils';

const ACTIVEX_OBJECT = /xmlhttp/iu;
const HTTP_SYMBOL = '$http';
const JQUERY_SYMBOLS = ['$', 'jQuery'];
const JQUERY_METHODS = [
    'ajax',
    'get',
    'getJSON',
    'getScript',
    'post',
];

const isActiveXObject = (expr: TSESTree.NewExpression): boolean =>
    isIdentifierName(expr.callee, 'ActiveXObject') && isLiteralValue(expr.arguments[0], ACTIVEX_OBJECT);

const isHTTP = ({ callee }: TSESTree.CallExpression): boolean =>
    isIdentifierName(callee, HTTP_SYMBOL) || (callee.type === AST_NODE_TYPES.MemberExpression && isIdentifierName(callee.object, HTTP_SYMBOL));

const isJQuery = ({ callee, parent }: TSESTree.CallExpression): boolean => (
    (isIdentifierName(callee, JQUERY_SYMBOLS) && parent.type === AST_NODE_TYPES.MemberExpression && isIdentifierName(parent.property, 'load')) ||
    (callee.type === AST_NODE_TYPES.MemberExpression && isIdentifierName(callee.object, JQUERY_SYMBOLS) && isIdentifierName(callee.property, JQUERY_METHODS))
);

const isRequire = (node: TSESTree.CallExpression, value: string): boolean =>
    isIdentifierName(node.callee, 'require') && isLiteralValue(node.arguments[0], value);

const isXMLHttpRequest = ({ callee }: TSESTree.NewExpression): boolean =>
    isIdentifierName(callee, 'XMLHttpRequest');

const disallowPackage = (name: string): boolean =>
    name === 'axios' || name === 'request';

const disallowXMLActiveX = (node: TSESTree.NewExpression): boolean =>
    isActiveXObject(node) || isXMLHttpRequest(node);

const disallowCE = (node: TSESTree.CallExpression): boolean =>
    isHTTP(node) || isJQuery(node) || isRequire(node, 'axios') || isRequire(node, 'request');

const rulePreferFetch: createRuleType = createRule({
    name: 'prefer-fetch',
    meta: {
        docs: {
            description: 'Enforce fetch',
            recommended: 'stylistic',
            url: 'https://dimensiondev.github.io/eslint-plugin/src/rules/prefer-fetch',
        },
        messages: {
            preferFetch: 'Should use `fetch` instead.',
        },
        schema: [],
        type: 'problem',
    },
    create: (context) => ({
        ImportDeclaration: (node: TSESTree.ImportDeclaration) => {
            const packageName = node.source.value;
            if (!disallowPackage(packageName)) return;
            context.report({ node, messageId: 'preferFetch' });
        },

        NewExpression: (node: TSESTree.NewExpression) => {
            if (!disallowXMLActiveX(node)) return;
            context.report({ node, messageId: 'preferFetch' });
        },

        CallExpression: (node: TSESTree.CallExpression) => {
            if (!disallowCE(node)) return;
            context.report({ node, messageId: 'preferFetch' });
        },
    }),
});

export default rulePreferFetch;
