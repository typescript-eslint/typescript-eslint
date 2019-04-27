# @typescript-eslint/util

Utilities for working with TypeScript + ESLint together

Exports:

| Name                        | Description                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| [`TSESTree`]                | Types for the TypeScript flavour of ESTree created by `@typescript-eslint/typescript-estree`.  |
| [`AST_NODE_TYPES`]          | An enum with the names of every single _node_ found in `TSESTree`.                             |
| [`AST_TOKEN_TYPES`]         | An enum with the names of every single _token_ found in `TSESTree`.                            |
| [`TSESLint`]                | Types for ESLint, correctly typed to work with the types found in `TSESTree`.                  |
| [`ESLintUtils`]             | Tools for creating eslint rules with TypeScript.                                               |
| [`ESLintUtils.RuleCreator`] | A function for creating strictly typed eslint rules with TypeScript.                           |
| [`ParserServices`]          | The parser services provided when parsing a file using `@typescript-eslint/typescript-estree`. |

## ESLintUtils

[`AST_NODE_TYPES`](../packages/typescript-estree/src/ts-estree/ast-node-types.ts)
[`AST_TOKEN_TYPES`](../packages/typescript-estree/src/ts-estree/ast-node-types.ts)
[`ESLintUtils`](./src/eslint-utils)
[`ESLintUtils.createRule`](./src/eslint-utils/createRule.ts)
[`ParserServices`](../packages/typescript-estree/src/ts-estree/parser.ts)
[`TSESTree`](../packages/typescript-estree/src/ts-estree/ts-estree.ts)
[`TSESLint`](./src/ts-eslint)
