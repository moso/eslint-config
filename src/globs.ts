export const GLOB_SRC_EXT = '?([cm])[jt]s?(x)';
export const GLOB_SRC = '**/*.?([cm])[jt]s?(x)';

export const GLOB_JS = '**/*.?([cm])js';
export const GLOB_JSX = '**/*.?([cm])jsx';

export const GLOB_TS = '**/*.?([cm])ts';
export const GLOB_TSX = '**/*.?([cm])tsx';
export const GLOB_DTS = '**/?(.)*.d.?([cm])ts';

export const GLOB_ROOT_JS = '?(.)*.?([cm])js';
export const GLOB_ROOT_JSX = '?(.)*.?([cm])jsx';

export const GLOB_ROOT_TS = '?(.)*.?([cm])ts';
export const GLOB_ROOT_TSX = '?(.)*.?([cm])tsx';
export const GLOB_ROOT_DTS = '?(.)*.d.?([cm])ts';

export const GLOB_MJS = '**/*.mjs';
export const GLOB_CJS = '**/*.cjs';
export const GLOB_TYPINGS = 'typings/**/?(.)*.?([cm])ts';

export const GLOB_STYLE = '**/?(.)*.{c,le,sa,sc,pc,postc}ss';
export const GLOB_CSS_IN_JS = '**/*.css.{j,t}s';

export const GLOB_JSON = '**/*.json';
export const GLOB_JSON5 = '**/*.json5';
export const GLOB_JSONC = '**/*.jsonc';

export const GLOB_ASTRO = '**/*.astro';
export const GLOB_ASTRO_TS = '**/*.astro/*.ts';
export const GLOB_MARKDOWN = '**/*.md';
export const GLOB_TOML = '**/*.toml';
export const GLOB_VUE = '**/*.vue';
export const GLOB_YAML = '**/*.y?(a)ml';

export const GLOB_TESTS: string[] = [
    `**/__tests__/**/?(.)*.${GLOB_SRC_EXT}`,
    `**/?(.)*.spec.${GLOB_SRC_EXT}`,
    `**/?(.)*.test.${GLOB_SRC_EXT}`,
    `**/?(.)*.bench.${GLOB_SRC_EXT}`,
    `**/?(.)*.benchmark.${GLOB_SRC_EXT}`,
];

export const GLOB_NODE_MODULES = '**/node_modules' as const;
export const GLOB_DIST = '**/dist' as const;
export const GLOB_LOCKFILE: string[] = [
    '**/package-lock.json',
    '**/bun.lock?(b)',
    '**/pnpm-lock.yaml',
    '**/yarn.lock',
];

export const GLOB_AI: string[] = [
    '**/.agents',
    '**/.claude',
    '**/.context',
    '**/.*/skills',
];

export const GLOB_EXCLUDE: string[] = [
    GLOB_NODE_MODULES,
    GLOB_DIST,
    ...GLOB_LOCKFILE,

    '**/fixtures',
    '**/lib',
    '**/output',
    '**/coverage',
    '**/temp',
    '**/tmp',
    '**/.cache',
    '**/.changeset',
    '**/.history',
    '**/.idea',
    '**/.next',
    '**/.nitro',
    '**/.nuxt',
    '**/.output',
    '**/.temp',
    '**/.tmp',
    '**/.vercel',
    '**/.vite-inspect',
    '**/.vitepress/cache',
    '**/.yarn',

    '**/CHANGELOG*.md',
    '**/?(.)*.min.*',
    '**/LICENSE*',
    '**/__snapshots__',

    '**/auto-import?(s)?(.d).ts',
    '**/components?(.d).ts',
    '**/typegen?(.d).ts',
    '**/vite.config.*.timestamp-*',

    GLOB_CSS_IN_JS,
    ...GLOB_AI,
];
