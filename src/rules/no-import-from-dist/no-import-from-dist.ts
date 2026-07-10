import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { createRuleType } from '../utils';

const DIST_CHECK = /\/dist(?:\/|$)/u;

const isDist = (path: string): boolean =>
    (path.startsWith('.') && DIST_CHECK.test(path)) || path === 'dist';

const ruleNoImportFromDist: createRuleType = createRule({
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

export default ruleNoImportFromDist;
