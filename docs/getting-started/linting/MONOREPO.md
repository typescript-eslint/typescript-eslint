# Getting Started - Monorepo Configuration

If you're using a monorepo, these docs will help you figure out how to setup typed linting.
If you don't want to use typed linting, then you can stop here - you don't need to do anything special.

The first question to answer is how are your `tsconfig.json` setup? You should have one of two setups:

1. One `tsconfig.json` per package (and an optional one in the root)
2. One root `tsconfig.json`

Which config style you specifically choose doesn't matter

## One `tsconfig.json` per package (and an optional one in the root)

This setup is pretty easy to configure. Earlier in our docs on [typed linting](./TYPED_LINTING.md), we showed you how to setup a config for typed linting using the `parserOptions.project` option. This option accepts an array of relative paths, allowing you to specify each and every `tsconfig.json` in your monorepo. For those of you with too many packages, you can also supply a [glob path](https://github.com/isaacs/node-glob/blob/f5a57d3d6e19b324522a3fa5bdd5075fd1aa79d1/README.md#glob-primer).

For example, this is how we specify all of our `tsconfig.json` within this repo.

```diff
 module.exports = {
   root: true,
   parser: '@typescript-eslint/parser',
   parserOptions: {
     tsconfigRootDir: __dirname,
-    project: ['./tsconfig.json'],
+    project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
   },
   plugins: ['@typescript-eslint'],
   extends: [
     'eslint:recommended',
     'plugin:@typescript-eslint/recommended',
     'plugin:@typescript-eslint/recommended-requiring-type-checking',
   ],
 };
```

If you're looking for an example of what the `.eslintrc.js`, and referenced `tsconfig.json` might look like in a real example, look no further than this very repo. We're a multi-package monorepo that uses one `tsconfig.json` per package, that also uses typed linting.

### Important note regarding large (> 10) multi-package monorepos

We've had reports that for sufficiently large and/or interdependent projects, you may run into OOMs using this approach. Our advice is to set it up and test first, as there are very few cases that trigger this OOM. We are in the process of investigating solutions with the help of the TypeScript team.

See [#1192](https://github.com/typescript-eslint/typescript-eslint/issues/1192) for more information and discussion.

If you do run into an OOM, please comment on the above issue and let us know about your repo - the more information we have, the better. As an interim workaround, consider one of the following:

- Switching to one root `tsconfig.eslint.json` (see below)
- Using a shell script to only lint one package at a time, using your existing config above.

## One root `tsconfig.json`

If you've only got one, you should inspect the `include` paths. If it doesn't include all of your files, then we won't be able to lint them. In this instance, you have two options: add them in to the `include`, or create a new config.

The former doesn't always work for everyone if they've got a complex build, adding more paths (like test paths) to `include` could break the build, so in those cases we suggest creating a new config; called `tsconfig.eslint.json`, that looks something like this:

```jsonc
{
  // extend your base config to share compilerOptions, etc
  "extends": "./tsconfig.json",
  "compilerOptions": {
    // ensure that nobody can accidentally use this config for a build
    "noEmit": true
  },
  "include": [
    // whatever paths you intend to lint
    "src",
    "test",
    "tools"
  ]
}
```

Of course, ensure you update your `.eslintrc.js` to point at this new config file.

## FAQ

If you're having problems getting this working, please have a look at our [Troubleshooting FAQ](./FAQ.md).
