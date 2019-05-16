import * as ESLintUtils from './eslint-utils';
import * as TSESLint from './ts-eslint';
import * as TSESLintScope from './ts-eslint-scope';

export { ESLintUtils, TSESLint, TSESLintScope };

// for convenience's sake - export the types directly from here so consumers
// don't need to reference/install both packages in their code
export {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  ParserServices,
  TSESTree,
} from '@typescript-eslint/typescript-estree';
