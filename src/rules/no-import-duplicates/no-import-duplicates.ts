import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

export default createRule({
    name: 'no-import-duplicates',
    meta: {
        type: 'problem',
        docs: {
            description: 'Fix duplicates of imports.',
            recommended: 'recommended',
            url: 'https://github.com/antfu/eslint-plugin-antfu/blob/main/src/rules/import-dedupe.md',
        },
        fixable: 'code',
        schema: [],
        messages: {
            noImportDuplicates: 'No import duplicates expected.',
        },
    },
    create: (context) => ({
        ImportDeclaration(node: TSESTree.ImportDeclaration) {
            if (node.specifiers.length <= 1) return;

            node.specifiers.reduce((mut_names, x) => {
                const id = x.local.name;
                if (mut_names.has(id)) {
                    context.report({
                        node,
                        loc: {
                            start: x.loc.end,
                            end: x.loc.start,
                        },
                        messageId: 'noImportDuplicates',
                        fix: (fixer) => {
                            const y = x.range[0];
                            let mut_z = x.range[1];
                            if (context.sourceCode.text[mut_z] === ',') mut_z += 1;

                            return fixer.removeRange([y, mut_z]);
                        },
                    });
                }
                mut_names.add(id);
                return mut_names;
            }, new Set<string>());
        },
    }),
});
