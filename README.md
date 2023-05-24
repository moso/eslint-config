# @moso/eslint-config

Extremely oppinionated [ESLint](https://eslint.org) configs for development for vanilla JavaScript, [TypeScript](https://www.typescriptlang.org), and [Vue 3](https://vuejs.org).

Each package can be installed separately, and they all extend the basic package.

## Usage

### Install

```bash
pnpm add -D eslint @moso/eslint-config
```

### Configure your `.eslintrc`
```json
{
  "extends": "@moso",
}
```

> You shouldn't need an `.eslintignore` as presets are providing it

### Add script tag for `package.json`
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### Configure VS Code auto fix

Install the [VS Code ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and create the file `.vscode/settings.json` with the following config:

```json
{
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### TypeScript-aware
When a `.tsconfig` is found, TypeScript overrides will kick in, otherwise the basic rules are in play.

### CSS?
Install and configure stylelint yourself. This project doesn't lint CSS.

### Need to configure these?
Just override the rules in your `.eslintrc`-file:

```jsonc
{
  "extends": "@moso",
  "rules": {
    // insert your rules here
  },
}
```

### Coming soon
Linting rules specific for [React](https://react.dev) (JSX) and [Nuxt](https://nuxt.com).
