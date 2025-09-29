---
id: eslint-plugins
sidebar_label: Building ESLint Plugins
title: ESLint Plugins
---

:::important
This page describes how to write your own custom ESLint plugins using typescript-eslint.
You should be familiar with [ESLint's plugins guide](https://eslint.org/docs/latest/extend/plugins) and [typescript-eslint Custom Rules](./Custom_Rules.mdx) before writing custom plugins.
:::

Custom plugins that support TypeScript code and typed linting look very similar to any other ESLint plugin.
Follow the same general steps as [ESLint's plugins guide > _Creating a plugin_](https://eslint.org/docs/latest/extend/plugins#creating-a-plugin) to set up your plugin.
The required differences are noted on this page.

:::tip
See [**`eslint-plugin-example-typed-linting`**](https://github.com/typescript-eslint/examples/tree/main/packages/eslint-plugin-example-typed-linting) for an example plugin that supports typed linting.
:::

## Package Dependencies

Your plugin should have the following `package.json` entries.

For all `@typescript-eslint` and `typescript-eslint` packages, keep them at the same semver versions.
As an example, you might set each of them to `^8.1.2` or `^7.12.0 || ^8.0.0`.

### `dependencies`

[`@typescript-eslint/utils`](../packages/Utils.mdx) is required for the [`RuleCreator` factory to create rules](#rulecreator-usage).

### `devDependencies`

[`@typescript-eslint/rule-tester`](../packages/Rule_Tester.mdx) is strongly recommended to be able to [test rules with our `RuleTester`](./Custom_Rules.mdx).

### `peerDependencies`

Include the following to enforce the version range allowed without making users' package managers install them:

- `@typescript-eslint/parser` and any other parsers users are expected to be using
- `eslint`
- `typescript`

Those are all packages consumers are expected to be using already.

You don't need to declare any dependencies on `typescript-eslint` or `@typescript-eslint/eslint-plugin`.
Our setup guide ensures that the parser is automatically registered when configuring ESLint.

## `RuleCreator` Usage

We recommend including at least the following three properties in your plugin's [`RuleCreator` extra rule docs types](./Custom_Rules.mdx#extra-rule-docs-types):

- `description: string`: a succinct description of what the rule does
- `recommended?: boolean`: whether the rule exists in your plugin's shared _"`recommended`"_ config
- `requiresTypeChecking?: boolean`: whether the rule will use type information, for documentation generators such as [`eslint-doc-generator`](https://github.com/bmish/eslint-doc-generator)

For example, from [`eslint-plugin-example-typed-linting`'s `utils.ts`](https://github.com/typescript-eslint/examples/blob/main/packages/eslint-plugin-example-typed-linting/src/utils.ts):

```ts
import { ESLintUtils } from '@typescript-eslint/utils';

export interface ExamplePluginDocs {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<ExamplePluginDocs>(
  name =>
    `https://github.com/your/eslint-plugin-example/tree/main/docs/${name}.md`,
);
```

## Type Checking and Configs

Most ESLint plugins export a _"`recommended`"_ [ESLint shared config](https://eslint.org/docs/latest/extend/shareable-configs).
Many ESLint users assume enabling a plugin's `recommended` config is enough to enable all its relevant rules.

However, at the same time, not all users want to or are able to enabled typed linting.
If your plugin's rules heavily use type information, it might be difficult to enable those in a `recommended` config.

You have roughly two options:

- Have your plugin's `recommended` config require enabling type information
- Have a separate config with a name like `recommendedTypeChecked`

Either way, explicitly mention the strategy taken in your docs.

:::info
Per [_Custom Rules_ > _Conditional Type Information_](./Custom_Rules.mdx#conditional-type-information), we recommend not changing rule logic based on whether type information is available.
:::

:::tip
See [**`eslint-plugin-example-typed-linting`**](https://github.com/typescript-eslint/examples/tree/main/packages/eslint-plugin-example-typed-linting) for an example plugin that supports typed linting.
:::
