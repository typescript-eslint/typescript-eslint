# Getting Started - Linting with Type Information

The parser you configured earlier has a little secret. Under the hood, it actually just uses TypeScript's compiler APIs to parse the files. This means that we can provide lint rules with access to all of the type information that TypeScript knows about your codebase.

This provides a lot of additional power, unlocking many possibilities for static analysis.

How can we tap into this? There are two small changes you need to make to your config file:

```diff
 module.exports = {
   root: true,
   parser: '@typescript-eslint/parser',
+  parserOptions: {
+    tsconfigRootDir: __dirname,
+    project: ['./tsconfig.json'],
+  },
   plugins: ['@typescript-eslint'],
   extends: [
     'eslint:recommended',
     'plugin:@typescript-eslint/recommended',
+    'plugin:@typescript-eslint/recommended-requiring-type-checking',
   ],
 };
```

The first change is adding the `parserOptions` configuration:

- `parserOptions.tsconfigRootDir` tells our parser the absolute path of your project's root directory.
- `parserOptions.project` tells our parser the relative path where your project's `tsconfig.json` is.
  - If your project is a multi-package monorepo, see [our docs on configuring a monorepo](./MONOREPO.md).
- `plugin:@typescript-eslint/recommended-requiring-type-checking` is another recommended configuration we provide. This one contains rules that specifically require type information.

With that done, simply run the same lint command you ran before. You will see new rules reporting errors based on type information!

## Performance

_But wait_ - I hear you exclaim - _why would you ever not want type-aware rules?_

Well (for full disclosure) there is a catch; by including `parserOptions.project` in your config, you are essentially asking TypeScript to do a build of your project before ESLint can do its linting. For small projects this takes a negligible amount of time (a few seconds); for large projects, it can take longer (30s or more).

Most of our users are fine with this, as they think the power of type-aware static analysis is worth it.
Additionally, most users primarily consume lint errors via IDE plugins which, through some caching magic, do not suffer the same penalties. This means that generally they usually only run a complete lint before a push, or via their CI, where the extra time really doesn't matter.

We strongly recommend you do use it, but the above information is included so that you can make your own, informed decision.

## I get errors telling me "The file must be included in at least one of the projects provided"

This error means that the file that's being linted is not included in any of the tsconfig files you provided us. A lot of the time this happens when users have test files or similar that are not included in their normal tsconfigs.

There are a couple of solutions to this, depending on what you want to achieve.

- If you **do not** want to lint the file:
  - Use [one of the options ESLint offers](https://eslint.org/docs/user-guide/configuring#ignoring-files-and-directories) to ignore files, like a `.eslintignore` file, or `ignorePatterns` config.
- If you **do** want to lint the file:
  - If you **do not** want to lint the file with [type-aware linting](./TYPED_LINTING.md):
    - Use [ESLint's `overrides` configuration](https://eslint.org/docs/user-guide/configuring#configuration-based-on-glob-patterns) to configure the file to not be parsed with type information.
  - If you **do** want to lint the file with [type-aware linting](./TYPED_LINTING.md):
    - Check the `include` option of each of the tsconfigs that you provide to `parserOptions.project` - you must ensure that all files match an `include` glob, or else our tooling will not be able to find it.
    - If your file shouldn't be a part of one of your existing tsconfigs (for example, it is a script/tool local to the repo), then consider creating a new tsconfig (we advise calling it `tsconfig.eslint.json`) in your project root which lists this file in its `include`. For an example of this, you can check out the configuration we use in this repo:
      - [`tsconfig.eslint.json`](../../../tsconfig.eslint.json)
      - [`.eslintrc.js`](../../../.eslintrc.js)

## FAQ

If you're having problems getting this working, please have a look at our [Troubleshooting FAQ](./FAQ.md).
