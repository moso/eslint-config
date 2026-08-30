import process from 'node:process';

import { isPackageExists } from 'local-pkg';

import packageJson from '../package.json' with { type: 'json' };
import { interopDefault } from './utils';

import type { ESLint, Linter } from 'eslint';

/**
 * Mirrors at type level what `interopDefault` does at runtime.
 */
type Interop<T> = T extends { default: infer U } ? U : T;

type Loaded<Id> = Id extends keyof PackageTypes ? Interop<PackageTypes[Id]> : ESLint.Plugin;

type LoadedPackages<Ids extends ReadonlyArray<string>> = { -readonly [K in keyof Ids]: Loaded<Ids[K]> };

/**
 * `package name`: `module type`, unwrapped through `Interop` by `Loaded`.
 *
 * Only packages whose typed surface is actually used
 * (parsers, or plugins whose `.configs[...].rules` are read) need an entry;
 * anything unlisted falls back to `ESLint.Plugin`.
 *
 * This module is deliberately not re-exported from the package entry,
 * so the `typeof import(...)` references to optional peer dependencies
 * never reach consumers' declaration graphs.
 */
type PackageTypes = {
    '@e18e/eslint-plugin': typeof import('@e18e/eslint-plugin');
    '@eslint-react/eslint-plugin': typeof import('@eslint-react/eslint-plugin');
    '@eslint/js': typeof import('@eslint/js');
    '@next/eslint-plugin-next': typeof import('@next/eslint-plugin-next');
    '@stylistic/eslint-plugin': typeof import('@stylistic/eslint-plugin');
    '@typescript-eslint/parser': Linter.Parser;
    'astro-eslint-parser': Linter.Parser;
    'eslint-config-flat-gitignore': typeof import('eslint-config-flat-gitignore');
    'eslint-merge-processors': typeof import('eslint-merge-processors');
    'eslint-plugin-astro': typeof import('eslint-plugin-astro');
    'eslint-plugin-functional': typeof import('eslint-plugin-functional');
    'eslint-plugin-jsx-a11y': typeof import('eslint-plugin-jsx-a11y');
    'eslint-plugin-n': typeof import('eslint-plugin-n');
    'eslint-plugin-react-you-might-not-need-an-effect': typeof import('eslint-plugin-react-you-might-not-need-an-effect');
    'eslint-plugin-regexp': typeof import('eslint-plugin-regexp');
    'eslint-plugin-unicorn': typeof import('eslint-plugin-unicorn');
    'eslint-plugin-vue': VuePlugin;
    'eslint-plugin-vuejs-accessibility': typeof import('eslint-plugin-vuejs-accessibility');
    'eslint-processor-vue-blocks': typeof import('eslint-processor-vue-blocks');
    'jsonc-eslint-parser': Linter.Parser;
    'toml-eslint-parser': Linter.Parser;
    'vue-eslint-parser': Linter.Parser;
    'yaml-eslint-parser': Linter.Parser;
};

type VueModule = typeof import('eslint-plugin-vue');

/**
 * The runtime shape of `eslint-plugin-vue`.
 * Its published `processors` type is looser than `Linter.Processor`, so it is tightened here.
 */
type VuePlugin = ESLint.Plugin & Omit<VueModule, 'processors'> & {
    configs: VueModule['configs'];
    processors: Record<keyof VueModule['processors'], Linter.Processor>;
};

const scopeURL = import.meta.dirname;

/**
 * The optional peer dependencies in a self-maintained list.
 */
const optionalPeers: ReadonlySet<string> = new Set(Object.keys(packageJson.peerDependenciesMeta));

/**
 * Whether `name` resolves from this package's own directory (not the user's cwd).
 */
const isPackageInScope = (name: string): boolean => isPackageExists(name, { paths: [scopeURL] });

/**
 * Whether an install prompt could ever be shown: a TTY outside CI.
 */
const isInteractive = (): boolean => {
    if (Boolean(process.env.CI)) return false;
    return process.stdout.isTTY;
};

/**
 * Offer to install missing packages through an interactive prompt.
 * Only called from `loadPackages` after it has verified the session is interactive,
 * and the packages are genuinely missing.
 *
 * @param missingPackages - Package names to offer for installation.
 */
const ensurePackages = async (missingPackages: ReadonlyArray<string>): Promise<void> => {
    const prompt = await import('@clack/prompts');
    const result = await prompt.confirm({
        message: missingPackages.length === 1
            ? `${missingPackages[0]} is required. Do you want to install it?`
            : `These packages are required: ${missingPackages.join(', ')}.\nDo you want to install them?`,
    });

    if (result === true) {
        const { installPackage } = await import('@antfu/install-pkg');
        await installPackage([...missingPackages], { dev: true });
    }
};

/**
 * Dynamically import a list of packages, unwrapping default exports.
 *
 * In interactive sessions, missing packages trigger an install prompt first.
 * The package-name literals are mapped to module types through `PackageTypes`,
 * so call sites destructure a fully typed tuple without casts:
 * `const [plugin] = await loadPackages(['pkg'])`.
 *
 * @param packageIds - Package names to import, in order.
 * @returns The imported modules (default exports unwrapped), in input order.
 */
export const loadPackages = async <const Ids extends ReadonlyArray<string>>(
    packageIds: Ids,
): Promise<LoadedPackages<Ids>> => {
    if (isInteractive()) {
        const missing = packageIds.filter((id) => optionalPeers.has(id) && !isPackageInScope(id));
        if (missing.length > 0) await ensurePackages(missing);
    }

    return Promise.all(
        packageIds.map(async (id): Promise<unknown> => interopDefault(import(id))),
    ) as Promise<LoadedPackages<Ids>>;
};
