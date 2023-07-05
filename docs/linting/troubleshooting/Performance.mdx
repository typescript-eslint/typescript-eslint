---
id: performance-troubleshooting
title: Performance Troubleshooting
---

As mentioned in the [type-aware linting doc](../Typed_Linting.mdx), if you're using type-aware linting, your lint times should be roughly the same as your build times.

If you're experiencing times much slower than that, then there are a few common culprits.

## Wide includes in your `tsconfig`

When using type-aware linting, you provide us with one or more tsconfigs.
We then will pre-parse all files so that full and complete type information is available.

If you provide very wide globs in your `include` (such as `**/*`), it can cause many more files than you expect to be included in this pre-parse.
Additionally, if you provide no `include` in your tsconfig, then it is the same as providing the widest glob.

Wide globs can cause TypeScript to parse things like build artifacts, which can heavily impact performance.
Always ensure you provide globs targeted at the folders you are specifically wanting to lint.

## Wide includes in your ESLint options

Specifying `tsconfig.json` paths in your ESLint commands is also likely to cause much more disk IO than expected.
Instead of globs that use `**` to recursively check all folders, prefer paths that use a single `*` at a time.

```js title=".eslintrc.js"
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    // Remove this line
    project: ['./**/tsconfig.json'],
    // Add this line
    project: ['./packages/*/tsconfig.json'],
  },
  plugins: ['@typescript-eslint'],
  root: true,
};
```

See [Glob pattern in parser's option "project" slows down linting](https://github.com/typescript-eslint/typescript-eslint/issues/2611) for more details.

## The `indent` / `@typescript-eslint/indent` rules

This rule helps ensure your codebase follows a consistent indentation pattern.
However this involves a _lot_ of computations across every single token in a file.
Across a large codebase, these can add up, and severely impact performance.

We recommend not using this rule, and instead using a tool like [`prettier`](https://www.npmjs.com/package/prettier) to enforce a standardized formatting.

See our [documentation on formatting](./Formatting.mdx) for more information.

## `eslint-plugin-prettier`

This plugin surfaces prettier formatting problems at lint time, helping to ensure your code is always formatted.
However this comes at a quite a large cost - in order to figure out if there is a difference, it has to do a prettier format on every file being linted.
This means that each file will be parsed twice - once by ESLint, and once by Prettier.
This can add up for large codebases.

Instead of using this plugin, we recommend using prettier's `--list-different` flag to detect if a file has not been correctly formatted.
For example, our CI is setup to run the following command automatically, which blocks PRs that have not been formatted:

```bash npm2yarn
npm run prettier --list-different \"./**/*.{ts,mts,cts,tsx,js,mjs,cjs,jsx,json,md,css}\"
```

## `eslint-plugin-import`

This is another great plugin that we use ourselves in this project.
However there are a few rules which can cause your lints to be really slow, because they cause the plugin to do its own parsing, and file tracking.
This double parsing adds up for large codebases.

There are many rules that do single file static analysis, but we provide the following recommendations.

We recommend you do not use the following rules, as TypeScript provides the same checks as part of standard type checking:

- `import/named`
- `import/namespace`
- `import/default`
- `import/no-named-as-default-member`

The following rules do not have equivalent checks in TypeScript, so we recommend that you only run them at CI/push time, to lessen the local performance burden.

- `import/no-named-as-default`
- `import/no-cycle`
- `import/no-unused-modules`
- `import/no-deprecated`

### `import/extensions`

#### Enforcing extensions are used

If you want to enforce file extensions are always used and you're **NOT** using `moduleResolution` `node16` or `nodenext`, then there's not really a good alternative for you, and you should continue using the `import/extensions` lint rule.

If you want to enforce file extensions are always used and you **ARE** using `moduleResolution` `node16` or `nodenext`, then you don't need to use the lint rule at all because TypeScript will automatically enforce that you include extensions!

#### Enforcing extensions are not used

On the surface `import/extensions` seems like it should be fast for this use case, however the rule isn't just a pure AST-check - it has to resolve modules on disk so that it doesn't false positive on cases where you are importing modules with an extension as part of their name (eg `foo.js` resolves to `node_modules/foo.js/index.js`, so the `.js` is required). This disk lookup is costly and thus makes the rule slow.

If your project doesn't use any `npm` packages with a file extension in their name, nor do you name your files with two extensions (like `bar.js.ts`), then this extra cost probably isn't worth it, and you can use a much simpler check using the [`no-restricted-syntax`](https://eslint.org/docs/latest/rules/no-restricted-syntax) lint rule.

The below config is several orders of magnitude faster than `import/extensions` as it does not do disk lookups, however it will false-positive on cases like the aforementioned `foo.js` module.

```js
function banImportExtension(extension) {
  const message = `Unexpected use of file extension (.${extension}) in import`;
  const literalAttributeMatcher = `Literal[value=/\\.${extension}$/]`;
  return [
    {
      // import foo from 'bar.js';
      selector: `ImportDeclaration > ${literalAttributeMatcher}.source`,
      message,
    },
    {
      // const foo = import('bar.js');
      selector: `ImportExpression > ${literalAttributeMatcher}.source`,
      message,
    },
    {
      // type Foo = typeof import('bar.js');
      selector: `TSImportType > TSLiteralType > ${literalAttributeMatcher}`,
      message,
    },
    {
      // const foo = require('foo.js');
      selector: `CallExpression[callee.name = "require"] > ${literalAttributeMatcher}.arguments`,
      message,
    },
  ];
}

module.exports = {
  // ... other config ...
  rules: {
    'no-restricted-syntax': [
      'error',
      ...banImportExtension('js'),
      ...banImportExtension('jsx'),
      ...banImportExtension('ts'),
      ...banImportExtension('tsx'),
    ],
  },
};
```
