# `website-eslint`

A bundled version of ESLint plus `typescript-eslint`, made to work in a browser.
This is exclusively used for the playground in the [`website` package](../website/README.md).

## Building

`yarn build` runs `build.ts`, which uses ESBuild to create a CommonJS bundle including:

- ESLint's [`Linter` class](https://eslint.org/docs/latest/integrate/nodejs-api#linter) and built-in rules
- TypeScript's `typescript` and `typescript/lib/tsserverlibrary` module entry points
- typescript-eslint packages, including:
  - `@typescript-eslint/eslint-plugin` and all its configs and rules
  - `@typescript-eslint/parser` and `@typescript-eslint/typescript-estree`

The build files intentionally use deep `/use-at-your-own-risk` imports into our packages.
This is so that esbuild can properly tree-shake and only include the necessary code.
This saves us having to mock unnecessary things and reduces our website bundle size.
