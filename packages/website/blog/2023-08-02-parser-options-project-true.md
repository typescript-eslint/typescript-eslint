---
authors:
  - image_url: https://www.joshuakgoldberg.com/img/josh.jpg
    name: Josh Goldberg
    title: typescript-eslint Maintainer
    url: https://github.com/JoshuaKGoldberg
description: Simplifying how many projects resolve their
slug: parser-options-project-true
tags: [parser, parser options, project, tsconfig]
title: Relative TSConfig Projects with `parserOptions.project = true`
---

["Typed linting"](/linting/typed-linting), or enabling ESLint rules to tap into the power of the TypeScript type checker, is one of the best parts of typescript-eslint.
But enabling the type checker in repositories with multiple `tsconfig.json` files can be annoying to set up.
Even worse, specifying the wrong include paths could result in incorrect rule reports and/or unexpectedly slow lint times.

Improving the setup experience for typed lint rules has been a long-standing goal for typescript-eslint.
One long-standing feature request for that experience has been to support automatically detecting TSConfigs for developers.
We're happy to say that we now support that by setting `parserOptions.project` equal to `true` in ESLint configurations.

This post will explain what life was like before, what's changed, and what's coming next. 🎉

<!--truncate-->

## The Problem With Projects

The `@typescript-eslint/parser` package is what enables ESLint to parse TypeScript source files.
It converts raw TypeScript code into an ["AST" format](./2022-12-05-asts-and-typescript-eslint.md).
When [`parserOptions.project`](https://typescript-eslint.io/packages/parser#project) is specified, it additionally sets up TypeScript programs that can be used by [typed rules](https://typescript-eslint.io/developers/custom-rules#typed-rules).

Many projects today start with ESLint configs that look something like:

```js
module.exports = {
  // ...
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  // ...
};
```

In larger repos, `parserOptions.project` often ends up being one of the three traditionally allowed forms:

- Path, such as `project: './tsconfig.json'`
- Glob pattern, such as `project: './packages/**/tsconfig.json'`
- Array of paths and/or glob patterns, such as `project: ['./packages/**/tsconfig.json', './separate-package/tsconfig.json']`

Explicitly indicating which TSConfig files are used for typed linting can be useful.
Developers like being given explicit control over their tooling.
However, we've seen a few issues arise from this approach:

- Particularly large repos can end up with so many TSConfig globs, they become confusing to developers or even cause [performance issues from overly permissive globs](https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting#wide-includes-in-your-eslint-options)
- Needing to change a template ESLint config every time it's used for a different repository structure is a pain
- Using different TSConfigs than what your editor users can result in different lint reports in the editor verses on the command-line

Although developers may sometimes need exact control over their `parserOptions.project`, most of the time we don't want to configure this.
Most repositories we've seen just want to use the _nearest `tsconfig.json` to each linted file_.

In other words, many developers want our [issue #101: Feature request: support looking up tsconfig.json relative to linted file](https://github.com/typescript-eslint/typescript-eslint/issues/101).

## Introducing `true`

As of typescript-eslint@5.52.0, we now support providing `true` for `parserOptions.project`:

```js
module.exports = {
  // ...
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  // ...
};
```

Doing so indicates that each source file being linted should use type information based on the nearest `tsconfig.json` in its directory.
For each file, `@typescript-eslint/parser` will check that file's directory, then the parent directory, and so on - until a `tsconfig.json` file is found.

:::tip
We recommend specifying [`tsconfigRootDir`](http://localhost:3000/packages/parser#tsconfigrootdir) in ESLint configs with a value set to the project's root directory (most commonly, `__dirname`).
That way, if you accidentally delete or rename the root `tsconfig.json` file, `@typescript-eslint/parser` won't search parent directories for higher `tsconfig.json` files.
:::

### Why Try `true`

If your project uses typed linting and manually specifies `tsconfig.json` files, we'd highly recommend trying out `parserOptions.project: true`.
We've seen it reduce lines of codes of ESLint configurations in many projects that have switched to it.
It's even occasionally even reduced time spent on typed linting by helping projects use a simpler set of TSConfigs. 🚀

In the long term, we're hoping to further improve the configuration and performance for typed linting (see _[Project Services](#project-services)_ below).
Simplifying your configuration now will make it easier to onboard to our new options when they're available.

### How It Works

When `@typescript-eslint/parser` is configured to generate type information, it attaches a backing TypeScript "Program" for to file it parses.
Those Programs provide type checking APIs used by lint rules.
Each TSConfig file on disk is generally used to create exactly one Program, so files that refer to the same TSConfig file will reuse the same Program.

Depending on how the ESLint config's `parserOptions.project` was specified, determining _which_ TSConfig file to use for each file can be different:

- For a single string (e.g. `"tsconfig.json"`), then only one Program will be created, and all linted files will reuse it.
- For globs and/or arrays (e.g. `"./packages/*/tsconfig.json"`), then each linted file will reuse a Program based on the _first_ matched TSConfig file.

For `true`, each linted file will first try the `tsconfig.json` in its directory, then its parent directory, and so on until one is found on disk or the directory root (`parserOptions.tsconfigRootDir`) is reached.

:::note
`@typescript-eslint/parser` caches those directory `tsconfig.json` file lookups for a duration corresponding to [`parserOptions.cacheLifetime`](/packages/parser#cachelifetime).
No potential TSConfig path should be checked more than once in a lint run.
:::

See [feat(typescript-estree): allow specifying project: true](https://github.com/typescript-eslint/typescript-eslint/pull/6084) for the backing code changes.

## What's Next

### Custom TSConfig Names

Some projects use TSConfig files with names other than `tsconfig.json`: most commonly, `tsconfig.eslint.json`.
`parserOptions.project: true` does not support specifying different name(s) to search for.
We have two followup issues filed to investigate fleshing out that support:

- [Enhancement: Allow altering the file names that project: true searches for](https://github.com/typescript-eslint/typescript-eslint/issues/7383)
- [Enhancement: Allow parserOptions.project to be (true | string)[]?](https://github.com/typescript-eslint/typescript-eslint/issues/7384)

If either of those two issues would benefit you, please 👍 react to them.
And if your project has a use case not yet mentioned in their comments, please post that use case.
We want to know what's important for users!

### Project Services

The downside of having users specify `parserOptions.project` at all is that `@typescript-eslint/parser` needs manual logic to create TypeScript Programs and associate them with linted files.
Manual Program creation logic comes with a few issues:

- Complex project setups can be difficult to get right.
  - For example, [typescript-eslint does not yet support Project References](https://github.com/typescript-eslint/typescript-eslint/issues/2094).
- The TypeScript compiler options used in the user's editor might differ from the compiler options in the TSConfigs they specified on disk.
- Files not included in created Programs can't be linted with type information, even though editors still typically surface type information when editing those files.
  - Most commonly, `.eslintrc.(c)js` files can be tricky to lint, resulting in the dreaded [_TSConfig does not include this file_ error](/troubleshooting#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file).

We're working on an option to instead call the same TypeScript "Project Service" APIs that editors such as VS Code use to create Programs for us instead.
Project Services will automatically detect the TSConfig for each file (like `project: true`), and will also allow type information to be computed for JavaScript files without the `allowJs` compiler option (unlike `project: true`).

We're hopeful this option will eventually become the standard way to enable typed linting.
However, because it's so new and untested, we're keeping it under the `EXPERIMENTAL_` prefix for at least all of the `6.X` versions.

See [Packages > Parser > `EXPERIMENTAL_useProjectService`](/packages/parser#EXPERIMENTAL_useProjectService) for more information.

## Supporting typescript-eslint

If you enjoyed this blog post and/or or use typescript-eslint, please consider [supporting us on Open Collective](https://opencollective.com/typescript-eslint).
We're a small volunteer team and could use your support to make the ESLint experience on TypeScript great.
Thanks! 💖
