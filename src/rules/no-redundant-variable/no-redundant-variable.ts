import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';

import {
    createRule,
    getReturnExpression,
    isSameIdentifier,
    wrap,
} from '../utils';

import type { TSESTree } from '@typescript-eslint/utils';
import type { ReportFixFunction, SourceCode } from '@typescript-eslint/utils/ts-eslint';

const isReduntantVariable = (
    node: TSESTree.Node | undefined,
    exit: TSESTree.ReturnStatement,
): node is TSESTree.VariableDeclaration => {
    if (!node) return false;

    return (
        node.type === AST_NODE_TYPES.VariableDeclaration &&
        node.declarations.length === 1 &&
        node.declarations.some(({ init, id }) => init !== null && isSameIdentifier(exit.argument, id))
    );
};

const isReduntantVariableFixer = (
    source: Readonly<SourceCode>,
    variable: TSESTree.VariableDeclaration,
    exit: TSESTree.ReturnStatement,
): ReportFixFunction => (fixer) => {
        const { init, id } = variable.declarations[0];
        if (!init || !exit.argument) return null;

        const replaced = getReturnExpression(init);
        const modified = wrap(source.getText(replaced), (input) => {
            if (!id.typeAnnotation) return input;

            const annotation = source.getText(id.typeAnnotation.typeAnnotation);
            return `(${input}) as ${init.type === AST_NODE_TYPES.AwaitExpression ? `Promise<${annotation}>` : annotation}`;
        });

        return [fixer.remove(variable), fixer.replaceText(exit.argument, modified)];
    };

const isReturnStatement = (node: TSESTree.Node): node is TSESTree.ReturnStatement => (
    node.type === AST_NODE_TYPES.ReturnStatement && isIdentifier(node.argument)
);

export default createRule({
    name: 'no-redundant-variable',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow reduntant variables.',
            recommended: 'stylistic',
            url: 'https://dimensiondev.github.io/eslint-plugin/src/rules/no-redundant-variable',
        },
        fixable: 'code',
        schema: [],
        messages: {
            noRedundantVar: 'Disallow reduntant variables.',
        },
    },
    create: (context) => ({
        BlockStatement: ({ body }: TSESTree.BlockStatement) => {
            const exit = body.find(isReturnStatement);
            if (!exit) return;

            const previous = body[body.indexOf(exit) - 1];
            if (!isReduntantVariable(previous, exit)) return;

            context.report({
                node: exit,
                messageId: 'noRedundantVar',
                fix: isReduntantVariableFixer(context.sourceCode, previous, exit),
            });
        },
    }),
});
