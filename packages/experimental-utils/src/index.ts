import * as ESLintUtils from './eslint-utils';
import * as TSESLint from './ts-eslint';
import * as TSESLintScope from './ts-eslint-scope';
import * as JSONSchema from './json-schema';

export { ESLintUtils, JSONSchema, TSESLint, TSESLintScope };

// for convenience's sake - export the types directly from here so consumers
// don't need to reference/install both packages in their code

// NOTE - this uses hard links inside ts-estree to avoid initialization of entire package
//        via its main file (which imports typescript at runtime).
//        Not every eslint-plugin written in typescript requires typescript at runtime.
export {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/typescript-estree/dist/ts-estree';
export { ParserServices } from '@typescript-eslint/typescript-estree/dist/parser-options';
