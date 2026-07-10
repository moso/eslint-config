import { defineConfig } from 'tsdown';
import type { UserConfig } from 'tsdown';

const defaultConfig: UserConfig = defineConfig({
    deps: {
        neverBundle: [/^@typescript-eslint\//u, /^typescript\//u],
    },
    dts: true,
    entry: ['src/index.ts'],
    exports: true,
    format: ['esm'],
    shims: true,
});

export default defaultConfig;
