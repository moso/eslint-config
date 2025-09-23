// Modules that may or may not need types
declare module 'eslint-plugin-no-only-tests' {
    import type { ESLint } from 'eslint';

    const exprt: ESLint.Plugin;
    export = exprt;
}
