---
authors:
  - image_url: /img/team/bradzacher.jpg
    name: Brad Zacher
    title: typescript-eslint Maintainer
    url: https://github.com/bradzacher
description: Announcing the release of typescript-eslint's stable v7 release
slug: announcing-typescript-eslint-v7
tags: [breaking changes, typescript-eslint, v6, v7, flat configs]
title: Announcing typescript-eslint v7
---

[typescript-eslint](https://typescript-eslint.io) is the tooling that enables standard JavaScript tools such as [ESLint](https://eslint.org) and [Prettier](https://prettier.io) to support TypeScript code.

## Breaking Changes

This is a small major release with just three breaking changes:

1. Update NodeJS engine requirement to `^18.18.0 || >=20.0.0`. This means we are dropping support for Node 16, 19 and Node 18 versions prior to `18.18.0`. Note that this is the same requirement that ESLint v9 will impose.
1. Update the TypeScript peer dependency requirement to `>=4.7.4`.
1. Update the ESLint peer dependency requirement to `^8.56.0`.

For most users this means that an upgrade from v6 should just look like this:

```bash npm2yarn
npm i eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

<!-- truncate -->

### Into the Future

The intent behind this release is for us to constrain variance in our dependencies to help set us up for the future. The upcoming ESLint v9 release will contain many API removals - all of which had replacements added in some of the latest ESLint v8 releases. By enforcing that you have the latest ESLint v8 release we ensure that you have the replacement APIs - meaning we can migrate without needing to build and test for backwards compatibility. This significantly reduces our maintenance burden and should mean we can release v9 support sooner and with less pain and effort.

## New Features - Flat Config Support

There is one big feature that's also shipping with this release:<br />
🎉 **_Official support for ESLint Flat Configs!_** 🎉

With v7 we're releasing a new package - `typescript-eslint`. This package can be imported within your [flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new) to access our configs, plugin, and parser. This package also exports a utility function which will allow you to write type-checked configuration files!

Because this new package includes dependencies on our plugin and parser meaning you can replace those dependencies entirely:

```bash npm2yarn
npm un @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm i typescript-eslint
```

The simplest of this new tooling would be:

```js title="eslint.config.js"
// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
```

You can also declare our plugin and parser in your config via this package. For example this config would enable our plugin, our parser, and type-aware linting with a few of our popular type-aware rules:

```js title="eslint.config.js"
// @ts-check

import tseslint from 'typescript-eslint';

export default tseslint.config({
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: true,
    },
  },
  rules: {
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
  },
});
```

For more information check out:

- [ESLint's docs on flat configs](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [ESLint's docs on migrating to flat configs](https://eslint.org/docs/latest/use/configure/migration-guide)
- [The `typescript-eslint` package documentation](/packages/typescript-eslint)
