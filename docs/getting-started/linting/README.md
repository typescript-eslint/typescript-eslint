# Getting Started - Linting your TypeScript Codebase

Whether you're adding linting to a new TypeScript codebase, adding TypeScript to an old codebase, or migraing from the deprecated [tslint](https://www.npmjs.com/package/tslint), the steps aren't a whole lot different.

## Installation

First step is to make sure you've got the required packages installed:

```bash
$ yarn add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

## Configuration

Next, create a `.eslintrc.js` config file in the root of your project, and populate it with the following:

```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
};
```

This is about the smallest config file we recommend. There's a lot more you can add to this as you further onboard, but this will be enough to get you started.

Explaining the important bits:

- `parser: '@typescript-eslint/parser'` tells ESLint to use the parser package you installed ([`@typescript-eslint/parser`](../../../packages/parser)).
  - This allows ESLint to understand TypeScript syntax.
  - This is required, or else ESLint will throw errors as it tries to parse TypeScript code as if it were regular JavaScript.
- `plugins: ['@typescript-eslint']` tells ESLint to load the plugin package you installed ([`@typescript-eslint/eslint-plugin`](../../../packages/eslint-plugin)).
  - This allows you to use the rules within your codebase.
- `extends: [ ... ]` tells ESLint that your config extends the given configurations.
  - `eslint:recommended` is ESLint's inbuilt "recommended" config - it turns on a small, sensible set of rules which lint for well-known best-practices.
  - `plugin:@typescript-eslint/eslint-recommended` is a configuration we provide which disables a few of the recommended rules from the previous set that we know are already covered by TypeScript's typechecker.
  - `plugin:@typescript-eslint/recommended` is our "recommended" config - it's just like `eslint:recommended`, except it only turns on rules from our TypeScript-specific plugin.

Further reading:

- You can read more about configuring ESLint [in their documentation on configuration.](https://eslint.org/docs/user-guide/configuring).
- You can read more about the rules provided by ESLint [in their documentation on their rules](https://eslint.org/docs/rules/).
- You can read more about the rules provided by us in [our plugin documentation](../../../packages/eslint-plugin).

## Ignoring unnecessary files

Next, create a `.eslintignore` file in the root of your project.
This file will tell ESLint which files and folders it should never lint.

Add the following lines to the file:

```ignore
# don't ever lint node_modules
node_modules
# don't lint build output (make sure it's set to your correct build folder name)
dist
# don't lint nyc coverage output
coverage
```

## Running the lint

With that configured, open a terminal to the root of your project, and run the following command

```bash
$ yarn eslint . --ext .js,.jsx,.ts,.tsx
```

That's it - ESLint will lint all `.js`, `.jsx`, `.ts`, and `.tsx` files within the current folder, and will output the results to your terminal.

You can also get results in realtime inside most IDEs via a plugin - just search your IDE's extension store.

## Getting advanced with type-aware rules

The parser you configured earlier has a little secret. Under the hood, it actually just uses TypeScript's own APIs to parse the files. This means that in the right circumstance, we can access all of the type information that TypeScript knows about your codebase.

So how can we tap into this? There are two small changes you need to make to your config file:

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
  - If you have a complex setup with multiple tsconfigs, such as in a monorepo, see [our docs on configuring a monorepo](./MONOREPO.md).
- `plugin:@typescript-eslint/recommended-requiring-type-checking` is another recommended configuration we provide. This one contains rules that specifically require type information.

With that done, simply run the same lint command you ran before. You will see new rules reporting errors based on type information!

_But wait_ - I hear you exclaim - _why would you ever not want type-aware rules?_

Well (for full disclosure) there is a catch; by including `parserOptions.project` in your config, you are essentially asking TypeScript to do a build of your project before ESLint can do its linting. For small projects this takes a negligable amount of time (a few seconds); for large projects, it can take longer (30s or more).

Most of our users are fine with this, as they think the power of type-aware static analysis is worth it.
Additionally, most users primarily consume lint errors via IDE plugins which, through some caching magic, do not suffer the same penalties. This means that generally they usually only run a complete lint before a push, or via their CI, where the extra time really doesn't matter.

We strongly recommend you do use it, but the above information is included so that you can make your own, informed decision.

### Troubleshooting / FAQ

#### I get errors telling me "The file must be included in at least one of the projects provided"

This error means that the file that's being linted is not included in any of the tsconfig files you provided us. A lot of the time this happens when users have test files or similar that are not included.

To fix this, simply make sure the `include` option in your tsconfig includes every single file you want to lint.

One way to easily fix this is to create a new tsconfig file, called `tsconfig.eslint.json`, which looks something like the following config. Make sure to update your `.eslintrc.js` so it points at this tsconfig!

```jsonc
{
  // extend the base config to share compilerOptions
  "extends": "./tsconfig.json",
  // include all files to be linted
  "include": ["src", "tests", "tools"]
}
```

#### I use a framework (like Vue) that requires custom extensions, how can I make it work?

You can use `parserOptions.extraFileExtensions` to specify an array of non-typescript extensions to allow, for example:

```diff
 parserOptions: {
   tsconfigRootDir: __dirname,
   project: ['./tsconfig.json'],
+  extraFileExtensions: ['.vue'],
 },
```
