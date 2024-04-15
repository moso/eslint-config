# @moso/eslint-config [![npm](https://img.shields.io/npm/v/@moso/eslint-config.svg)](https://npmjs.com/package/@moso/eslint-config)

Flat ESLint config for JavaScript, TypeScript, Vue, and React.

[Legacy Version](https://github.com/moso/eslint-config/tree/legacy)

## Features

- Single quotes, semi enabled, dangling commas,
- Aimed to be used without Prettier
- Sorted imports, `package.json`, `tsconfig.json`...
- Reasonable but opinionated defaults
- Designed to work with TypeScript, JSX, and Vue out of the box
- [Stylistic](https://eslint.style) rules implemented by default
- Lints for json, markdown, and yaml
- [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new), compose easily!
- Respects `.gitignore`

Since [Stylistic](https://eslint.style) have taken over maintenance of `@typescript-eslint`'s rules, and ESLint [since v8.53.0](https://eslint.org/blog/2023/10/deprecating-formatting-rules) have soft-deprecated formatting rules, *and* since Stylistic's rules have merged the core ruleset into their main config, it makes more sense to use `@stylistic` whenever possible.

However, this config is aimed at simplicity, so `@stylistic/`-rules will only be applied the formatting rules that were deprecated by ESLint when linting regular JavaScript, and then use `@stylistic/`-specific rules when applied to TypeScript.

> [!NOTE]
> Since v1.0.0, this config is rewritten for the new [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new) format.

## Usage

### Install

```bash
# npm
npm i -D @moso/eslint-config

# yarn
yarn add -D @moso/eslint-config

# pnpm
pnpm i -D @moso/eslint-config

# bun
bun add -d @moso/eslint-config
```

### Create config file

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso();
```

> Note that `.eslintignore` no longer works in Flat config, see [customization](#customization) for more details.

### Add script for package.json

For example:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## VS Code support (auto fix)

Install [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

Add the following settings to your `.vscode/settings.json`:

```jsonc
{
  // Enable the ESlint flat config support
  "eslint.experimental.useFlatConfig": true,

  // Disable the default formatter, use eslint instead
  "prettier.enable": false,
  "editor.formatOnSave": false,

  // Auto fix
  "editor.codeActionsOnSave": {
   "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },

    // You can silent specific rules in you IDE, but still auto fix them
  "eslint.rules.customizations": [
    { "rule": "*-indent", "severity": "off" },
    { "rule": "*-spacing", "severity": "off" },
    { "rule": "*-spaces", "severity": "off" },
    { "rule": "*-order", "severity": "off" },
    { "rule": "*-dangle", "severity": "off" },
    { "rule": "*-newline", "severity": "off" },
    { "rule": "*quotes", "severity": "off" },
    { "rule": "*semi", "severity": "off" }
  ],

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "html",
    "markdown",
    "json",
    "jsonc",
    "yaml"
  ]
}
```

## Customization

Since v1.0, this config has been migrated to [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new). It provides much better organization and composition. And speed!

Normally you only need to import the `moso` preset:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso();
```

If you want more control, you can configure each intetegration, like so:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    // Disable stylistic formatting rules
    stylistic: false,

    // Or customize the stylistic rules
    stylistic: {
        indent: 2, // 4, or 'tab'
        quotes: 'single', // or 'double'
    },

    // TypeScript, Vue, and React are auto-detected, you can also explicitly enable them:
    typescript: true,
    react: true,
    vue: true,

    // Disable jsonc and yaml support
    jsonc: false,
    yaml: false,

    // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
    ignores: [
        '**/dist',
        // ...globs
    ],
});
```

### Rules overrides

Certain rules will only be enabled for specific file types. Example, `vue/*` rules are only applied on `.vue`-files. If you want to override the rules, you need to specify the file extension:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso(
    {
        vue: true,
        typescript: true
    },
    {
        // Remember to specify the file glob here
        files: ['**/*.vue'],
        rules: {
            'vue/multi-word-component-names': ['error', { ignores: [] }],
        },
    },
    {
        // Without the `files` array, you override general rules for all files
        rules: {
            '@stylistic/semi': ['error', 'never'],
        },
    },
);
```

However, with options overrides in each integration, it's now much easier to do:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    vue: {
        overrides: {
            'vue/multi-word-component-names': ['error', { ignores: [] }],
        },
    },
    typescript: {
        overrides: {
            '@stylistic/comma-dangle': 'off',
        },
    },
    yaml: {
        overrides: {
            // ...
        },
    },
});
```

### Pipeline

Since v1.0, the factory function also returns a pipeline object from [`eslint-flat-config-utils`](https://github.com/antfu/eslint-flat-config-utils#pipe), which enables you to chain methods for more flexibility.

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso()
    .prepend(
        // Configs before the main config
    )
    .override(
        // Overrides any named imports
        'moso/javascript/rules',
        {
            rules: {
                '@stylistic/semi': 'off',
            },
        },
    );
```

## Optional configs

Most checks are in place to auto-detect configs and enable them, but should you want to enable these manually, this is how it's done:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    // Enable Vue
    vue: true,

    // Enable React
    react: true,

    // Enable TypeScript
    typescript: true,

});
```

## Optional rules

This config also provides some optional plugins/rules for extended usage.

#### `perfectionist` (sorting)

The plugin [`eslint-plugin-perfectionist`](https://github.com/azat-io/eslint-plugin-perfectionist) allows you to sort object keys, imports, etc with auto fix.

The plugin is installed but not enabled by default.

It's recommended to opt-in on each file individually using [configuration comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments-1).

```js
/* eslint perfectionist/sort-objects: 'error' */
const objectWantedToSort = {
    a: 2,
    b: 1,
    c: 3,
};
```

### Type-aware rules

You can also optionally enable the [type-aware rules](https://typescript-eslint.io/linting/typed-linting) by passing the path of your `tsconfig.json` to the `typescript` config.

This enables for much deeper insight into your code.

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    typescript: {
        tsconfigPath: 'tsconfig.json',
    },
});
```

### Editor specific disables

Some rules are disabled when inside your editor with ESLint integration. Example: [`unused-imports/no-unused-imports`](https://www.npmjs.com/package/eslint-plugin-unused-imports).

This is to prevent unused imports from getting removed by your editor when refactoring to get a better developer experience. However, the rules will still be applied when you run ESLint from your terminal. You can disable this behavior like so:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    isInEditor: false
})
```

## View which rules are enabled

[Antfu](https://github.com/antfu) built a visual tool that can help you view what rules are enabled in your project: [@eslint/config-inspector](https://github.com/eslint/config-inspector).

To view it in action, navigate to the root of your project that contains your `eslint.config.js` and run:

```bash
npx @eslint/config-inspector
```

## FAQ

### Prettier? dprint?

You can still use these to format files that aren't linted with this config, however, I strongly recommend you only format your code with ESLint, as Pretter and other AST-reading-then-reprint projects tend to ignore stuff like the original line breaks and might also cause inconsistent diffs when commiting code.

### How to format CSS?

You will need to install and configure [`stylelint`](https://stylelint.io) yourself, unfortunately.

### I prefer `this` or `that` rule

Fine, you can always override the rules locally in your project to fit your needs. If that doesn't cut it, you're welcome to fork this project and maintain your own config.

## Inspiration

This eslint-config takes inspiration from (and uses some of) [`@antfu/eslint-config`](https://github.com/antfu/eslint-config) and [`@rubiin/eslint-config`](https://github.com/rubiin/eslint-config) respectively. Thank you to everyone who contributed to these configs.

*Most* of the rules are the same, however, there are some differences:

- Opinionated rules
- Enables Stylistic per default
- Includes dependencies rather than asking you to install them
- Simplification in some areas
- Less clutter
- No dangerous plugin renaming

## License

[MIT](./LICENSE) License
