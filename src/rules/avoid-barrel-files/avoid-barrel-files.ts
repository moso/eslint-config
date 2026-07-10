import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';

import type { createRuleType } from '../utils';

export type Options = {
    amountOfExportsToConsiderModuleAsBarrel: number;
};

const declarationTypes: ReadonlySet<AST_NODE_TYPES> = new Set([
    AST_NODE_TYPES.ClassDeclaration,
    AST_NODE_TYPES.FunctionDeclaration,
    AST_NODE_TYPES.TSInterfaceDeclaration,
    AST_NODE_TYPES.TSTypeAliasDeclaration,
]);

const ruleAvoidBarrelFiles: createRuleType = createRule({
    name: 'avoid-barrel-files',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow *authoring* barrel files in your project.',
            recommended: 'recommended',
            url: 'https://github.com/thepassle/eslint-plugin-barrel-files/blob/main/docs/rules/avoid-barrel-files.md',
        },
        schema: [
            {
                type: 'object',
                description: 'Minimum amount of exports to consider module as barrel file.',
                properties: {
                    amountOfExportsToConsiderModuleAsBarrel: { type: 'number', default: 3 },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            avoidBarrelFiles: 'Barrel file detected.',
        },
    },
    defaultOptions: [{ amountOfExportsToConsiderModuleAsBarrel: 3 }] as [Options],
    create: (context, [{ amountOfExportsToConsiderModuleAsBarrel }]) => ({
        Program(node: TSESTree.Program) {
            const { declarationCount, exportCount } = node.body.reduce(
                ({ declarationCount, exportCount }, statement) => {
                    if (statement.type === AST_NODE_TYPES.VariableDeclaration)
                        return { declarationCount: declarationCount + statement.declarations.length, exportCount };

                    if (declarationTypes.has(statement.type))
                        return { declarationCount: declarationCount + 1, exportCount };

                    if (statement.type === AST_NODE_TYPES.ExportNamedDeclaration)
                        return { declarationCount, exportCount: exportCount + statement.specifiers.length };

                    if (statement.type === AST_NODE_TYPES.ExportAllDeclaration && statement.exportKind !== 'type')
                        return { declarationCount, exportCount: exportCount + 1 };

                    if (statement.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
                        if (
                            statement.declaration.type === AST_NODE_TYPES.FunctionDeclaration ||
                            statement.declaration.type === AST_NODE_TYPES.CallExpression
                        )
                            return { declarationCount: declarationCount + 1, exportCount };

                        if (statement.declaration.type === AST_NODE_TYPES.ObjectExpression)
                            return { declarationCount, exportCount: exportCount + statement.declaration.properties.length };

                        return { declarationCount, exportCount: exportCount + 1 };
                    }

                    return { declarationCount, exportCount };
                },
                { declarationCount: 0, exportCount: 0 },
            );

            if (exportCount > declarationCount && exportCount > amountOfExportsToConsiderModuleAsBarrel) {
                context.report({
                    node,
                    messageId: 'avoidBarrelFiles',
                });
            }
        },
    }),
});

export default ruleAvoidBarrelFiles;
