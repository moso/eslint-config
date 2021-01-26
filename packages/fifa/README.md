# @moso/eslint-config-fifa
Shareable ESLint config for FIFA.CXM

## What is it?
This ESLint config is specificly tailored towards the FIFA.CXM project. It uses the following rules:

- Project-specific JavaScript rules (overrides)
- React rules [eslint-plugin-react](https://github.com/yannickcr/eslint-plugin-react)
- JSX-specific rules[eslint-plugin-react#jsx-specific-rules](https://github.com/yannickcr/eslint-plugin-react#jsx-specific-rules)
- TypeScript-specific rules [@typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint)

The following plugins are being used:
- `plugin:react/recommended`
- `plugin:@typescript-eslint/recommended`
- `@moso/eslint-config-basic`
- `plugin:import/typescript`

`@moso/eslint-config-basic` is the base of this repo, and contains the most common JavaScript rules, import rules, ES6 rules, best practices, and common "[unicorns](https://github.com/sindresorhus/eslint-plugin-unicorn)".

## How to contribute
Create a PR with your proposed change and why you want it changed.

## License
MIT
