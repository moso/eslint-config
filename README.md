# @moso/eslint-config

[![npm](https://img.shields.io/npm/v/@moso/eslint-config.svg)](https://npmjs.com/package/@moso/eslint-config)

Flat ESLint config for JavaScript, TypeScript, Vue, React, and more.

## Features

- [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new) with reasonable but opinionated defaults
- [Stylistic](https://eslint.style) with single quotes, semi enabled, sorted imports, dangling commas,
- Aimed to be used without Prettier
- Designed to work with JSX, TypeScript, Vue, and React out of the box
- Applies [Functional](https://github.com/eslint-functional/eslint-plugin-functional) and [Perfectionist](https://perfectionist.dev) by default
- Lints for JSDoc, JSON, RegEx, and YAML
- Every config can be enabled/disabled
- Respects `.gitignore` by default
- Requires ESLint v9.10.0+

## Configs

This section contains a list of the plugins used in the named configs that ships with this shareable config.

\- ✅ Enabled by default  
\- ☑️ Enabled by auto-detect  
\- 🌟 Enabled unless `lessOpinionated: false`  
\- 🟨 Can be enabled manually  
\- 🎨 Stylistic rules enabled  
\- 💭 Type-aware rules available by setting the path to your `tsconfig.json`  
\- ℹ️ Accessibility rules available with `a11y: true`

<table>
<thead>
<tr>
<th align="left" width="1200" style="max-width: 100%">Plugin</th>
<th>💼</th>
<th>🎨</th>
<th>💭</th>
</tr>
</thead>
<tbody>
<tr>
<td>
<details><summary><strong>ESLint Comments</strong></summary>

[`eslint-plugin-eslint-comments`](https://eslint-community.github.io/eslint-plugin-eslint-comments)

</details>
</td>
<td valign="top">✅</td>
<td valign="top"></td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>Functional</strong></summary>

[`eslint-plugin-functional`](https://github.com/eslint-functional/eslint-plugin-functional)

</details></td>
<td valign="top">✅</td>
<td valign="top">🎨</td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>Import Lite</strong></summary>

[`eslint-plugin-import-lite`](https://github.com/9romise/eslint-plugin-import-lite)

</details></td>
<td valign="top">✅</td>
<td valign="top">🎨</td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>JavaScript</strong></summary>

[`@eslint/js`](https://eslint.org), [`eslint-plugin-de-morgan`](https://github.com/azat-io/eslint-plugin-de-morgan), [`eslint-plugin-unused-imports`](https://github.com/sweepline/eslint-plugin-unused-imports)

</details></td>
<td valign="top">✅</td>
<td valign="top"></td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>JSDoc</strong></summary>

[`eslint-plugin-jsdoc`](https://github.com/gajus/eslint-plugin-jsdoc)

</details></td>
<td valign="top">🟨</td>
<td valign="top">🎨</td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>JSONC</strong></summary>

[`eslint-plugin-jsonc`](https://ota-meshi.github.io/eslint-plugin-jsonc)

</details></td>
<td valign="top">🟨</td>
<td valign="top">🎨</td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>Node</strong></summary>

[`eslint-plugin-n`](https://github.com/eslint-community/eslint-plugin-n)

</details></td>
<td valign="top">✅</td>
<td valign="top"></td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>Perfectionist</strong></summary>

[`eslint-plugin-perfectionist`](https://perfectionist.dev)

</details></td>
<td valign="top">🌟</td>
<td valign="top"></td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>Promises</strong></summary>

[`eslint-plugin-promise`](https://github.com/eslint-community/eslint-plugin-promise)

</details></td>
<td valign="top">✅</td>
<td valign="top"></td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>React</strong></summary>

[`@eslint-react`](https://eslint-react.xyz), [`@eslint-react/dom`](https://eslint-react.xyz), [`@eslint-react/hooks-extra`](https://eslint-react.xyz), [`@eslint-react/naming-convention`](https://eslint-react.xyz), [`@eslint-react/web-api`](https://eslint-react.xyz), [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks), [`eslint-plugin-react-you-might-not-need-an-effect`](https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect), [`eslint-plugin-jsx-a11y`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

</details></td>
<td valign="top">☑️ℹ️</td>
<td valign="top">🎨</td>
<td valign="top">💭</td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>RegExp</strong></summary>

[`eslint-plugin-regexp`](https://ota-meshi.github.io/eslint-plugin-regexp)

</details></td>
<td valign="top">✅</td>
<td valign="top"></td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>Stylistic</strong></summary>

[`@stylistic/eslint-plugin`](https://eslint.style)

</details></td>
<td valign="top">🌟</td>
<td valign="top">🎨</td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>Test</strong></summary>

[`@vitest/eslint-plugin`](https://github.com/vitest-dev/eslint-plugin-vitest), [`eslint-plugin-no-only-tests`](https://github.com/levibuzolic/eslint-plugin-no-only-tests)

</details></td>
<td valign="top">🟨</td>
<td valign="top"></td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>TypeScript</strong></summary>

[`@typescript-eslint`](https://typescript-eslint.io), [`eslint-plugin-erasable-syntax-only`](https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only)

</details></td>
<td valign="top">☑️</td>
<td valign="top">🎨</td>
<td valign="top">💭</td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>Unicorn</strong></summary>

[`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn)

</details></td>
<td valign="top">✅</td>
<td valign="top"></td>
<td valign="top"></td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>Vue</strong></summary>

[`eslint-plugin-vue`](https://eslint.vuejs.org), [`eslint-plugin-vuejs-accessibility`](https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility)

</details></td>
<td valign="top">☑️ℹ️</td>
<td valign="top">🎨</td>
<td valign="top">💭</td>
</tr>
<tr>
<td valign="top">
<details><summary><strong>YAML</strong></summary>

[`eslint-plugin-yml`](https://ota-meshi.github.io/eslint-plugin-yml)

</details></td>
<td valign="top">🟨</td>
<td valign="top">🎨</td>
<td valign="top"></td>
</tr>
</tbody>
</table>

## Usage

### Install

> I like to use [Bun](https://bun.sh) because it's hella fast. Thus all the install instructions are with Bun. If you use something else, check the syntax with your favorite package manager.

```bash
bun add -d eslint @moso/eslint-config
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

Since v1.0.0, this config has been migrated to [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new). It provides much better organization and composition. And speed!

Normally you only need to import the `moso` preset:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso();
```

### Configuration Options

Configure integrations by passing options to the main function:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    // Stylistic rules (enabled by default)
    stylistic: false, // disable entirely
    stylistic: {
        indent: 2, // 4, or 'tab'
        quotes: 'single', // or 'double'
    },

    // Auto-detected, or enable explicitly
    typescript: true,
    react: true,
    vue: true,

    // File format support
    jsonc: false,
    yaml: false,

    // Replaces .eslintignore (no longer supported)
    ignores: [
        '**/dist',
        '**/node_modules',
    ],
});
```

### Overriding Rules

Pass additional flat config objects as arguments. Rules are scoped to specific file types:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso(
    {
        // First argument: moso config options
        vue: true,
        typescript: true,
    },
    {
        // Additional arguments: standard ESLint flat configs
        files: ['**/*.vue'],
        rules: {
            'vue/multi-word-component-names': ['error', { ignores: [] }],
        },
    },
    {
        // You can pass multiple config objects
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
);
```

### Advanced Composition

The config returns a `FlatConfigComposer` object from [`eslint-flat-config-utils`](https://github.com/antfu/eslint-flat-config-utils#composer), enabling chainable methods:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso()
    .prepend({
        // Configs before the main config
    })
    .override('moso/javascript/rules', {
        rules: {
            'no-var': 'off',
        },
    })
    .removeRules(
        'no-console',
        'no-debugger',
    );
```

<details>
<summary>Fine-grained config imports</summary>

You can import and compose individual configs directly. Only use this if you need granular control:

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
    comments(),
    ignores(),
    imports(),
    javascript(/* options */),
    jsdoc(),
    jsonc(),
    node(),
    stylistic(/* options */),
    typescript(/* options */),
    unicorn(),
    vue(/* options */),
    yaml(),
);
```

</details>

## Optional configs

Framework support is auto-detected based on installed packages, but can be enabled explicitly. Dependencies are not bundled and will be prompted for installation.

### React

Auto-detected if you have Gatsby, Next.js, Nextra, React, or Remix installed. Enable explicitly:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    react: true,
});
```

Install dependencies when prompted, or manually:

```bash
bun add --dev @eslint-react/eslint-plugin eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-react-you-might-not-need-an-effect
```

### Vue

Auto-detected if you have Nuxt, VitePress, or Vue installed. Enable explicitly:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    vue: true,
});
```

Install dependencies when prompted, or manually:

```bash
bun add --dev eslint-plugin-vue vue-eslint-parser eslint-processor-vue-blocks eslint-merge-processors
```

**Note**: Since Vue 2 has [reached EOL](https://v2.vuejs.org/eol), this config does not support Vue 2. If you need to support for Vue 2, you'll need to disable the imported configs from Vue 3, and replace them with the Vue 2 ones. You can see an inspiring example on [`eslint-plugin-vue`](https://eslint.vuejs.org/user-guide/#usage). I recommend upgrading to Vue 3 if possible.

### Typed Linting

You can optionally enable [typed linting](https://typescript-eslint.io/getting-started/typed-linting). These are also known as "rules that require types", or simply "type-aware rules". This enables for much deeper insight into your code.

You enable them by passing the path of your `tsconfig.json` to the `projectRoot` option.

> [!WARNING]
> Enabling these rules will come with a slight performance cost, [explained here](https://typescript-eslint.io/getting-started/typed-linting/#performance).
>
> To make things even more complicated, if you have enabled typed linting but disabled [`@stylistic`](https://eslint.style), it will also disable the type-aware rules [considered stylistic](https://typescript-eslint.io/rules/?=stylistic-typeInformation).

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso(
    {
        projectRoot: import.meta.dirname,

        // If you wish to override any of these rules, use `overridesTypeAware`:
        typescript: {
            overridesTypeAware: {
                '@typescript-eslint/no-deprecated': 'off',
            },
        },
    },
);
```

> [!NOTE]
> TypeScript will still be auto-detected if you have the `typescript`-package installed, and any non-type-aware `@typescript-eslint`-rules will still be applied. *Typed Linting* is considered as an extra option.

#### Disable type-aware

Optionally, you can even disable type-aware rules on certain file extensions, or even specific files:

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso(
    {
        projectRoot: import.meta.dirname,
    },
    {
        files: ['**/*.{js,jsx}'],
        disableTypeAware: true,
    },
    {
        files: ['**/components/User.jsx'],
        disableTypeAware: true,
    },
);
```

### Editor specific non-fixes

Some rules are deemed as 'non-fixable' when inside your editor with ESLint integration:

- [`prefer-const`](https://eslint.org/docs/rules/prefer-const)
- [`unused-imports/no-unused-imports`](https://github.com/sweepline/eslint-plugin-unused-imports)
- [`vitest/no-only-tests`](https://github.com/levibuzolic/eslint-plugin-no-only-tests)

Before v1.0.0, they used to be hard disabled. But with a [helper](https://github.com/antfu/eslint-flat-config-utils#composerdisablerulesfix), they are now just marked as 'non-fixable'. They are re-applied when you're linting through a terminal, or by using [Lint Staged](#lint-staged).

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

### I want it less opinionated

No problem. I've extracted the things that I've deemed *very opinionated* in each integration, and made a setting that helps you disable all of it in one go.

```js
// eslint.config.js
import moso from '@moso/eslint-config';

export default moso({
    lessOpinionated: true,
});
```

> [!NOTE]
> The above will also disable `functional` and `perfectionist` completely. If you want to keep these enabled, you'll have to re-enable them explicitly, as demonstrated below

```js
{
    functional: true, // will default to 'lite' enforcement

    // Optionally change the `functionalEnforcement`:
    functionalEnforcement: 'recommended',

    // Re-enable `perfectionist`
    perfectionist: true,
}
```

### Prettier? dprint?

You can still use these to format files that aren't linted with this config, however, I strongly recommend you only format your code with ESLint, as Pretter and other AST-reading-then-reprint projects tend to ignore stuff like the original line breaks and might also cause inconsistent diffs when commiting code.

### How to format CSS?

You will need to install and configure [`stylelint`](https://stylelint.io) yourself, unfortunately.

I am actively considering adding linting support for TailwindCSS, however.

### I prefer `this` or `that` rule

No worries, you can always override the rules locally in your project to fit your needs. If that doesn't cut it, you're welcome to fork this project and maintain your own config.

## Inspiration

This ESLint config is heavily inspired by (and uses some of the same logic of):

\- [@antfu/eslint-config](https://github.com/antfu/eslint-config)
\- [@rebeccastevens/eslint-config](https://github.com/RebeccaStevens/eslint-config-rebeccastevens)
\- [@eslint-sukka/eslint-config](https://github.com/SukkaW/eslint-config-sukka)

[Anthony Fu](https://github.com/antfu)'s config inspired me to take the journey, but this project has since evolved into a personal project. Especially Rebecca's config and strict(er) approach to coding has pushed me towards a stricter coding environment, with [Functional](https://github.com/eslint-functional/eslint-plugin-functional) and [Azat](https://github.com/azat-io)'s [Perfectionist](https://perfectionist.dev) and [De Morgan](https://github.com/azat-io/eslint-plugin-de-morgan) enabled.

A personal thank-you to Anthony, Rebecca, Sukka, and Azat, and everyone else who contributed to their projects.

*Some* rules are the same, however, there are some differences:

- My own opinionated rules added
- Stylistic, Perfectionist, and Functional enabled per default
- More freedom to disable every individual config, or only disable the opinionated parts
- Deprecated Vue 2 support
- Simplification in some areas
- Better type-aware checks
- Plugin memoization
- Optional a11y support for React and Vue
- No dangerous plugin renaming

## License

[BSD 3-Clause](./LICENSE) License
