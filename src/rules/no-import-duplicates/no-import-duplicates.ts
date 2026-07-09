import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { createRuleType } from '../utils';

const ruleNoImportDuplicates: createRuleType = createRule({
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
                        node: x,
                        messageId: 'noImportDuplicates',
                        fix: (fixer) => {
                            const { text } = context.sourceCode;
                            let mut_start = x.range[0];
                            let mut_end = x.range[1];

                            if (text[mut_end] === ',') mut_end += 1;
                            else {
                                const comma = text.lastIndexOf(',', mut_start - 1);
                                if (comma !== -1 && text.slice(comma + 1, mut_start).trim() === '') mut_start = comma;
                            }

                            return fixer.removeRange([mut_start, mut_end]);
                        },
                    });
                }
                mut_names.add(id);
                return mut_names;
            }, new Set<string>());
        },
    }),
});

export default ruleNoImportDuplicates;
