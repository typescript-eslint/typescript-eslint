import type { TSESTree } from '@typescript-eslint/types';
import type { ParserServicesWithTypeInformation } from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import { getConstrainedTypeAtLocation } from '../src';

const node = {} as TSESTree.Node;

describe('getConstrainedTypeAtLocation', () => {
  describe('when the node has a generic constraint', () => {
    it('returns the generic constraint type', () => {
      const typeAtLocation = {} as ts.Type;
      const constraintOfType = {} as ts.Type;
      const typeChecker = {
        getBaseConstraintOfType: (_: ts.Type) => constraintOfType,
      } as ts.TypeChecker;
      const program = {
        getTypeChecker: () => typeChecker,
      } as ts.Program;
      const services = {
        program,
        getTypeAtLocation: (_: TSESTree.Node) => typeAtLocation,
      } as ParserServicesWithTypeInformation;

      expect(getConstrainedTypeAtLocation(services, node)).toBe(
        constraintOfType,
      );
    });
  });

  describe('when the node does not have a generic constraint', () => {
    it('returns the node type', () => {
      const typeAtLocation = {} as ts.Type;
      const typeChecker = {
        getBaseConstraintOfType: (_: ts.Type) => undefined,
      } as ts.TypeChecker;
      const program = {
        getTypeChecker: () => typeChecker,
      } as ts.Program;
      const services = {
        program,
        getTypeAtLocation: (_: TSESTree.Node) => typeAtLocation,
      } as ParserServicesWithTypeInformation;

      expect(getConstrainedTypeAtLocation(services, node)).toBe(typeAtLocation);
    });
  });
});
