---
id: linting
title: Linting your TypeScript Codebase
sidebar_label: Linting your TypeScript Codebase
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Whether you are adding linting to a new TypeScript codebase, adding TypeScript to an old codebase, or migrating from the deprecated [TSLint](https://www.npmjs.com/package/tslint) tool, the steps to follow are similar.

## Installation

First step is to make sure you've got the required packages installed:

```bash npm2yarn
npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

## Configuration

Next, create a `.eslintrc.cjs` config file in the root of your project, and populate it with the following:

<!-- prettier-ignore -->
```js title=".eslintrc.cjs"
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
};
```

This is about the smallest config file we recommend. There's a lot more you can add to this as you further onboard, but this will be enough to get you started.

:::info

The `.cjs` extension will explicitly set the file to a [CommonJS module](https://nodejs.org/dist/latest-v18.x/docs/api/modules.html), in case your project has `"type": "module"` in its package.json.

If your project doesn't use ESM, naming the file as `.eslintrc.js` is fine. See [ESLint's Configuration Files docs](https://eslint.org/docs/user-guide/configuring/configuration-files) for more info.

:::

### Details

Explaining the important bits:

- `parser: '@typescript-eslint/parser'` tells ESLint to use the parser package you installed ([`@typescript-eslint/parser`](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/parser)).
  - This allows ESLint to understand TypeScript syntax.
  - This is required, or else ESLint will throw errors as it tries to parse TypeScript code as if it were regular JavaScript.
- `plugins: ['@typescript-eslint']` tells ESLint to load the plugin package you installed ([`@typescript-eslint/eslint-plugin`](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin)).
  - This allows you to use the rules within your codebase.
- `extends: [ ... ]` tells ESLint that your config extends the given configurations.
  - `eslint:recommended` is ESLint's inbuilt "recommended" config - it turns on a small, sensible set of rules which lint for well-known best-practices.
  - `plugin:@typescript-eslint/recommended` is our "recommended" config - it's just like `eslint:recommended`, except it only turns on rules from our TypeScript-specific plugin.

### Ignoring unnecessary files

Next, create a `.eslintignore` file in the root of your project.
This file will tell ESLint which files and folders it should never lint.

Add the following lines to the file:

```ignore title=".eslintignore"
# don't lint build output (make sure it's set to your correct build folder name)
dist
```

### Further Configuration Documentation

- You can read more about configuring ESLint [in their documentation on configuration](https://eslint.org/docs/user-guide/configuring).
- You can read more about the rules provided by ESLint [in their documentation on their rules](https://eslint.org/docs/rules/).
- You can read more about the rules provided by us in [our plugin documentation](https://typescript-eslint.io/rules/).

## Running ESLint

With that configured, open a terminal to the root of your project, and run the following command:

<Tabs groupId="npm2yarn">
<TabItem value="npm">

```bash
npx eslint .
```

</TabItem>
<TabItem value="Yarn">

```bash
yarn eslint .
```

</TabItem>
</Tabs>

That's it - ESLint will lint all TypeScript compatible files within the current folder, and will output the results to your terminal.

You are also recommended to add an npm script in your package.json, so you don't have to repeat the same command every time you run ESLint.

```json title="package.json"
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

This way, you can invoke the `lint` script directly:

```bash npm2yarn
npm run lint
```

:::note
If you use non-standard file extensions, you will need to explicitly tell ESLint to lint those extensions using the [`--ext` flag](https://eslint.org/docs/user-guide/command-line-interface#--ext)
:::

You can also get results in realtime inside most IDEs via a plugin - search your IDE's extension store.

## Next Steps

With that configured you can now start to delve into the wide and extensive ESLint ecosystem of plugins and configs.

### Type-Aware Rules

We have a lot of awesome rules which utilize the power of TypeScript's type information. They require a little bit of extra setup beyond this first step, [so visit the next page to see how to set this up.](./TYPED_LINTING.md)

### Prettier

If you use [`prettier`](https://www.npmjs.com/package/prettier), there is also a helpful config to help ensure ESLint doesn't report on formatting issues that prettier will fix: [`eslint-config-prettier`](https://www.npmjs.com/package/eslint-config-prettier).

Using this config by adding it to the end of your `extends`:

```js title=".eslintrc.js"
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Add this line
    'prettier',
  ],
};
```

### Community Configs

Configurations exist solely to provide a comprehensive base config for you, with the intention that you add the config and it gives you an opinionated setup.
Many configuration packages exist in the ESLint ecosystem.
A few popular all-in-one configs are:

- Airbnb's ESLint config: [`eslint-config-airbnb-typescript`](https://www.npmjs.com/package/eslint-config-airbnb-typescript).
- Standard: [`eslint-config-standard-with-typescript`](https://www.npmjs.com/package/eslint-config-standard-with-typescript).

To use one of these complete config packages, you would replace the `extends` with the package name.
For example:

```js title=".eslintrc.js"
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    // Removed lines start
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Removed lines end
    // Add this line
    'airbnb-typescript',
  ],
};
```

<!-- markdownlint-disable MD044 -->

Search ["eslint-config" on npm](https://www.npmjs.com/search?q=eslint-config) for more.

### Plugins

ESLint plugins provide additional rules and other functionality on top of ESLint.
Below are just a few examples:

- ESLint comment restrictions: [`eslint-plugin-eslint-comments`](https://www.npmjs.com/package/eslint-plugin-eslint-comments)
- Import/export conventions : [`eslint-plugin-import`](https://www.npmjs.com/package/eslint-plugin-import)
- Jest testing: [`eslint-plugin-jest`](https://www.npmjs.com/package/eslint-plugin-jest)
- NodeJS best practices: [`eslint-plugin-node`](https://www.npmjs.com/package/eslint-plugin-node)
- React best practices: [`eslint-plugin-react`](https://www.npmjs.com/package/eslint-plugin-react) and [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks)

Every plugin that is out there includes documentation on the various configurations and rules they offer.
A typical plugin might be used like:

```js title=".eslintrc.js"
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    // Add this line
    'jest',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Add this line
    'plugin:jest/recommended',
  ],
};
```

<!-- markdownlint-disable MD044 -->

Search ["eslint-plugin" on npm](https://www.npmjs.com/search?q=eslint-plugin) for more.

## Troubleshooting

If you're having problems getting this working, please have a look at our [Troubleshooting FAQ](./TROUBLESHOOTING.md).
