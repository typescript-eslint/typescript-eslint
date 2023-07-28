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

As of typescript-eslint@5.52.0, we now support providing `true` as the value `parserOptions.project`:

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

We're hopeful that `parserOptions.project: true` is satisfactory for most projects to use typed linting.
We've seen it reduce lines of codes of ESLint configurations in many projects that have switched to it.
It's even occasionally even reduced time spent on typed linting by helping projects use a simpler set of TSConfigs.

### Mix-and-Matching Projects

TODO: need to confirm whether this works!

### How It Works

TODO: mention the caching just a bit

See [feat(typescript-estree): allow specifying project: true](https://github.com/typescript-eslint/typescript-eslint/pull/6084) for more information.

## What's Next

### Custom TSConfig Names

TODO: find or file an issue asking about allowing e.g. `tsconfig.eslint.json`

### Project Services

TODO: reference `EXPERIMENTAL_useProjectService`

### A Complete Rewrite of ESLint

TODO: reference the ESLint discussion, and phrase it as many-years-down-the-road.

## Supporting typescript-eslint

If you enjoyed this blog post and/or or use typescript-eslint, please consider [supporting us on Open Collective](https://opencollective.com/typescript-eslint).
We're a small volunteer team and could use your support to make the ESLint experience on TypeScript great.
Thanks! 💖
