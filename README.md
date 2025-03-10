# @moso/eslint-config

[![npm](https://img.shields.io/npm/v/@moso/eslint-config.svg)](https://npmjs.com/package/@moso/eslint-config)

Flat ESLint config for JavaScript, TypeScript, Vue, React, and more.

[Legacy Version](https://github.com/moso/eslint-config/tree/legacy).

## Features

- [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new) with reasonable but opinionated defaults
- Single quotes, semi enabled, sorted imports, dangling commas,
- Aimed to be used without Prettier
- Designed to work with JSX, TypeScript, Vue, and React out of the box
- [Stylistic](https://eslint.style) rules implemented by default
- Lints for json and yaml
- Respects `.gitignore` by default
- Requires ESLint v9.5.0+

> [!NOTE]
> Since v1.0.0, this config is rewritten for the new [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new) format.
>
> ESLint v9.5.0+ is now required.

> [!WARNING]
> While I'm very appreciative with every single install of this config, please keep in mind that this config is still a **personal**, opinionated config. How I like things set up might not fit everyone, or every usecase.
>
> If you're using this config directly, I suggest you review the changes with every update. Or if you want more control over the very core of this config, feel free to fork it. Thanks!

## Usage

### Install

> I like to use [Bun](https://bun.sh) because it's hella fast. Thus all the install instructions are with Bun. If you use something else, check the syntax with your favorite package manager.

```bash
bun add -dev eslint @moso/eslint-config
```

Create `eslint.config.js` in the root of your project:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso();
```

<details>
<summary>
Combine with legacy config:
</summary>

If you still use some configs from the legacy `eslintrc` format, you can use the [`@eslint/eslintrc`](https://npmjs.com/package/@eslint/eslintrc) package to convert them to the flat config.

```js
// eslint.config.js
import moso from '@moso/eslint-config';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat()

export default moso(
    {
        ignores: [],
    },

    // Legacy config
    ...compat.config({
        extends: [
            'eslint:recommended',
            // Other extends...
        ],
    })

    // Other flat configs...
);
```

> Note that `.eslintignore` no longer works in Flat config, see [customization](#customization) for more details.

</details>


### Add script for package.json

For example:

```json
{
    "scripts": {
        "lint": "eslint",
        "lint:fix": "eslint --fix"
    }
}
```

## VS Code support (auto fix)

<details>
<summary>Details</summary>

Install [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

Add the following settings to your `.vscode/settings.json`:

```jsonc
{
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
    { "rule": "@stylistic/*", "severity": "off", "fixable": true },
    { "rule": "*-indent", "severity": "off", "fixable": true },
    { "rule": "*-spacing", "severity": "off", "fixable": true },
    { "rule": "*-spaces", "severity": "off", "fixable": true },
    { "rule": "*-order", "severity": "off", "fixable": true },
    { "rule": "*-dangle", "severity": "off", "fixable": true },
    { "rule": "*-newline", "severity": "off", "fixable": true },
    { "rule": "*quotes", "severity": "off", "fixable": true },
    { "rule": "*semi", "severity": "off", "fixable": true }
  ],

  // Enable eslint for all supported languages
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue",
    "json",
    "jsonc",
    "yaml"
  ]
}
```

</details>

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

The `moso` configurator function accepts any number of custom config overrides. And certain rules will only be enabled for specific file types. Example, `vue/*` rules are only applied on `.vue`-files. If you want to override the rules, you need to specify the file extension:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso(
    {
        // First argument are configurations for moso's config
        vue: true,
        typescript: true,
    },
    {
        // Second argument and beyond are ESLint Flat Configs
        // You can have as many as you want here.

        // Example of overriding vue/* rules on `.vue`-files using the Vue file glob:
        files: ['**/*.vue'],
        rules: {
            'vue/multi-word-component-names': ['error', { ignores: [] }],
        },
    },
    {
        rules: {},
    },
);
```

Since v1.0.0, the configurator function returns a `FlatConfigComposer`-object from [antfu](https://github.com/antfu)'s [`eslint-flat-config-utils`](https://github.com/antfu/eslint-flat-config-utils#composer), which gives you even more flexibility when composing the config, as you can `dot` your way through:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso()
    .prepend(
        // Configs before the main config
    )
    .override(
        // Override any named config
        'moso/javascript/rules',
        {
            rules: {
                'no-var': 'off',
            },
        },
    )
    // You can also remove rules entirely
    .removeRules(
        // ...
    );
```

<details>
<summary>Advanced example</summary>

You can import fine-grained configs and compose them as you want. Don't do this unless you know exactly what you're doing.

```js
import {
    combine,
    comments,
    ignores,
    imports,
    javascript,
    jsdoc,
    jsonc,
    node,
    sortPackageJson,
    sortTsconfig,
    stylistic,
    typescript,
    unicorn,
    vue,
    yaml,
} from '@moso/eslint-config';

export default combine(
    ignores(),
    javascript(/* options */),
    comments(),
    node(),
    jsdoc(),
    imports(),
    unicorn(),
    typescript(/* options */),
    stylistic(),
    vue(/* options */),
    jsonc(),
    yaml(),
);
```

</details>

## Optional configs

There are multiple configs that are deemed "optional". Most of them are set to `true` (enabled), some are `auto-detect`. An example of auto-detection, TypeScript, Vue, and React are set to `auto-detect`, as there are checks in those configs and enable them if their packages are present. But should you want to enable/disable these explicitly, or if my check doesn't auto-detect it, this is how it's done:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    // Enable TypeScript
    typescript: true,

    // Enable Vue
    vue: true,

    // Enable React
    react: true,
});
```

**Note**: Since Vue 2 has [reached EOL](https://v2.vuejs.org/eol), this config does not support Vue 2. If you need to support for Vue 2, you'll need to disable the imported configs from Vue 3, and replace them with the Vue 2 ones. You can see an inspiring example on [`eslint-plugin-vue`](https://eslint.vuejs.org/user-guide/#usage). I recommend upgrading to Vue 3 if possible.

## Optional rules

This config also provides some optional plugins/rules for extended usage.

### Perfectionist

The plugin [`eslint-plugin-perfectionist`](https://perfectionist.dev) allows you to sort object keys, imports, types, enums and JSX props with auto fix. I love it, and encourage everyone to use it. It gives you a lot more consistency across projects and developers. The plugin is installed and enabled by default, but only rules for sorting imports are activated.

If you wish to override or extend it, you can by overriding the `perfectionist` integration, or adding to your own `rules`.

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso(
    {
        // Overriding the sort-imports
        perfectionist: {
            overrides: {
                'perfectionist/sort-imports': 'off',
            },
        },
    },
    {
        // Or adding your own rules
        rules: {
            'perfectionist/sort-enums': ['error', { type: 'natural', order: 'asc', locales: 'da-DK' }],
        },
    },
);
```

However, you can also opt-in to a rule in each file individually using [configuration comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments-1).

```js
/* eslint perfectionist/sort-objects: 'error' */
const objectWantedToSort = {
    a: 2,
    b: 1,
    c: 3,
};
```

**Note**: If you want to disable it, you can do it in two ways.

#### Individually

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    // Disable Perfectionist
    perfectionist: false,
});
```

#### Part of `lessOpinionated`

There's an option to actually make this config "less opinionated". This will also strip most of the [`@stylistic`](https://eslint.style) rules, but more about that at the [Less Opnionated](#i-want-it-less-opnionated)-section.

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    // Less opnionated
    lessOpnionated: true,
});
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

### Editor specific non-fixes

Some rules are deemed as 'non-fixable' when inside your editor with ESLint integration:

- [`prefer-const`](https://eslint.org/docs/rules/prefer-const)
- [`unused-imports/no-unused-imports`](https://github.com/sweepline/eslint-plugin-unused-imports)
- [`vitest/no-only-tests`](https://github.com/levibuzolic/eslint-plugin-no-only-tests)

This is to prevent unused imports from getting removed by your editor when refactoring to get a better developer experience. However, the rules will still be applied when you run ESLint from your terminal. You can disable this behavior like so:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    isInEditor: false,
});
```

### Lint Staged

Linting and auto-fixing before every commit is easy, you just add the following to your `package.json`:

```json
{
    "simple-git-hooks": {
        "pre-commit": "bunx lint-staged"
    },
    "lint-staged": {
        "*": "eslint --fix"
    }
}
```

and then

```bash
bun add -dev lint-staged simple-git-hooks

# to activate the hooks
bunx simple-git-hooks
```

## View which rules are enabled

[Antfu](https://github.com/antfu) built a visual tool that can help you view what rules are enabled in your project: [@eslint/config-inspector](https://github.com/eslint/config-inspector).

To view it in action, navigate to the root of your project that contains your `eslint.config.js` and run:

```bash
bunx @eslint/config-inspector
```

## FAQ

### I want it less opnionated

No problem. I've extracted the things that I've deemed *very opinionated* in each integration, and made a setting that helps you disable all of it in one go.

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    lessOpinionated: true,
});
```

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
- React detection, no need to enable it
- Includes dependencies rather than asking you to install them
- Deprecated Vue 2 support
- Simplification in some areas
- Less clutter, shipping with less "smart" features
- No dangerous plugin renaming, except for `eslint-plugin-n` which is renamed to `node` for readability

## License

[MIT](./LICENSE) License
