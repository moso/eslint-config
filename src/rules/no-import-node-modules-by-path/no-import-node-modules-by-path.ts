import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

export default createRule({
    name: 'no-import-node-modules-by-path',
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent importing modules from the `node_modules` folder by relative or absolute path.',
            recommended: 'recommended',
            url: 'https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-import-node-modules-by-path.ts',
        },
        schema: [],
        messages: {
            noImportNodeModulesByPath: 'Do not import modules from the `node_modules` folder by path.',
        },
    },
    create: (context) => ({
        'ImportDeclaration': (node: TSESTree.ImportDeclaration) => {
            if (node.source.value.includes('/node_modules/')) {
                context.report({
                    node,
                    messageId: 'noImportNodeModulesByPath',
                });
            }
        },
        'CallExpression[callee.name="require"]': (node: TSESTree.CallExpression) => {
            const firstArg = node.arguments[0];
            if (firstArg.type === AST_NODE_TYPES.Literal &&
                typeof firstArg.value === 'string' &&
                firstArg.value.includes('/node_modules/')) {
                context.report({
                    node,
                    messageId: 'noImportNodeModulesByPath',
                });
            }
        },
    }),
});
