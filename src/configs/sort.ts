import type { OptionsOverrides, TypedFlatConfigItem } from '../types';

/**
 * Sort package.json
 *
 * Requires `jsonc` config
 */
export const sortPackageJson = (
    options: Readonly<OptionsOverrides> = {},
): TypedFlatConfigItem[] => {
    const { overrides } = options;

    return [
        {
            name: 'moso/sort/package-json',
            files: ['**/package.json'],
            rules: {
                'jsonc/sort-array-values': [
                    'error',
                    {
                        order: { type: 'asc' },
                        pathPattern: '^files$',
                    },
                ],
                'jsonc/sort-keys': [
                    'error',
                    {
                        order: [
                            'publisher',
                            'name',
                            'displayName',
                            'type',
                            'version',
                            'private',
                            'packageManager',
                            'description',
                            'author',
                            'contributors',
                            'license',
                            'funding',
                            'homepage',
                            'repository',
                            'bugs',
                            'keywords',
                            'categories',
                            'sideEffects',
                            'imports',
                            'exports',
                            'main',
                            'module',
                            'unpkg',
                            'jsdelivr',
                            'types',
                            'typesVersions',
                            'bin',
                            'icon',
                            'files',
                            'engines',
                            'activationEvents',
                            'contributes',
                            'scripts',
                            'peerDependencies',
                            'peerDependenciesMeta',
                            'dependencies',
                            'optionalDependencies',
                            'devDependencies',
                            'pnpm',
                            'overrides',
                            'resolutions',
                            'husky',
                            'simple-git-hooks',
                            'lint-staged',
                            'eslintConfig',
                        ],
                        pathPattern: '^$',
                    },
                    {
                        order: { type: 'asc' },
                        pathPattern: '^(?:dev|peer|optional|bundled)?[Dd]ependencies(Meta)?$',
                    },
                    {
                        order: { type: 'asc' },
                        pathPattern: '^(?:resolutions|overrides|pnpm.overrides)$',
                    },
                    {
                        order: [
                            'types',
                            'import',
                            'require',
                            'default',
                        ],
                        pathPattern: '^exports.*$',
                    },
                    {
                        order: [
                            'pre-commit',
                            'prepare-commit-msg',
                            'commit-msg',
                            'post-commit',
                            'pre-rebase',
                            'post-rewrite',
                            'post-checkout',
                            'post-merge',
                            'pre-push',
                            'pre-auto-gc',
                        ],
                        pathPattern: '^(?:gitHooks|husky|simple-git-hooks)$',
                    },
                ],

                ...overrides,
            },
        },
    ];
};

/**
 * Sort tsconfig.json
 *
 * Requires `jsonc` config
 */
export const sortTsconfig = (
    options: Readonly<OptionsOverrides> = {},
): TypedFlatConfigItem[] => {
    const { overrides } = options;

    return [
        {
            name: 'moso/sort/tsconfig-json',
            files: ['**/tsconfig.json', '**/tsconfig.*.json'],
            rules: {
                'jsonc/sort-keys': [
                    'error',
                    {
                        order: [
                            'extends',
                            'compilerOptions',
                            'references',
                            'files',
                            'include',
                            'exclude',
                        ],
                        pathPattern: '^$',
                    },
                    {
                        order: [
                            'incremental',
                            'composite',
                            'tsBuildInfoFile',
                            'disableSourceOfProjectReferenceRedirect',
                            'disableSolutionSearching',
                            'disableReferencedProjectLoad',
                            'target',
                            'jsx',
                            'jsxFactory',
                            'jsxFragmentFactory',
                            'jsxImportSource',
                            'lib',
                            'moduleDetection',
                            'noLib',
                            'reactNamespace',
                            'useDefineForClassFields',
                            'emitDecoratorMetadata',
                            'experimentalDecorators',
                            'libReplacement',
                            'baseUrl',
                            'rootDir',
                            'rootDirs',
                            'customConditions',
                            'module',
                            'moduleResolution',
                            'moduleSuffixes',
                            'noResolve',
                            'paths',
                            'resolveJsonModule',
                            'resolvePackageJsonExports',
                            'resolvePackageJsonImports',
                            'typeRoots',
                            'types',
                            'allowArbitraryExtensions',
                            'allowImportingTsExtensions',
                            'allowUmdGlobalAccess',
                            'allowJs',
                            'checkJs',
                            'maxNodeModuleJsDepth',
                            'strict',
                            'strictBindCallApply',
                            'strictFunctionTypes',
                            'strictNullChecks',
                            'strictPropertyInitialization',
                            'allowUnreachableCode',
                            'allowUnusedLabels',
                            'alwaysStrict',
                            'exactOptionalPropertyTypes',
                            'noFallthroughCasesInSwitch',
                            'noImplicitAny',
                            'noImplicitOverride',
                            'noImplicitReturns',
                            'noImplicitThis',
                            'noPropertyAccessFromIndexSignature',
                            'noUncheckedIndexedAccess',
                            'noUnusedLocals',
                            'noUnusedParameters',
                            'useUnknownInCatchVariables',
                            'declaration',
                            'declarationDir',
                            'declarationMap',
                            'downlevelIteration',
                            'emitBOM',
                            'emitDeclarationOnly',
                            'importHelpers',
                            'importsNotUsedAsValues',
                            'inlineSourceMap',
                            'inlineSources',
                            'mapRoot',
                            'newLine',
                            'noEmit',
                            'noEmitHelpers',
                            'noEmitOnError',
                            'outDir',
                            'outFile',
                            'preserveConstEnums',
                            'preserveValueImports',
                            'removeComments',
                            'sourceMap',
                            'sourceRoot',
                            'stripInternal',
                            'allowSyntheticDefaultImports',
                            'esModuleInterop',
                            'forceConsistentCasingInFileNames',
                            'isolatedModules',
                            'preserveSymlinks',
                            'verbatimModuleSyntax',
                            'erasableSyntaxOnly',
                            'skipDefaultLibCheck',
                            'skipLibCheck',
                        ],
                        pathPattern: '^compilerOptions$',
                    },
                ],

                ...overrides,
            },
        },
    ];
};
