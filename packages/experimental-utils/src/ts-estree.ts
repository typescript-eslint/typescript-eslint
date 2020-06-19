// for convenience's sake - export the types directly from here so consumers
// don't need to reference/install both packages in their code

export {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/types';

// NOTE - this uses hard links inside ts-estree to avoid initialization of entire package
//        via its main file (which imports typescript at runtime).
//        Not every eslint-plugin written in typescript requires typescript at runtime.
export { ParserServices } from '@typescript-eslint/typescript-estree/dist/parser-options';
