---
id: formatting
title: What About Formatting?
---

We strongly recommend against using ESLint for formatting.
We strongly recommend using [Prettier](https://prettier.io), [dprint](https://dprint.dev), or an equivalent instead.

## ESLint Core and Formatting

Per [ESLint's 2020 Changes to Rule Policies blog post](https://eslint.org/blog/2020/05/changes-to-rules-policies#what-are-the-changes):

> Stylistic rules are frozen - we won't be adding any more options to stylistic rules.
> We've learned that there's no way to satisfy everyone's personal preferences, and most of the rules already have a lot of difficult-to-understand options.
> Stylistic rules are those related to spacing, conventions, and generally anything that does not highlight an error or a better way to do something.

We support the ESLint team's decision and backing logic to move away from stylistic rules.
With the exception of bug fixes, no new formatting-related pull requests will be accepted into typescript-eslint.

## Formatters vs. Linters

**Formatters** are tools that verify and correct whitespace issues in code, such as spacing and newlines.
Formatters typically run very quickly because they are only concerned with changing whitespace, not code logic or naming.

**Linters** are tools that verify and correct logical and non-whitespace style issues in code, such as naming consistency and bug detection.
Linters often take seconds or more to run because they apply many logical rules to code.

### Problems with Using Linters as Formatters

Linters are designed to run in a parse, check, report, fix cycle. This means that there is a lot of intermediate work that needs to be done before a linter can fix a formatting issue with your code.

Additionally linters typically run each rule isolated from one another. This has several problems with it such as:

- any two lint rules can't share config meaning one lint rule's fixer might introduce a violation of another lint rule's fixer (eg one lint rule might use the incorrect indentation character).
- lint rule fixers can conflict (apply to the same code range), forcing the linter to perform an additional cycle to attempt to apply a fixer to a clean set of code.

These problems cause a linter to be much slower and, more importantly, much less consistent and less able to handle edge-cases than a purpose-built formatter.

Modern formatters such as Prettier are architected in a way that applies formatting to all code regardless of original formatting which helps them be more consistent.

### Suggested Usage - Prettier

We recommend using [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) to disable formatting rules in your ESLint configuration.
You can then configure your formatter separately from ESLint.

Using this config by adding it to the end of your `extends`:

```js title=".eslintrc.js"
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Add this line
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
};
```

Note that even if you don't use `prettier`, you can use `eslint-config-prettier` as it exclusively turns **off** all formatting rules.
