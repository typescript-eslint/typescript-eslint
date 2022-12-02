---
id: typed-linting
title: Linting with Type Information
---

Some typescript-eslint rules utilize the awesome power of TypeScript's type checking APIs to provide much deeper insights into your code.
To tap into TypeScript's additional powers, there are two small changes you need to make to your config file:

```js title=".eslintrc.js"
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  // Added lines start
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  // Added lines end
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Add this line
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
};
```

In more detail:

- `parserOptions.tsconfigRootDir` tells our parser the absolute path of your project's root directory.
- `parserOptions.project` tells our parser the relative path where your project's `tsconfig.json` is.
  - If your project is a multi-package monorepo, see [our docs on configuring a monorepo](./typed-linting/Monorepos.md).
- `plugin:@typescript-eslint/recommended-requiring-type-checking` is another recommended configuration we provide. This one contains rules that specifically require type information.

With that done, run the same lint command you ran before.
You may see new rules reporting errors based on type information!

## FAQs

### How is performance?

Typed rules come with a catch.
By including `parserOptions.project` in your config, you incur the performance penalty of asking TypeScript to do a build of your project before ESLint can do its linting.
For small projects this takes a negligible amount of time (a few seconds or less); for large projects, it can take longer.

Most of our users do not mind this cost as the power and safety of type-aware static analysis rules is worth the tradeoff.
Additionally, most users primarily consume lint errors via IDE plugins which, through caching, do not suffer the same penalties.
This means that generally they usually only run a complete lint before a push, or via their CI, where the extra time often doesn't matter.

**We strongly recommend you do use type-aware linting**, but the above information is included so that you can make your own, informed decision.

### I get errors telling me "The file must be included in at least one of the projects provided"

You're using an outdated version of `@typescript-eslint/parser`.
Update to the latest version to see a more informative version of this error message, explained in our [Troubleshooting and FAQs page](./Troubleshooting.md#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file).

## Troubleshooting

If you're having problems getting this working, please have a look at our [Troubleshooting and FAQs page](./Troubleshooting.md).
