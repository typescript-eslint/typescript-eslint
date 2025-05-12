import {
  ParserServicesNodeMaps,
  TSESTree,
} from '@typescript-eslint/typescript-estree';
import ts from 'typescript';

// NOTE: These types are intentionally in types-eslint, not parser-services,
// so that packages such as rule-creator can refer to them without taking a full
// dependency on all the runtime logic & dependencies of parser-services.

export interface ParserServicesBase {
  emitDecoratorMetadata: boolean | undefined;
  experimentalDecorators: boolean | undefined;
  isolatedDeclarations: boolean | undefined;
}

export interface ParserServicesWithTypeInformation
  extends ParserServicesNodeMaps,
    ParserServicesBase {
  getSymbolAtLocation: (node: TSESTree.Node) => ts.Symbol | undefined;
  getTypeAtLocation: (node: TSESTree.Node) => ts.Type;
  program: ts.Program;
}

export interface ParserServicesWithoutTypeInformation
  extends ParserServicesNodeMaps,
    ParserServicesBase {
  program: null;
}

export type ParserServices =
  | ParserServicesWithoutTypeInformation
  | ParserServicesWithTypeInformation;
