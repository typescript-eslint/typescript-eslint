---
id: getting-started
title: Getting Started
slug: /
---

## Quickstart

These steps will get you running ESLint with our recommended rules on your TypeScript code as quickly as possible.

### Step 1: Installation

First, install the required packages for [ESLint](https://eslint.io), [TypeScript](https://typescriptlang.org), and this plugin:

```bash npm2yarn
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint typescript
```

### Step 2: Configuration

Next, create a `.eslintrc.cjs` config file in the root of your project, and populate it with the following:

```js title=".eslintrc.cjs"
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
};
```

:::info
If your project doesn't use ESM, naming the file as `.eslintrc.js` is fine. See [ESLint's Configuration Files docs](https://eslint.org/docs/user-guide/configuring/configuration-files) for more info.
:::

### Step 3: Running ESLint

Open a terminal to the root of your project and run the following command:

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

ESLint will lint all TypeScript compatible files within the current folder, and will output the results to your terminal.

## Details

- You can read more about configuring ESLint [in their documentation on configuration](https://eslint.org/docs/user-guide/configuring).
- You can read more about the rules provided by ESLint [in their documentation on their rules](https://eslint.org/docs/rules/).
- You can read more about the rules provided by typescript-eslint in [our rules documentation](/rules).

### Configuration Values

- `parser: '@typescript-eslint/parser'` tells ESLint to use the [`@typescript-eslint/parser`](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/parser) package you installed to parse your source files.
  - This is required, or else ESLint will throw errors as it tries to parse TypeScript code as if it were regular JavaScript.
- `plugins: ['@typescript-eslint']` tells ESLint to load the [`@typescript-eslint/eslint-plugin`](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin)) package as a plugin.
  - This allows you to use typescript-eslint's rules within your codebase.
- `extends: [ ... ]` tells ESLint that your config extends the given configurations.
  - `eslint:recommended` is ESLint's inbuilt "recommended" config - it turns on a small, sensible set of rules which lint for well-known best-practices.
  - `plugin:@typescript-eslint/recommended` is our "recommended" config - it's just like `eslint:recommended`, except it only turns on rules from our TypeScript-specific plugin.

## Next Steps

We provide a plethora of powerful rules that utilize the power of TypeScript's type information. [Visit the next page for a setup guide](./linting/TYPED_LINTING.md 'Visit the next page for a typed rules setup guide').

If you're having problems getting this working, please have a look at our [Troubleshooting & FAQs](./linting/TROUBLESHOOTING.md).
