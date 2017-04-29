# TypeScript ESLint Parser (Experimental)

A parser that converts TypeScript into an [ESTree](https://github.com/estree/estree)-compatible form so it can be used in ESLint. The goal is to allow TypeScript files to be parsed by ESLint (though not necessarily pass all ESLint rules).

**Important:** This parser is still in the very early stages and is considered experimental. There are likely a lot of bugs. You should not rely on this in a production environment yet.

## Supported TypeScript Version

We will always endeavor to support the latest stable version of TypeScript.

The version of TypeScript currently supported by this parser is `~2.3.2`. This is reflected in the `devDependency` requirement within the package.json file, and it is what the tests will be run against. We have an open `peerDependency` requirement in order to allow for experimentation on newer/beta versions of TypeScript.

If you use a non-supported version of TypeScript, the parser will log a warning to the console.

**Please ensure that you are using a supported version before submitting any issues/bug reports.**

## Usage

Install:

```
npm i typescript-eslint-parser --save-dev
```

And in your ESLint configuration file:

```
"parser": "typescript-eslint-parser"
```

## Help Wanted!

If you're familiar with TypeScript and ESLint, and you'd like to see this project progress, please consider contributing. We need people with a good knowledge of TypeScript to ensure this parser is useful.

## Reporting Bugs

**Do not** file bugs about ESLint rule failures. This is expected because ESLint doesn't know anything about TypeScript syntax. It's likely that many ESLint rules will have failures as a result. Longer-term, it's likely we'll need to create a custom set of ESLint rules that are TypeScript-specific.

Bugs should be filed for:

1. TypeScript syntax that fails to parse.
1. TypeScript syntax that produces an unexpected AST.

## Contributing

Issues and pull requests will be triaged and responded to as quickly as possible. We operate under the [ESLint Contributor Guidelines](http://eslint.org/docs/developer-guide/contributing), so please be sure to read them before contributing. If you're not sure where to dig in, check out the [issues](https://github.com/eslint/typescript-eslint-parser/issues).

## Build Commands

* `npm test` - run all linting and tests
* `npm run lint` - run all linting

## License

TypeScript ESLint Parser is licensed under a permissive BSD 2-clause license.

