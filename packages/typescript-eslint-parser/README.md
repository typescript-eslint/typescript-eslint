# TypeScript ESLint Parser

A parser that converts TypeScript source code into an [ESTree](https://github.com/estree/estree)-compatible form.

## Usage

This parser is actually somewhat generic and robust - it could be used to power any use-case which requires taking TypeScript source code and producing an ESTree-compatiable AST.

In fact, that is exactly what it is used for in the popular open-source code formatter, [Prettier](https://prettier.io), to power its TypeScript support.

Nevertheless, the parser does have a special appreciation for ESLint-specific use-cases built in, and can even produce a slightly different AST for ESLint if needed (using the special `parseForESLint()` method).

The majority of users of this parser use it to enable them to use ESLint on their TypeScript source files, so they will not actually be interacting with the parser directly. Instead they will configure ESLint to use it instead of its default parser, [espree](https://github.com/eslint/espree), which does not understand TypeScript.

## Usage with ESLint

There is sometimes an incorrect assumption that the parser itself is what does everything necessary to facilitate the use of ESLint with TypeScript. In actuality, it is the combination of the parser _and_ one or more plugins which allow you to maximize your usage of ESLint with TypeScript.

For example, once this parser successfully produces an AST for the TypeScript source code, it might well contain some information which simply does not exist in a standard JavaScript context, such as the data for a TypeScript-specific construct, like an `interface`.

The core rules built into ESLint, such as `indent` have no knowledge of such constructs, so it is impossible to expect them to work out of the box with them.

Instead, you also need to make use of one more plugins which will add or extend rules with TypeScript-specific features.

By far the most common case will be installing the [eslint-plugin-typescript](https://github.com/nzakas/eslint-plugin-typescript) plugin, but there are also other relevant options available such a [eslint-plugin-tslint](https://github.com/JamesHenry/eslint-plugin-tslint).

Install:

```sh
npm install --save-dev typescript-eslint-parser
```

And in your ESLint configuration file:

```json
"parser": "typescript-eslint-parser"
```

## Supported TypeScript Version

We will always endeavor to support the latest stable version of TypeScript.

The version of TypeScript currently supported by this parser is `~3.0.1`. This is reflected in the `devDependency` requirement within the package.json file, and it is what the tests will be run against. We have an open `peerDependency` requirement in order to allow for experimentation on newer/beta versions of TypeScript.

If you use a non-supported version of TypeScript, the parser will log a warning to the console.

**Please ensure that you are using a supported version before submitting any issues/bug reports.**

## Help Wanted!

If you're familiar with TypeScript and ESLint, and you'd like to see this project progress, please consider contributing. We need people with a good knowledge of TypeScript to ensure this parser is useful.

## Reporting Issues

The vast majority of issues which are submitted here are not actually parsing bugs at all. They are integration issues with the ESLint ecosystem.

This is not ideal, but users need a place to be able to report those things, so it has become accepted that that will also be done in this repo.

Please check the current list of open and known issues and ensure the issue has not been reported before. When creating a new issue provide as much information about your environment as possible. This includes:

- ESLint Version
- TypeScript version
- The `typescript-eslint-parser` version
- ESLint config or rules and plugins currently enabled

## Integration Tests

We have a very flexible way of running integration tests which connects all of the moving parts of the usage of this parser in the ESLint ecosystem.

We run each test within its own docker container, and so each one has complete autonomy over what dependencies/plugins are installed and what versions are used. This also has the benefit of not bloating the `package.json` and `node_modules` of the parser project itself.

> If you are going to submit an issue related to the usage of this parser with ESLint, please consider creating a failing integration which clearly demonstrates the behavior. It's honestly super quick!

You just need to duplicate on of the existing test sub-directories found in `tests/integration/`, tweak the dependencies and ESLint config to match what you need, and add a new entry to the docker-compose.yml file which matches the format of the existing ones.

Then run:

```sh
npm run integration-tests
```

If you ever need to change what gets installed when the docker images are built by docker-compose, you will first need to kill the existing containers by running:

```sh
npm run kill-integration-test-containers
```

## Contributing

Issues and pull requests will be triaged and responded to as quickly as possible. We operate under the [ESLint Contributor Guidelines](http://eslint.org/docs/developer-guide/contributing), so please be sure to read them before contributing. If you're not sure where to dig in, check out the [issues](https://github.com/eslint/typescript-eslint-parser/issues).

## Build Commands

- `npm test` - run all linting and tests
- `npm run lint` - run all linting
- `npm run ast-alignment-tests` - run only Babylon AST alignment tests
- `npm run integration-tests` - run only integration tests

## License

TypeScript ESLint Parser is licensed under a permissive BSD 2-clause license.
