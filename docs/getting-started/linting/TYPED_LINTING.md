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
     'plugin:@typescript-eslint/eslint-recommended',
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

Well (for full disclosure) there is a catch; by including `parserOptions.project` in your config, you are essentially asking TypeScript to do a build of your project before ESLint can do its linting. For small projects this takes a negligable amount of time (a few seconds); for large projects, it can take longer (30s or more).

Most of our users are fine with this, as they think the power of type-aware static analysis is worth it.
Additionally, most users primarily consume lint errors via IDE plugins which, through some caching magic, do not suffer the same penalties. This means that generally they usually only run a complete lint before a push, or via their CI, where the extra time really doesn't matter.

We strongly recommend you do use it, but the above information is included so that you can make your own, informed decision.

## FAQ

If you're having problems getting this working, please have a look at our [Troubleshooting FAQ](./FAQ.md).
