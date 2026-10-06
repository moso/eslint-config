import { loadPackages } from '../tools';
import { memoize } from '../utils';

import type { Linter } from 'eslint';

import type { OptionsSecurity, TypedFlatConfigItem } from '../types';

export const security = async (options: Readonly<OptionsSecurity>): Promise<TypedFlatConfigItem[]> => {
    const { overrides, severity } = options;

    const [securityPlugin] = await loadPackages(['eslint-plugin-security']);

    const recommended = securityPlugin.configs?.['recommended'] as Linter.Config | undefined;

    const baseRules = severity === 'lite'
        ? recommended?.rules
        : Object.fromEntries(Object.keys(recommended?.rules ?? {}).map((key) => [key, 'error']));

    return [
        {
            name: 'moso/security',
            plugins: {
                security: memoize(securityPlugin, 'eslint-plugin-security'),
            },
            rules: {
                ...baseRules,

                'security/detect-unsafe-regex': 'off',

                ...(severity !== 'strict' && {
                    'security/detect-non-literal-fs-filename': 'off',
                    'security/detect-non-literal-regexp': 'off',
                    'security/detect-object-injection': 'off',
                }),

                ...overrides,
            },
        },
    ];
};
