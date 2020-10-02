# Troubleshooting / FAQ

## Table of Contents

- [I am using a rule from ESLint core, and it doesn't work correctly with TypeScript code](#i-am-using-a-rule-from-eslint-core-and-it-doesnt-work-correctly-with-typescript-code)
- [I get errors telling me "The file must be included in at least one of the projects provided"](#i-get-errors-telling-me-the-file-must-be-included-in-at-least-one-of-the-projects-provided)
- [I use a framework (like Vue) that requires custom file extensions, and I get errors like "You should add `parserOptions.extraFileExtensions` to your config"](#i-use-a-framework-like-vue-that-requires-custom-file-extensions-and-i-get-errors-like-you-should-add-parseroptionsextrafileextensions-to-your-config)
- [One of my lint rules isn't working correctly on a pure JavaScript file](#one-of-my-lint-rules-isnt-working-correctly-on-a-pure-javascript-file)
- [TypeScript should be installed locally](#typescript-should-be-installed-locally)
- [How can I ban `<specific language feature>`?](#how-can-i-ban-specific-language-feature)
- [Why don't I see TypeScript errors in my ESLint output?](#why-dont-i-see-typescript-errors-in-my-eslint-output)
- [I get errors from the `no-undef` rule about global variables not being defined, even though there are no TypeScript errors](#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors)
- [How do I check to see what versions are installed?](#how-do-i-check-to-see-what-versions-are-installed)
- [My linting feels really slow](#my-linting-feels-really-slow)

---

<br />
<br />
<br />

## I am using a rule from ESLint core, and it doesn't work correctly with TypeScript code

This is a pretty common thing because TypeScript adds new features that ESLint doesn't know about.

The first step is to [check our list of "extension" rules here](../../../packages/eslint-plugin/README.md#extension-rules). An extension rule is simply a rule which extends the base ESLint rules to support TypeScript syntax. If you find it in there, give it a go to see if it works for you. You can configure it by disabling the base rule, and turning on the extension rule. Here's an example with the `semi` rule:

```json
{
  "rules": {
    "semi": "off",
    "@typescript-eslint/semi": "error"
  }
}
```

If you don't find an existing extension rule, or the extension rule doesn't work for your case, then you can go ahead and check our issues. [The contributing guide outlines the best way to raise an issue](../../../CONTRIBUTING.md#raising-issues).

We release a new version our tooling every week. **_Please_** ensure that you [check our the latest list of "extension" rules](../../../packages/eslint-plugin/README.md#extension-rules) **_before_** filing an issue.

<br />
<br />
<br />

---

<br />
<br />
<br />

## I get errors telling me "The file must be included in at least one of the projects provided"

This error means that the file that's being linted is not included in any of the tsconfig files you provided us. A lot of the time this happens when users have test files or similar that are not included.

There are a couple of solutions to this, depending on what you want to achieve.

See our docs on [type aware linting](./TYPED_LINTING.md#i-get-errors-telling-me-the-file-must-be-included-in-at-least-one-of-the-projects-provided) for solutions to this.

<br />
<br />
<br />

---

<br />
<br />
<br />

## I use a framework (like Vue) that requires custom file extensions, and I get errors like "You should add `parserOptions.extraFileExtensions` to your config"

You can use `parserOptions.extraFileExtensions` to specify an array of non-TypeScript extensions to allow, for example:

```diff
 parserOptions: {
   tsconfigRootDir: __dirname,
   project: ['./tsconfig.json'],
+  extraFileExtensions: ['.vue'],
 },
```

<br />
<br />
<br />

---

<br />
<br />
<br />

## One of my lint rules isn't working correctly on a pure JavaScript file

This is to be expected - ESLint rules do not check file extensions on purpose, as it causes issues in environments that use non-standard extensions (for example, a `.vue` and a `.md` file can both contain TypeScript code to be linted).

If you have some pure JavaScript code that you do not want to apply certain lint rules to, then you can use [ESLint's `overrides` configuration](https://eslint.org/docs/user-guide/configuring#configuration-based-on-glob-patterns) to turn off certain rules, or even change the parser based on glob patterns.

<br />
<br />
<br />

---

<br />
<br />
<br />

## TypeScript should be installed locally

Make sure that you have installed TypeScript locally i.e. by using `npm install typescript`, not `npm install -g typescript`,
or by using `yarn add typescript`, not `yarn global add typescript`. See https://github.com/typescript-eslint/typescript-eslint/issues/2041 for more information.

<br />
<br />
<br />

---

<br />
<br />
<br />

## How can I ban `<specific language feature>`?

ESLint core contains the rule [`no-restricted-syntax`](https://eslint.org/docs/rules/no-restricted-syntax). This generic rule allows you to specify a [selector](https://eslint.org/docs/developer-guide/selectors) for the code you want to ban, along with a custom error message.

You can use a tool like [AST Explorer](https://astexplorer.net/) to help in figuring out the structure of the AST that you want to ban.

For example, you can ban enums (or some variation of) using one of the following configs:

```jsonc
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      // ban all enums
      {
        "selector": "TSEnumDeclaration",
        "message": "My reason for not using any enums at all"
      },

      // ban just const enums
      {
        "selector": "TSEnumDeclaration[const=true]",
        "message": "My reason for not using const enums"
      },

      // ban just non-const enums
      {
        "selector": "TSEnumDeclaration:not([const=true])",
        "message": "My reason for not using non-const enums"
      }
    ]
  }
}
```

<br />
<br />
<br />

---

<br />
<br />
<br />

## Why don't I see TypeScript errors in my ESLint output?

TypeScript's compiler (or whatever your build chain may be) is specifically designed and built to validate the correctness of your codebase.
Our tooling does not reproduce the errors that TypeScript provides, because doing so would slow down the lint run [1], and duplicate the errors that TypeScript already outputs for you.

Instead, our tooling exists to **_augment_** TypeScript's built in checks with lint rules that consume the type information in new ways beyond just verifying the runtime correctness of your code.

[1] - TypeScript computes type information lazily, so us asking for the errors it would produce from the compiler would take an _additional_ ~100ms per file. This doesn't sound like a lot, but depending on the size of your codebase, it can easily add up to between several seconds to several minutes to a lint run.

<br />
<br />
<br />

---

<br />
<br />
<br />

## I get errors from the `no-undef` rule about global variables not being defined, even though there are no TypeScript errors

The `no-undef` lint rule does not use TypeScript to determine the global variables that exist - instead, it relies upon ESLint's configuration.

You can [manually define the set of allowed `globals` in your ESLint config](https://eslint.org/docs/user-guide/configuring#specifying-globals), and/or you can use one of the [pre-defined environment (`env`) configurations](https://eslint.org/docs/user-guide/configuring#specifying-environments).

As of our v4.0.0 release, this also applies to types. If you use global types from a 3rd party package (i.e. anything from an `@types` package), then you will have to configure ESLint appropriately to define these global types. For example; the `JSX` namespace from `@types/react` is a global 3rd party type that you must define in your ESLint config.

We strongly recommend that you do not use the `no-undef` lint rule on TypeScript projects. The checks it provides are already provided by TypeScript without the need for configuration - TypeScript just does this significantly better.

<br />
<br />
<br />

---

<br />
<br />
<br />

## How do I check to see what versions are installed?

If you have multiple versions of our tooling, it can cause various bugs for you. This is because ESLint may load a different version each run depending on how you run it - leading to inconsistent lint results.

Installing our tooling in the root of your project does not mean that only one version is installed. One or more of your dependencies may have its own dependency on our tooling, meaning `npm`/`yarn` will additionally install that version for use by that package. For example, `react-scripts` (part of `create-react-app`) has a dependency on our tooling.

You can check what versions are installed in your project using the following commands:

```bash
$ npm list @typescript-eslint/eslint-plugin @typescript-eslint/parser
$ yarn list @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

If you see more than one version installed, then you will have to either use [yarn resolutions](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/) to force a single version, or you will have to downgrade your root versions to match the dependency versions.

**The best course of action in this case is to wait until your dependency releases a new version with support for our latest versions.**

<br />
<br />
<br />

---

<br />
<br />
<br />

## My linting feels really slow

As mentioned in the [type-aware linting doc](./TYPED_LINTING.md), if you're using type-aware linting, your lint times should be roughly the same as your build times.

If you're experiencing times much slower than that, then there are a few common culprits.

### Wide includes in your `tsconfig`

When using type-aware linting, you provide us with one or more tsconfigs. We then will pre-parse all files so that full and complete type information is available.

If you provide very wide globs in your `include` (like `**/*`), it can cause many more files than you expect to be included in this pre-parse. Additionally, if you provide no `include` in your tsconfig, then it is the same as providing the widest glob.

Wide globs can cause TypeScript to parse things like build artifacts, which can heavily impact performance. Always ensure you provide globs targeted at the folders you are specifically wanting to lint.

### `eslint-plugin-prettier`

This plugin surfaces prettier formatting problems at lint time, helping to ensure your code is always formatted. However this comes at a quite a large cost - in order to figure out if there is a difference, it has to do a prettier format on every file being linted. This means that each file will be parsed twice - once by ESLint, and once by Prettier. This can add up for large codebases.

Instead of using this plugin, we recommend using prettier's `--list-different` flag to detect if a file has not been correctly formatted. For example, our CI is setup to run the following command automatically, which blocks diffs that have not been formatted:

```bash
$ yarn prettier --list-different \"./**/*.{ts,js,json,md}\"
```

### `eslint-plugin-import`

This is another great plugin that we use ourselves in this project. However there are a few rules which can cause your lints to be really slow, because they cause the plugin to do its own parsing, and file tracking. This double parsing adds up for large codebases.

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

### The `indent` / `@typescript-eslint/indent` rules

This rule helps ensure your codebase follows a consistent indentation pattern. However this involves a _lot_ of computations across every single token in a file. Across a large codebase, these can add up, and severely impact performance.

We recommend not using this rule, and instead using a tool like [`prettier`](https://www.npmjs.com/package/prettier) to enforce a standardized formatting.

<br />
<br />
<br />
