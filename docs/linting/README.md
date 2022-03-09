---
id: linting
title: Linting your TypeScript Codebase
sidebar_label: Linting your TypeScript Codebase
---

Whether you're adding linting to a new TypeScript codebase, adding TypeScript to an old codebase, or migrating from the deprecated [TSLint](https://www.npmjs.com/package/tslint), the steps aren't a whole lot different.

## Installation

First step is to make sure you've got the required packages installed:

```bash npm2yarn
npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

## Configuration

Next, create a `.eslintrc.js` config file in the root of your project, and populate it with the following:

<!-- prettier-ignore -->
```js title=".eslintrc.js"
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

With that configured, open a terminal to the root of your project, and run the following command

```bash npm2yarn
npm run eslint . --ext .js,.jsx,.ts,.tsx
```

That's it - ESLint will lint all `.js`, `.jsx`, `.ts`, and `.tsx` files within the current folder, and will output the results to your terminal.

You can also get results in realtime inside most IDEs via a plugin - search your IDE's extension store.

## Next Steps

With that configured you can now start to delve into the wide and extensive ESLint ecosystem of plugins and configs.

### Type-Aware Rules

We have a lot of awesome rules which utilize the power of TypeScript's type information. They require a little bit of extra setup beyond this first step, [so visit the next page to see how to set this up.](./TYPED_LINTING.md)

### Prettier

If you use [`prettier`](https://www.npmjs.com/package/prettier), there is also a helpful config to help ensure ESLint doesn't report on formatting issues that prettier will fix: [`eslint-config-prettier`](https://www.npmjs.com/package/eslint-config-prettier).

Using this config by adding it to the end of your `extends`:

```diff title=".eslintrc.js"
  module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
+     'prettier',
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

```diff title=".eslintrc.js"
  module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
-     'eslint:recommended',
-     'plugin:@typescript-eslint/recommended',
+     'airbnb-typescript',
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

```diff title=".eslintrc.js"
  module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
+     'jest',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
+     'plugin:jest/recommended',
    ],
  };
```

<!-- markdownlint-disable MD044 -->

Search ["eslint-plugin" on npm](https://www.npmjs.com/search?q=eslint-plugin) for more.

## Troubleshooting

If you're having problems getting this working, please have a look at our [Troubleshooting FAQ](./TROUBLESHOOTING.md).
