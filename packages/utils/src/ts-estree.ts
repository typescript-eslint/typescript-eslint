// for convenience's sake - export the types directly from here so consumers
// don't need to reference/install both packages in their code

export {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/types';

export type {
  ParserServices,
  ParserServicesWithTypeInformation,
  ParserServicesWithoutTypeInformation,
} from '@typescript-eslint/typescript-estree';
