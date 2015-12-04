# TypeScript ESLint Parser (Experimental)

An parser that converts TypeScript into an [ESTree](https://github.com/estree/estree)-compatible form so it can be used in ESLint.

**Important:** This parser is still in the very early stages and is considered experimental. There are likely a lot of bugs. You should not rely on this in a production environment yet.

## Usage

Install:

```
npm i typescript-eslint-parser --save
```

And in your ESLint configuration file:

```
"parser": "typescript-eslint-parser"
```

## Help Wanted!

If you're familiar with TypeScript and ESLint, and you'd like to see this project progress, please consider contributing. We need people with a good knowledge of TypeScript to ensure this parser is useful.

## Contributing

Issues and pull requests will be triaged and responded to as quickly as possible. We operate under the [ESLint Contributor Guidelines](http://eslint.org/docs/developer-guide/contributing), so please be sure to read them before contributing. If you're not sure where to dig in, check out the [issues](https://github.com/eslint/typescript-eslint-parser/issues).

TypeScript ESLint Parser is licensed under a permissive BSD 2-clause license.

## Build Commands

* `npm test` - run all linting and tests
* `npm run lint` - run all linting

## Development Plan

* **Phase 1:** Full ES6 support, stripping out all TypeScript-specific syntax.
* **Phase 2:** Add JSX support.
* **Phase 3:** Add support for top-level TypeScript syntax.
* **Phase 4:** Add support for types.
