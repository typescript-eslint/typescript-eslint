---
authors:
  - image_url: https://www.joshuakgoldberg.com/img/josh.jpg
    name: Josh Goldberg
    title: typescript-eslint Maintainer
    url: https://github.com/JoshuaKGoldberg
description: Announcing the release of typescript-eslint's stable v6 release, including its changes and timeline.
slug: announcing-typescript-eslint-v6
tags: [breaking changes, typescript-eslint, v5, v6]
title: Announcing typescript-eslint v6
---

[typescript-eslint](https://typescript-eslint.io) is the tooling that enables standard JavaScript tools such as [ESLint](https://eslint.org) and [Prettier](https://prettier.io) to support TypeScript code.
We've been working on a set of breaking changes and general features that we're excited to get in released! 🎉

We'd previously blogged about v6 in [Announcing typescript-eslint v6 Beta](./2023-03-13-announcing-typescript-eslint-v6-beta.md).
This blog post contains much of the same information as that one, but updated for changes made since the beta - including a few breaking changes.

<!--truncate-->

> ✨ indicates a change that was not present in the v6 beta.

## Using v6

Whether you're new to linting your TypeScript code or a returning user, please do upgrade to the latest major version of typescript-eslint!
V6 comes with a suite of quality-of-life improvements we think you'll appreciate.

### As A New User

If you don't yet use typescript-eslint, you can go through our [configuration steps on the _Getting Started_ docs](/getting-started).
It'll walk you through setting up typescript-eslint in a project.

### As An Existing User

If you already use typescript-eslint, you'll need to first replace your package's previous versions of `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` with the latest versions:

```shell
npm i @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest --save-dev
```

We highly recommend then basing your ESLint configuration on the reworked typescript-eslint [recommended configurations mentioned later in this post](#reworked-configuration-names) — especially if it's been a while since you've reworked your linter config.

## User-Facing Breaking Changes

These are the changes that users of typescript-eslint -generally, any developer running ESLint on TypeScript code- should pay attention to when upgrading typescript-eslint from v5 to v6.

### Reworked Configuration Names

The biggest configuration change in typescript-eslint v6 is that we've reworked the names of our [provided user configuration files](https://typescript-eslint.io/linting/configs).
typescript-eslint v5 provided three recommended configurations:

- [`recommended`](https://typescript-eslint.io/linting/configs#recommended): Recommended rules for code correctness that you can drop in without additional configuration.
- [`recommended-requiring-type-checking`](https://typescript-eslint.io/linting/configs#recommended-requiring-type-checking): Additional recommended rules that require type information.
- [`strict`](https://typescript-eslint.io/linting/configs#strict): Additional strict rules that can also catch bugs but are more opinionated than recommended rules.

Those configurations worked well for most projects.
However, some users correctly noted two flaws in that approach:

- Strict rules that didn't require type checking were lumped in with those that did.
- _Stylistic_ best practices were lumped in with rules that actually find bugs.

As a result, we've reworked the configurations provided by typescript-eslint into these two groups:

- Functional rule configurations, for best best practices and code correctness:
  - **`recommended`**: Recommended rules that you can drop in without additional configuration.
  - **`recommended-type-checked`**: Additional recommended rules that require type information.
  - **`strict`**: Additional strict rules that can also catch bugs but are more opinionated than recommended rules _(without type information)_.
  - **`strict-type-checked`**: Additional strict rules that do require type information.
- Stylistic rule configurations, for consistent and predictable syntax usage:
  - **`stylistic`**: Stylistic rules you can drop in without additional configuration.
  - **`stylistic-type-checked`**: Additional stylistic rules that require type information.

> `recommended-requiring-type-checking` is now an alias for `recommended-type-checked`.
> The alias will be removed in a future major version.

As of v6, we recommend that projects enable two configs from the above:

- If you are _not_ using typed linting, enable `stylistic` and either `recommended` or `strict`, depending on how intensely you'd like your lint rules to scrutinize your code.
- If you _are_ using typed linting, enable `stylistic-type-checked` and either `recommended-type-checked` or `strict-type-checked`, depending on how intensely you'd like your lint rules to scrutinize your code.

For example, a typical project that enables typed linting might have an ESLint configuration file that changes like:

```js title=".eslintrc.cjs"
module.exports = {
  extends: [
    'eslint:recommended',
    // Removed lines start
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    // Removed lines end
    // Added lines start
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    // Added lines end
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // Remove this line
    project: './tsconfig.json',
    // Add this line
    project: true,
    tsconfigRootDir: __dirname,
  },
  root: true,
};
```

See [our _Configurations_ linting docs](/linting/configs) for the updated documentation on configurations provided by typescript-eslint.

For more information on these changes, see:

- [Our documentation on our configurations](https://typescript-eslint.io/linting/configs).
- [Configs: Have recommended/strict configs include lesser configs, and simplify type checked names](https://github.com/typescript-eslint/typescript-eslint/discussions/6019) for the discussion leading up to these configuration changes.
- [feat(eslint-plugin): rework configs: recommended, strict, stylistic; -type-checked](https://github.com/typescript-eslint/typescript-eslint/pull/5251) for the pull request implementing the changes.

### Updated Configuration Rules

Every new major version of typescript-eslint comes with changes to which rules are enabled in the preset configurations - and with which options.
Because this release also includes a reworking of the configurations themselves, the list of changes is too large to put in this blog post.
Instead see the table in [Changes to configurations for 6.0.0](https://github.com/typescript-eslint/typescript-eslint/discussions/6014) and [Configs: Last round of "final" changes to configs for v6](https://github.com/typescript-eslint/typescript-eslint/discussions/7130) for a full description of the changes.

:::tip
If your ESLint configuration contains many `rules` configurations, we suggest the following strategy to start anew:

1. Remove all your rules configurations
2. Extend from the preset configs that make sense for you
3. Run ESLint on your project
4. In your ESLint configuration, turn off any rules creating errors that don't make sense for your project - with comments explaining why
5. In your ESLint configuration and/or with inline `eslint-disable` comments, turn off any rules creating too many errors for you to fix - with _"TODO"_ comments linking to tracking issues/tickets to re-enable them

:::

Miscellaneous changes to all shared configurations include:

- [fix(eslint-plugin): remove valid-typeof disable in eslint-recommended](https://github.com/typescript-eslint/typescript-eslint/pull/5381): Removes the disabling of ESLint's `valid-typeof` rule from our preset configs.

<!-- markdownlint-disable MD033 -->

<details>
<summary>Diff patch from v5's <em><code>recommended</code></em> to v6's <em><code>recommended</code></em> and <em><code>stylistic</code></em> configs</summary>

```diff
{
   '@typescript-eslint/adjacent-overload-signatures': '...',
+  '@typescript-eslint/array-type': '...',
   '@typescript-eslint/ban-ts-comment': '...',
+  '@typescript-eslint/ban-tslint-comment': '...',
   '@typescript-eslint/ban-types': '...',
+  '@typescript-eslint/class-literal-property-style': '...',
+  '@typescript-eslint/consistent-generic-constructors': '...',
+  '@typescript-eslint/consistent-indexed-object-style': '...',
+  '@typescript-eslint/consistent-type-assertions': '...',
+  '@typescript-eslint/consistent-type-definitions': '...',
   'no-array-constructor': '...',
   '@typescript-eslint/no-array-constructor': '...',
+  '@typescript-eslint/no-confusing-non-null-assertion': '...',
+  '@typescript-eslint/no-duplicate-enum-values': '...',
   'no-empty-function': '...',
   '@typescript-eslint/no-empty-function': '...',
   '@typescript-eslint/no-empty-interface': '...',
   '@typescript-eslint/no-explicit-any': '...',
   '@typescript-eslint/no-extra-non-null-assertion': '...',
-  'no-extra-semi': '...',
-  '@typescript-eslint/no-extra-semi': '...',
   '@typescript-eslint/no-inferrable-types': '...',
   'no-loss-of-precision': '...',
   '@typescript-eslint/no-loss-of-precision': '...',
   '@typescript-eslint/no-misused-new': '...',
   '@typescript-eslint/no-namespace': '...',
   '@typescript-eslint/no-non-null-asserted-optional-chain': '...',
-  '@typescript-eslint/no-non-null-assertion': '...',
   '@typescript-eslint/no-this-alias': '...',
   '@typescript-eslint/no-unnecessary-type-constraint': '...',
+  '@typescript-eslint/no-unsafe-declaration-merging': '...',
   'no-unused-vars': '...',
   '@typescript-eslint/no-unused-vars': '...',
   '@typescript-eslint/no-var-requires': '...',
   '@typescript-eslint/prefer-as-const': '...',
+  '@typescript-eslint/prefer-for-of': '...',
+  '@typescript-eslint/prefer-function-type': '...',
   '@typescript-eslint/prefer-namespace-keyword': '...',
   '@typescript-eslint/triple-slash-reference': '...',
}
```

</details>

<details>
<summary>Diff patch from v5's <em><code>recommended</code></em> and  <em><code>recommended-type-checked</code></em> to v6's <em><code>recommended-type-checked</code></em> and <em><code>stylistic-type-checked</code></em> configs</summary>

```diff
{
   '@typescript-eslint/adjacent-overload-signatures': '...',
+  '@typescript-eslint/array-type': '...',
   '@typescript-eslint/await-thenable': '...',
   '@typescript-eslint/ban-ts-comment': '...',
+  '@typescript-eslint/ban-tslint-comment': '...',
   '@typescript-eslint/ban-types': '...',
+  '@typescript-eslint/class-literal-property-style': '...',
+  '@typescript-eslint/consistent-generic-constructors': '...',
+  '@typescript-eslint/consistent-indexed-object-style': '...',
+  '@typescript-eslint/consistent-type-assertions': '...',
+  '@typescript-eslint/consistent-type-definitions': '...',
+  'dot-notation': '...',
+  '@typescript-eslint/dot-notation': '...',
   'no-array-constructor': '...',
   '@typescript-eslint/no-array-constructor': '...',
+  '@typescript-eslint/no-base-to-string': '...',
+  '@typescript-eslint/no-confusing-non-null-assertion': '...',
+  '@typescript-eslint/no-duplicate-enum-values': '...',
+  '@typescript-eslint/no-duplicate-type-constituents': '...',
   'no-empty-function': '...',
   '@typescript-eslint/no-empty-function': '...',
   '@typescript-eslint/no-empty-interface': '...',
   '@typescript-eslint/no-explicit-any': '...',
   '@typescript-eslint/no-extra-non-null-assertion': '...',
-  'no-extra-semi': '...',
-  '@typescript-eslint/no-extra-semi': '...',
   '@typescript-eslint/no-floating-promises': '...',
   '@typescript-eslint/no-for-in-array': '...',
   'no-implied-eval': '...',
   '@typescript-eslint/no-implied-eval': '...',
   '@typescript-eslint/no-inferrable-types': '...',
   'no-loss-of-precision': '...',
   '@typescript-eslint/no-loss-of-precision': '...',
   '@typescript-eslint/no-misused-new': '...',
   '@typescript-eslint/no-misused-promises': '...',
   '@typescript-eslint/no-namespace': '...',
   '@typescript-eslint/no-non-null-asserted-optional-chain': '...',
-  '@typescript-eslint/no-non-null-assertion': '...',
+  '@typescript-eslint/no-redundant-type-constituents': '...',
   '@typescript-eslint/no-this-alias': '...',
   '@typescript-eslint/no-unnecessary-type-assertion': '...',
   '@typescript-eslint/no-unnecessary-type-constraint': '...',
   '@typescript-eslint/no-unsafe-argument': '...',
   '@typescript-eslint/no-unsafe-assignment': '...',
   '@typescript-eslint/no-unsafe-call': '...',
+  '@typescript-eslint/no-unsafe-declaration-merging': '...',
+  '@typescript-eslint/no-unsafe-enum-comparison': '...',
   '@typescript-eslint/no-unsafe-member-access': '...',
   '@typescript-eslint/no-unsafe-return': '...',
   'no-unused-vars': '...',
   '@typescript-eslint/no-unused-vars': '...',
   '@typescript-eslint/no-var-requires': '...',
+  '@typescript-eslint/non-nullable-type-assertion-style': '...',
   '@typescript-eslint/prefer-as-const': '...',
+  '@typescript-eslint/prefer-for-of': '...',
+  '@typescript-eslint/prefer-function-type': '...',
   '@typescript-eslint/prefer-namespace-keyword': '...',
+  '@typescript-eslint/prefer-nullish-coalescing': '...',
+  '@typescript-eslint/prefer-optional-chain': '...',
+  '@typescript-eslint/prefer-string-starts-ends-with': '...',
   'require-await': '...',
   '@typescript-eslint/require-await': '...',
   '@typescript-eslint/restrict-plus-operands': '...',
   '@typescript-eslint/restrict-template-expressions': '...',
   '@typescript-eslint/triple-slash-reference': '...',
   '@typescript-eslint/unbound-method': '...',
}
```

</details>

<details>
<summary>Code that generated those diffs</summary>

```js
const v5Recommended = {
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/ban-types': 'error',
  'no-array-constructor': 'off',
  '@typescript-eslint/no-array-constructor': 'error',
  'no-empty-function': 'off',
  '@typescript-eslint/no-empty-function': 'error',
  '@typescript-eslint/no-empty-interface': 'error',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  'no-extra-semi': 'off',
  '@typescript-eslint/no-extra-semi': 'error',
  '@typescript-eslint/no-inferrable-types': 'error',
  'no-loss-of-precision': 'off',
  '@typescript-eslint/no-loss-of-precision': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-non-null-assertion': 'warn',
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-var-requires': 'error',
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/prefer-namespace-keyword': 'error',
  '@typescript-eslint/triple-slash-reference': 'error',
};

const v5RecommendedRequiringTypeChecking = {
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-for-in-array': 'error',
  'no-implied-eval': 'off',
  '@typescript-eslint/no-implied-eval': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  'require-await': 'off',
  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/restrict-plus-operands': 'error',
  '@typescript-eslint/restrict-template-expressions': 'error',
  '@typescript-eslint/unbound-method': 'error',
};

const v6Recommended = {
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/ban-types': 'error',
  'no-array-constructor': 'off',
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-duplicate-enum-values': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  'no-loss-of-precision': 'off',
  '@typescript-eslint/no-loss-of-precision': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/no-unsafe-declaration-merging': 'error',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-var-requires': 'error',
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/triple-slash-reference': 'error',
};

const v6RecommendedTypeChecked = {
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/ban-types': 'error',
  'no-array-constructor': 'off',
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-base-to-string': 'error',
  '@typescript-eslint/no-duplicate-enum-values': 'error',
  '@typescript-eslint/no-duplicate-type-constituents': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-for-in-array': 'error',
  'no-implied-eval': 'off',
  '@typescript-eslint/no-implied-eval': 'error',
  'no-loss-of-precision': 'off',
  '@typescript-eslint/no-loss-of-precision': 'error',
  '@typescript-eslint/no-misused-new': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-redundant-type-constituents': 'error',
  '@typescript-eslint/no-this-alias': 'error',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-unnecessary-type-constraint': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-declaration-merging': 'error',
  '@typescript-eslint/no-unsafe-enum-comparison': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-var-requires': 'error',
  '@typescript-eslint/prefer-as-const': 'error',
  'require-await': 'off',
  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/restrict-plus-operands': 'error',
  '@typescript-eslint/restrict-template-expressions': 'error',
  '@typescript-eslint/triple-slash-reference': 'error',
  '@typescript-eslint/unbound-method': 'error',
};

const v6Stylistic = {
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/array-type': 'error',
  '@typescript-eslint/ban-tslint-comment': 'error',
  '@typescript-eslint/class-literal-property-style': 'error',
  '@typescript-eslint/consistent-generic-constructors': 'error',
  '@typescript-eslint/consistent-indexed-object-style': 'error',
  '@typescript-eslint/consistent-type-assertions': 'error',
  '@typescript-eslint/consistent-type-definitions': 'error',
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  'no-empty-function': 'off',
  '@typescript-eslint/no-empty-function': 'error',
  '@typescript-eslint/no-empty-interface': 'error',
  '@typescript-eslint/no-inferrable-types': 'error',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/prefer-namespace-keyword': 'error',
};

const v6StylisticTypeChecked = {
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/array-type': 'error',
  '@typescript-eslint/ban-tslint-comment': 'error',
  '@typescript-eslint/class-literal-property-style': 'error',
  '@typescript-eslint/consistent-generic-constructors': 'error',
  '@typescript-eslint/consistent-indexed-object-style': 'error',
  '@typescript-eslint/consistent-type-assertions': 'error',
  '@typescript-eslint/consistent-type-definitions': 'error',
  'dot-notation': 'off',
  '@typescript-eslint/dot-notation': 'error',
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  'no-empty-function': 'off',
  '@typescript-eslint/no-empty-function': 'error',
  '@typescript-eslint/no-empty-interface': 'error',
  '@typescript-eslint/no-inferrable-types': 'error',
  '@typescript-eslint/non-nullable-type-assertion-style': 'error',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/prefer-namespace-keyword': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',
};

function createDiffPatch(v5, v6) {
  const v5Keys = new Set(Object.keys(v5));
  const v6Keys = new Set(Object.keys(v6));
  const output = ['{'];

  for (const key of Array.from(new Set([...v5Keys, ...v6Keys])).sort((a, b) =>
    trimSlash(a).localeCompare(trimSlash(b)),
  )) {
    const prefix = v5Keys.has(key) ? (v6Keys.has(key) ? ' ' : '-') : '+';

    output.push(`${prefix}  '${key}': '...',`);
  }

  output.push('}');

  return output.join('\n');
}

function trimSlash(text) {
  return text.startsWith('@typescript-eslint/')
    ? text.slice('@typescript-eslint/'.length)
    : text;
}

console.log('From v5 recommended to v6 recommended & stylistic:');

console.log(
  createDiffPatch(v5Recommended, { ...v6Recommended, ...v6Stylistic }),
);

console.log(
  '\nFrom v5 recommended & recommended-requiring-type-checking to v6 recommended-type-checked & stylistic-type-checked:',
);

console.log(
  createDiffPatch(
    {
      ...v5Recommended,
      ...v5RecommendedRequiringTypeChecking,
    },
    { ...v6RecommendedTypeChecked, ...v6StylisticTypeChecked },
  ),
);
```

</details>

<!-- markdownlint-enable MD033 -->

### Rule Breaking Changes

Several rules were changed in significant enough ways to be considered breaking changes:

- Previously deprecated rules are deleted ([chore(eslint-plugin): remove deprecated rules for v6](https://github.com/typescript-eslint/typescript-eslint/pull/6112)):
  - `@typescript-eslint/no-duplicate-imports`
  - `@typescript-eslint/no-implicit-any-catch`
  - `@typescript-eslint/no-parameter-properties`
  - `@typescript-eslint/sort-type-union-intersection-members`
- [feat(eslint-plugin): [prefer-nullish-coalescing]: add support for assignment expressions](https://github.com/typescript-eslint/typescript-eslint/pull/5234): Enhances the [`@typescript-eslint/prefer-nullish-coalescing`](https://typescript-eslint.io/prefer-nullish-coalescing) rule to also check `||=` expressions.
- [feat(eslint-plugin): [prefer-optional-chain] use type checking for strict falsiness](https://github.com/typescript-eslint/typescript-eslint/pull/6240): Fixes edge case bugs in the [`@typescript-eslint/prefer-optional-chain`](https://typescript-eslint.io/prefer-optional-chain) rule around false positives, at the cost of making it require type information.
- ✨ [feat(eslint-plugin): [restrict-plus-operands] change checkCompoundAssignments to skipCompoundAssignments](https://github.com/typescript-eslint/typescript-eslint/pull/7027): inverses the logical value of the option and renames it
- ✨ [feat(eslint-plugin): [prefer-optional-chain] handle cases where the first operands are unrelated to the rest of the chain and add type info](https://github.com/typescript-eslint/typescript-eslint/pull/6397): uses type information to make the rule more intelligent about when to flag violations

### Tooling Breaking Changes

- [feat(typescript-estree): deprecate createDefaultProgram](https://github.com/typescript-eslint/typescript-eslint/pull/5890): Renames `createDefaultProgram` to `deprecated__createDefaultProgram`, with associated `@deprecated` TSDoc tags and warnings.
- Drop support for Node v12 and v14
  - [feat: drop support for node v12](https://github.com/typescript-eslint/typescript-eslint/pull/5918)
  - ✨ [feat: drop support for node v14 and test against node v20](https://github.com/typescript-eslint/typescript-eslint/pull/7022): as Node 14 is now EOL
- [feat: bump minimum supported TS version to 4.2.4](https://github.com/typescript-eslint/typescript-eslint/pull/5915): this matches [DefinitelyTyped's 2-year support window](https://github.com/DefinitelyTyped/DefinitelyTyped#support-window).
- [chore: drop support for ESLint v6](https://github.com/typescript-eslint/typescript-eslint/pull/5972)
- [feat(eslint-plugin): [prefer-readonly-parameter-types] added an optional type allowlist](https://github.com/typescript-eslint/typescript-eslint/pull/4436): changes the public `isTypeReadonlyArrayOrTuple` function's first argument from a `checker: ts.TypeChecker` to a full `program: ts.Program`
- ✨ [feat: add new package `rule-tester`](https://github.com/typescript-eslint/typescript-eslint/pull/6777): creates a new `@typescript-eslint/rule-tester` package for testing rules, and updates our documentation to recommend it

## Developer-Facing Changes

typescript-eslint v6 comes with a suite of cleanups and improvements for developers as well.
If you author any ESLint plugins or other tools that interact with TypeScript syntax, then we recommend you try out typescript-eslint v6 soon.
It includes some breaking changes that you may need to accommodate for.

:::tip
If you're having trouble with the changes, please let us know on [the typescript-eslint Discord](https://discord.gg/FSxKq8Tdyg)!
:::

### Type Checker Wrapper APIs

As described in our [ASTs and typescript-eslint](/blog/asts-and-typescript-eslint) post, ESLint rules don't natively work with AST nodes compatible with TypeScript's API.
Retrieving type information for an ESLint AST node in a custom rule requires code somewhat like:

```ts title="custom-rule-with-v5.ts"
{
  // ...
  create() {
    const services = util.getParserServices(context);
    const checker = services.program.getTypeChecker();
    const tsNode = services.esTreeNodeToTSNodeMap.get(esNode);
    const type = checker.getTypeAtLocation(node);

    // ...
  }
  // ...
}
```

How cumbersome, just to call to a single method (`getTypeAtLocation`) on the TypeScript API!

In typescript-eslint v6, we've added a set of wrapper APIs on the `services: ParserServices` object that act as shortcuts for commonly used TypeScript APIs including `getTypeAtLocation`:

```ts title="custom-rule-with-v6.ts"
{
  // ...
  create() {
    const services = util.getParserServices(context);
    const type = services.getTypeAtLocation(node);

    // ...
  }
  // ...
}
```

For now, the available wrapper APIs are:

- `getSymbolAtLocation`: passes an ESTree's equivalent TypeScript node to `checker.getSymbolAtLocation`
- `getTypeAtLocation`: passes an ESTree node's equivalent TypeScript node to `checker.getTypeAtLocation`

We hope these wrapper APIs make it more convenient to write lint rules that rely on the awesome power of TypeScript's type checking.
In the future, we may add more wrapper APIs, and may even add internal caching to those APIs to improve performance.

:::note
Rules can still retrieve their full backing TypeScript type checker with `services.program.getTypeChecker()`.
This can be necessary for TypeScript APIs not wrapped by the parser services.
:::

See [_Custom Rules_](https://typescript-eslint.io/developers/custom-rules) for the updated documentation on creating custom rules with typescript-eslint.

### AST Breaking Changes

These PRs changed the AST shapes generated by typescript-eslint when parsing code.
If you author any ESLint rules that refer to the syntax mentioned by them, these are relevant to you.

- [feat: remove semantically invalid properties from TSEnumDeclaration, TSInterfaceDeclaration and TSModuleDeclaration](https://github.com/typescript-eslint/typescript-eslint/pull/4863): Removes some properties from those AST node types that should generally not have existed to begin with.
- [fix(utils): removed TRuleListener generic from the createRule](https://github.com/typescript-eslint/typescript-eslint/pull/5036): Makes `createRule`-created rules more portable in the type system.
- [feat: made BaseNode.parent non-optional](https://github.com/typescript-eslint/typescript-eslint/pull/5252): makes the `node.parent` property on AST nodes non-optional (`TSESTree.Node` instead of `TSESTree.Node | undefined`).
- [fix: rename typeParameters to typeArguments where needed](https://github.com/typescript-eslint/typescript-eslint/pull/5384): corrects the names of AST properties that were called _parameters_ instead of _arguments_.
  - To recap the terminology:
    - An _argument_ is something you provide to a recipient, such as a type provided explicitly to a call expression.
    - A _parameter_ is how the recipient receives what you provide, such as a function declaration's generic type parameter.
- [fix(ast-spec): correct some incorrect ast types](https://github.com/typescript-eslint/typescript-eslint/pull/6257): applies the following changes to correct erroneous types of AST node properties:
  - `ArrayExpressions`'s `elements` property can now include `null` (i.e. is now `(Expression | SpreadElement | null)[]`), for the case of sparse arrays (e.g. `[1, , 3]`).
  - `MemberExpression`'s `object` property is now `Expression`, not `LeftHandSideExpression`.
  - `ObjectLiteralElement` no longer allows for `MethodDefinition`.
- [fix(typescript-estree): wrap import = declaration in an export node](https://github.com/typescript-eslint/typescript-eslint/pull/5885): Exported `TSImportEqualsDeclaration` nodes are now wrapped in an `ExportNamedDeclaration` node instead of having `.isExport = true` property.
- [fix(ast-spec): remove more invalid properties](https://github.com/typescript-eslint/typescript-eslint/pull/6243): applies the following changes to remove invalid properties from AST nodes:
  - `MethodDefinitionBase` no longer has a `typeParameters` property.
  - `TSIndexSignature`, `TSMethodSignature`, and `TSPropertySignatureBase` no longer have an `export` property.
  - `TSPropertySignatureBase` no longer has an `initializer` property.
- [fix(typescript-estree): account for namespace nesting in AST conversion](https://github.com/typescript-eslint/typescript-eslint/pull/6272): Namespaces with qualified names like `Abc.Def` now use a `TSQualifiedName` node, instead of a nested body structure.
- [feat(typescript-estree): remove optionality from AST boolean properties](https://github.com/typescript-eslint/typescript-eslint/pull/6274): Switches most AST properties marked as `?: boolean` to `: boolean`, as well as some properties marked as `?:` optional to `| undefined`. This results in more predictable AST node object shapes.

### Errors on Invalid AST Parsing

:::note
These changes only impact API consumers of typescript-eslint that work at parsing level.
If the extent of your API usage is writing custom rules, these changes don't impact you.
:::

The `@typescript-eslint/typescript-estree` parser is by default very forgiving of invalid ASTs.
If it encounters invalid syntax, it will still attempt create an AST if possible: even if required properties of nodes don't exist.

For example, this snippet of TypeScript code creates a `ClassDeclaration` whose `id` is `null`:

```ts
export class {}
```

Invalid parsed ASTs can cause problems for downstream tools expecting AST nodes to adhere to the ESTree spec.
ESLint rules in particular tend to crash when given invalid ASTs.

`@typescript-eslint/typescript-estree` will now throw an error when it encounters a known invalid AST such as the `export class {}` example.
This is generally the correct behavior for most parsing contexts so downstream tools don't have to work with a potentially invalid AST.

For consumers that don't want the updated behavior of throwing on invalid ASTs, a new `allowInvalidAST` option exists to disable the throwing behavior.
Keep in mind that with it enabled, ASTs produced by typescript-eslint might not match their TSESTree type definitions.

For more information, see:

- The backing issue: [Parsing: strictly enforce the produced AST matches the spec and enforce most "error recovery" parsing errors](https://github.com/typescript-eslint/typescript-eslint/issues/1852)
- The implementing pull request: [feat(typescript-estree): added allowInvalidAST option to throw on invalid tokens](https://github.com/typescript-eslint/typescript-eslint/pull/6247)
- ✨ [fix: fix illegal decorator check](https://github.com/typescript-eslint/typescript-eslint/pull/6723): improves how invalid decorator syntax is parsed and reported on

### Package Exports

The v5 `@typescript-eslint/` packages don't use [Node.js package.json exports](https://nodejs.org/api/packages.html#package-entry-points), so anyone can import any file in any package by directly referencing a path within the dist folder.
For example:

```ts
import * as TSESLint from '@typescript-eslint/utils/dist/ts-eslint';
```

That presents a few issues for developers:

- It can be unclear which of many potential import paths to use
- TypeScript sometimes suggests importing types or values meant to be private
- Consumers using deep import paths can be broken by internal refactors that rename files

As of [feat: add package.json exports for public packages](https://github.com/typescript-eslint/typescript-eslint/pull/6458), `@typescript-eslint/*` packages now use `exports` to prevent importing internal file paths.
Developers must now mostly import directly from the package names, e.g.:

```ts
import * as TSESLint from '@typescript-eslint/utils/ts-eslint';
```

See [RFC: Use package.json exports to "hide" the dist folder for packages and control our exported surface-area](https://github.com/typescript-eslint/typescript-eslint/discussions/6015) for more backing context.

### Other Developer-Facing Breaking Changes

- [feat(utils): remove (ts-)eslint-scope types](https://github.com/typescript-eslint/typescript-eslint/pull/5256): Removes no-longer-useful `TSESLintScope` types from the `@typescript-eslint/utils` package. Use `@typescript-eslint/scope-manager` directly instead.
- [Enhancement: Add test-only console warnings to deprecated AST properties](https://github.com/typescript-eslint/typescript-eslint/issues/6469): The properties will include a `console.log` that triggers only in test environments, to encourage developers to move off of them.
- [feat(scope-manager): ignore ECMA version](https://github.com/typescript-eslint/typescript-eslint/pull/5889): `@typescript-eslint/scope-manager` no longer includes properties referring to `ecmaVersion`, `isES6`, or other ECMA versioning options. It instead now always assumes ESNext.
- [feat: remove partial type-information program](https://github.com/typescript-eslint/typescript-eslint/pull/6066): When user configurations don't provide a `parserOptions.project`, parser services will no longer include a `program` with incomplete type information. `program` will be `null` instead.
- [feat: remove experimental-utils](https://github.com/typescript-eslint/typescript-eslint/pull/6468): The `@typescript-eslint/experimental-utils` package has since been renamed to `@typescript-eslint/utils`.
  - As a result, the `errorOnTypeScriptSyntacticAndSemanticIssues` option will no longer be allowed if `parserOptions.project` is not provided.
- [chore(typescript-estree): remove visitor-keys backwards compat export](https://github.com/typescript-eslint/typescript-eslint/pull/6242): `visitorKeys` can now only be imported from `@typescript-eslint/visitor-keys`. Previously it was also re-exported by `@typescript-eslint/utils`.
- ✨ [feat: fork json schema types for better compat with ESLint rule validation](https://github.com/typescript-eslint/typescript-eslint/pull/6963): clarifies the JSON schema types exported for rule options to match ESLint's and remove an unsafe `[string: any]` index
- ✨ [feat(typescript-estree): remove parseWithNodeMaps](https://github.com/typescript-eslint/typescript-eslint/pull/7120): removed a `parseWithNodeMaps` API previously intended only for Prettier that is no longer used by Prettier
- ✨ [Consider keeping parserServices.hasFullTypeInformation for another major version?](https://github.com/typescript-eslint/typescript-eslint/issues/7124): we're removing an old, undocumented `hasFullTypeInformation` property from `parserServices`.

## Appreciation

We'd like to extend a sincere _thank you_ to everybody who pitched in to make typescript-eslint v6 possible.

- Ourselves on the maintenance team:
  - [Armano](https://github.com/armano2)
  - [Brad Zacher](https://github.com/bradzacher)
  - [James Henry](https://github.com/JamesHenry)
  - [Josh Goldberg](https://github.com/JoshuaKGoldberg)
  - [Joshua Chen](https://github.com/Josh-Cena)
- Community contributors whose PRs were merged into the 6.0.0 release:
  <!-- cspell:disable -->
  - [Bryan Mishkin](https://github.com/bmish)
  - [fisker Cheung](https://github.com/fisker)
  - [Juan García](https://github.com/juank1809)
  - [Kevin Ball](https://github.com/kball)
  - [Marek Dědič](https://github.com/marekdedic)
  - [Mateusz Burzyński](https://github.com/Andarist)
  <!-- cspell:enable -->
- Community projects that worked with us to try out the reworked preset configs:
  - [Astro](https://github.com/withastro/astro/pull/7425)
  - [Babel](https://github.com/babel/babel/pull/15716)
  - [create-t3-app](https://github.com/t3-oss/create-t3-app/pull/1476)
  - [trpc](https://github.com/trpc/trpc/pull/4541)
  - [TypeScript](https://github.com/microsoft/TypeScript/pull/54693)

See the [v6.0.0 milestone](https://github.com/typescript-eslint/typescript-eslint/milestone/8) for the list of issues and associated merged pull requests.

## Supporting typescript-eslint

If you enjoyed this blog post and/or or use typescript-eslint, please consider [supporting us on Open Collective](https://opencollective.com/typescript-eslint).
We're a small volunteer team and could use your support to make the ESLint experience on TypeScript great.
Thanks! 💖
