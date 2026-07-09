import version from '../../package.json' with { type: 'json' };
import avoidBarrelFiles from './avoid-barrel-files/avoid-barrel-files';
import noBidi from './no-bidi/no-bidi';
import noForceCastViaTopType from './no-force-cast-via-top-type/no-force-cast-via-top-type';
import noImportDuplicates from './no-import-duplicates/no-import-duplicates';
import noImportFromDist from './no-import-from-dist/no-import-from-dist';
import noImportNodeModulesByPath from './no-import-node-modules-by-path/no-import-node-modules-by-path';
import noInvisibleCharacters from './no-invisible-characters/no-invisible-characters';
import noRedundantVariable from './no-redundant-variable/no-redundant-variable';
import noStringInterpolation from './no-string-interpolation/no-string-interpolation';
import noTopLevelAwait from './no-top-level-await/no-top-level-await';
import noUnneededArrayFlatMap from './no-unneeded-array-flat-map/no-unneeded-array-flat-map';
import preferEarlyReturn from './prefer-early-return/prefer-early-return';
import preferFetch from './prefer-fetch/prefer-fetch';
import preferReduceOverChaining from './prefer-reduce-over-chaining/prefer-reduce-over-chaining';

import type { ESLint, Linter, Rule } from 'eslint';

type PluginConfig = {
    configs: {
        recommended: Linter.Config;
    };
    meta: {
        name: string;
        version: string;
    };
    rules: {
        'avoid-barrel-files': Rule.RuleModule;
        'no-bidi': Rule.RuleModule;
        'no-force-cast-via-top-type': Rule.RuleModule;
        'no-import-duplicates': Rule.RuleModule;
        'no-import-from-dist': Rule.RuleModule;
        'no-import-node-modules-by-path': Rule.RuleModule;
        'no-invisible-characters': Rule.RuleModule;
        'no-redundant-variable': Rule.RuleModule;
        'no-string-interpolation': Rule.RuleModule;
        'no-top-level-await': Rule.RuleModule;
        'no-unneeded-array-flat-map': Rule.RuleModule;
        'prefer-early-return': Rule.RuleModule;
        'prefer-fetch': Rule.RuleModule;
        'prefer-reduce-over-chaining': Rule.RuleModule;
    };
};

// eslint-disable-next-line @moso/no-force-cast-via-top-type -- TSESLint rule modules are structurally incompatible with ESLint's Rule.RuleModule
const plugin = {
    meta: {
        name: '@moso/eslint-plugin',
        version,
    },
    rules: {
        'avoid-barrel-files': avoidBarrelFiles,
        'no-bidi': noBidi,
        'no-force-cast-via-top-type': noForceCastViaTopType,
        'no-import-duplicates': noImportDuplicates,
        'no-import-from-dist': noImportFromDist,
        'no-import-node-modules-by-path': noImportNodeModulesByPath,
        'no-invisible-characters': noInvisibleCharacters,
        'no-redundant-variable': noRedundantVariable,
        'no-string-interpolation': noStringInterpolation,
        'no-top-level-await': noTopLevelAwait,
        'no-unneeded-array-flat-map': noUnneededArrayFlatMap,
        'prefer-early-return': preferEarlyReturn,
        'prefer-fetch': preferFetch,
        'prefer-reduce-over-chaining': preferReduceOverChaining,
    },
} as unknown as ESLint.Plugin;

const recommended: Record<string, Linter.RuleSeverity> = {
    '@moso/avoid-barrel-files': 'error',
    '@moso/no-bidi': 'error',
    '@moso/no-force-cast-via-top-type': 'error',
    '@moso/no-import-duplicates': 'error',
    '@moso/no-import-from-dist': 'error',
    '@moso/no-import-node-modules-by-path': 'error',
    '@moso/no-invisible-characters': 'error',
    '@moso/no-top-level-await': 'error',
    '@moso/prefer-reduce-over-chaining': 'error',
};

const configs: PluginConfig['configs'] = {
    recommended: {
        plugins: { '@moso': plugin },
        rules: recommended,
    },
};

export default {
    ...plugin,
    configs,
} as PluginConfig;
