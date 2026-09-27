import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { isIdentifierName, makeProgramListener } from './utils';

import type { TSESTree } from '@typescript-eslint/utils';

describe('isIdentifierName', () => {
    it('returns false when no name matcher is given', () => {
        const identifier = { name: 'foo', type: AST_NODE_TYPES.Identifier } as TSESTree.Node;

        expect(isIdentifierName(identifier)).toBe(false);
    });
});

describe('makeProgramListener', () => {
    it('scans nothing when the program carries no tokens or comments', () => {
        const onReport = vi.fn();
        const listener = makeProgramListener(/x/u, onReport);

        listener.Program?.({} as TSESTree.Program);

        expect(onReport).not.toHaveBeenCalled();
    });
});
