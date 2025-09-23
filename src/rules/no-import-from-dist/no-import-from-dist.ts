import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

const isDist = (path: string): boolean =>
    (path.startsWith('.') && (/\/dist(?:\/|$)/u).test(path)) || path === 'dist';

export default createRule({
    name: 'no-import-from-dist',
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent importing modules located in the `dist` folder.',
            recommended: 'recommended',
            url: 'https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/no-import-dist.ts',
        },
        schema: [],
        messages: {
            noImportFromDist: 'Do not import modules from the `dist` folder. Got {{path}}.',
        },
    },
    create: (context) => ({
        ImportDeclaration: (node: TSESTree.ImportDeclaration) => {
            if (isDist(node.source.value)) {
                context.report({
                    node,
                    messageId: 'noImportFromDist',
                    data: { path: node.source.value },
                });
            }
        },
    }),
});
