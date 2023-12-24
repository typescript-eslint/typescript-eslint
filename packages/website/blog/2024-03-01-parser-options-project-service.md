---
authors:
  - image_url: https://www.joshuakgoldberg.com/img/josh.jpg
    name: Josh Goldberg
    title: typescript-eslint Maintainer
    url: https://github.com/JoshuaKGoldberg
description: Using a faster and more convenient "Project Service" API for configuring typed linting.
slug: parser-options-project-service
tags: [parser, parser options, project, project service, tsconfig]
title: Straightforward Typed Linting with `parserOptions.projectService`
---

["Typed linting"](/linting/typed-linting), or enabling ESLint rules to tap into the power of the TypeScript type checker, is one of the best parts of typescript-eslint.
But typed linting hasn't always been straightforward to configure or performant at runtime.

With typescript-eslint 7.0, we're marking as stable a `parserOptions.projectService` option that uses more powerful TypeScript APIs than previous typed linting implementations.
We've found it to bring the following benefits:

- ✍️ **Configuration**: simpler ESLint configs for typed linting and no ancillary `tsconfig.eslint.json`
- ⚡️ **Performance**: faster linting both in CLIs and in editors
- 🧠 **Predictability**: more closely aligns type information for lint rules to what editors produce

This blog post will cover how `parserOptions.projectService` improves performance, simplifies configurations, and brings linting type information much closer to what editors such as VS Code run with.

<!-- truncate -->

## Introducing the Project Service

Back in [Relative TSConfig Projects with `parserOptions.project = true` > Project Services](https://typescript-eslint.io/blog/parser-options-project-true#project-services), we'd mentioned we're working on a replacement for `parserOptions.project`:

> The downside of having users specify `parserOptions.project` at all is that `@typescript-eslint/parser` needs manual logic to create TypeScript Programs and associate them with linted files.
> Manual Program creation logic comes with a few issues:
>
> - Complex project setups can be difficult to get right.
>   - For example, [typescript-eslint does not yet support Project References](https://github.com/typescript-eslint/typescript-eslint/issues/2094).
> - The TypeScript compiler options used in the user's editor might differ from the compiler options in the TSConfigs they specified on disk.
> - Files not included in created Programs can't be linted with type information, even though editors still typically surface type information when editing those files.
>   - Most commonly, `.eslintrc.(c)js` files can be tricky to lint, resulting in the dreaded [_TSConfig does not include this file_ error](/linting/troubleshooting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file).
>
> We're working on an option to instead call the same TypeScript "Project Service" APIs that editors such as VS Code use to create Programs for us instead.
> Project Services will automatically detect the TSConfig for each file (like `project: true`), and will also allow type information to be computed for JavaScript files without the `allowJs` compiler option (unlike `project: true`).
>
> We hope this option will eventually become the standard way to enable typed linting.
> However, because it's so new and untested, we're keeping it under the `EXPERIMENTAL_` prefix for all of the `6.??` versions.

Following several months of discussion and testing, we believe the new Project Service API is ready to be used by real-world projects.
We've found them to be generally faster at runtime and more straightforward to configure.

We're therefore promoting the `parserOptions.EXPERIMENTAL_useProjectService` option to the stable **`parserOptions.projectService`** in typescript-eslint v7.

## Onboarding to the Project Service

You can change over to the new Project Service API by replacing `project` with `projectService` in your ESLint configuration:

<!--tabs-->

### Flat ESLint Config

```js title="eslint.config.js"
export default tseslint.flatConfig({
  // ...
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      // Remove this line
      project: true,
      // Add this line
      projectService: true,
      tsconfigRootDir: __dirname,
    },
  },
  // ...
});
```

### Legacy ESLint Config

```js title=".eslintrc.cjs"
module.exports = {
  // ...
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // Remove this line
    project: true,
    // Add this line
    projectService: true,
    tsconfigRootDir: __dirname,
  },
  // ...
};
```

<!--/tabs-->

Everything else around linting, including running ESLint and configuring rules, should work the same.

### Including Additional Files

One long-standing pain point of typed linting is enabling type information for files not included in the project's `tsconfig.json`, such as an `eslint.config.js` or `vitest.config.ts`.
Common solutions in the legacy Program API were to either skip type checking for those files or to create a separate `tsconfig.eslint.json` that enabled `compilerOptions.allowJs = true`.

Now, the new Project Service API allows for a configuration object specifying any number of `additionalFiles` globs.
Those globs allowlist files that should have type information despite not being included in the project's TSConfig.

For example, specifying `parserOptions.projectService.additionalFiles: ['./*']` would solve the common case of projects that have root-level files such as `eslint.config.js` and `vitest.config.ts`:

<!--tabs-->

### Flat ESLint Config

```js title="eslint.config.js"
export default tseslint.flatConfig({
  // ...
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: {
        additionalFiles: ['./*'],
      },
      tsconfigRootDir: __dirname,
    },
  },
  // ...
});
```

### Legacy ESLint Config

```js title=".eslintrc.cjs"
module.exports = {
  // ...
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectService: {
      additionalFiles: ['./*'],
    },
    tsconfigRootDir: __dirname,
  },
  // ...
};
```

<!--/tabs-->

:::tip
This means you should be able to remove any lint-only `tsconfig.eslint.json` files!
🥳
:::

Note that `projectService.additionalFiles` should only include files that aren't included in the project's `tsconfig.json`.
Creating fallback type information for additional files is slower than including those files in the `tsconfig.json`.
If a file is included in both the `tsconfig.json` and `projectService.additionalFiles`, typescript-eslint will report a parsing error:

```plaintext
${filePath} was included by projectService.additionalFiles but also was found in the project service. Consider removing it from projectService.additionalFiles.
```

See [feat(typescript-estree): add allowDefaultProjectForFiles project service allowlist option](https://github.com/typescript-eslint/typescript-eslint/pull/7752) for more details on the API and [chore: add performance package with a project service hyperfine comparison (#7870)](https://github.com/typescript-eslint/typescript-eslint/pull/7870) for more details on performance.

### New Starter Configs

The following ESLint configs are starting recommendations for typed linting using the project service:

<!--tabs-->

## Flat ESLint Config

```js title="eslint.config.js"
import tseslint from '@typescript-eslint/core';
import js from '@eslint/js';

export default tseslint.flatConfig({
  extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: {
        additionalFiles: ['./*'],
      },
      tsconfigRootDir: __dirname,
    },
  },
});
```

## Legacy ESLint Config

```js title=".eslintrc.cjs"
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectService: {
      additionalFiles: ['./*'],
    },
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  root: true,
};
```

<!--/tabs-->

See [typescript-eslint/examples](https://github.com/typescript-eslint/examples) for more references of how to configure linting in different projects.

## Performance Comparisons

In addition to simplifying configuration, we have also found the new Project Service API to result in faster lint times than the legacy program APIs.
We measured several common project scales:

- 👶 Linting a "tiny" project (~dozen files)
- 🧒 Linting a "small" project (~100 files)
- 🧑 Linting a "medium" project (~1,000 files)
- 🧓 Linting a "large" project (~5,000 files, with project references)

We also measured across different linting scenarios:

- "Full cold start" of linting the entire project
- "Partial cold start" of seeing editor suggestions after opening the project in VS Code
- "Warm start" of seeing editor suggestions after changing a file in VS Code

See [typescript-eslint/project-apis-performance-comparison](https://github.com/typescript-eslint/project-apis-performance-comparison) for details on the performance measurements.

### Full Cold Start

These measurements were taken by running `npm run lint` on the respective projects.

| API                | 👶 Tiny | 🧒 Small | 🧑 Medium | 🧓 Large |
| ------------------ | ------- | -------- | --------- | -------- |
| Legacy Program     |         |          |           |          |
| 🆕 Project Service |         |          |           |          |
| 𝚫 Delta            |         |          |           |          |

### Partial Cold Start

These measurements were taken by recording restarting VS Code on the respective projects with a single file open.

| API                | 👶 Tiny | 🧒 Small | 🧑 Medium | 🧓 Large |
| ------------------ | ------- | -------- | --------- | -------- |
| Legacy Program     |         |          |           |          |
| 🆕 Project Service |         |          |           |          |
| 𝚫 Delta            |         |          |           |          |

### Warm Start

These measurements were taken by recording VS Code on the respective projects with a single file open and modifying that file.

| API                | 👶 Tiny | 🧒 Small | 🧑 Medium | 🧓 Large |
| ------------------ | ------- | -------- | --------- | -------- |
| Legacy Program     |         |          |           |          |
| 🆕 Project Service |         |          |           |          |
| 𝚫 Delta            |         |          |           |          |

## Next Steps

### Giving Feedback

We'd love to hear from you on how this option works for you.
Does it live up to what we've promised, and/or does it have bugs we haven't fixed yet?
Please do post in the [Community Feedback: Project Service APIs](https://github.com/typescript-eslint/typescript-eslint/discussions/8030) GitHub Discussions post on how it goes for you.

For support in setting up the new APIs, feel free to ask on [the typescript-eslint Discord](https://discord.gg/FSxKq8Tdyg)'s `#project-service` channel.
We'd be happy to help you try out `parserOptions.projectService`.

### Long Term Vision

Our hope is that the Project Service API becomes the standard way to work with typed linting over the next few major versions.
Our intent is to roll it out according to the following rough timeline:

- **v7**: Rename `parserOptions.EXPERIMENTAL_useProjectService` to `parserOptions.projectService`
- **v8**: Rename `parserOptions.project` to something like `parserOptions.DEPRECATED_legacyProjectProgram` and rename `parserOptions.projectService` to `parserOptions.project`

Our plan is to always recommend setting `parserOptions.project` in the docs.
What that refers to will intentionally switch from the legacy program API to the new Project Service API in v8.

That timeline is a rough prediction that may change as users try out the new API.
Our priority will be to improve the new Project Service API so that it works in all places the legacy project program behavior does.
We won't remove the legacy project program behavior unless and until the new Project Service API is able to fully replace it.

## Supporting typescript-eslint

If you enjoyed this blog post and/or use typescript-eslint, please consider [supporting us on Open Collective](https://opencollective.com/typescript-eslint).
We're a small volunteer team and could use your support to make the ESLint experience on TypeScript great.
Thanks! 💖
