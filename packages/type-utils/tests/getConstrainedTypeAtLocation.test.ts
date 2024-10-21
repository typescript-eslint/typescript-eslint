import type { TSESTree } from '@typescript-eslint/types';
import type { ParserServicesWithTypeInformation } from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import { getConstrainedTypeAtLocation } from '../src';

const node = {} as TSESTree.Node;

const mockType = (): ts.Type => {
  return {} as ts.Type;
};

const mockServices = ({
  baseConstraintOfType,
  typeAtLocation,
}: {
  baseConstraintOfType?: ts.Type;
  typeAtLocation: ts.Type;
}): ParserServicesWithTypeInformation => {
  const typeChecker = {
    getBaseConstraintOfType: (_: ts.Type) => baseConstraintOfType,
  } as ts.TypeChecker;
  const program = {
    getTypeChecker: () => typeChecker,
  } as ts.Program;

  return {
    getTypeAtLocation: (_: TSESTree.Node) => typeAtLocation,
    program,
  } as ParserServicesWithTypeInformation;
};

describe('getConstrainedTypeAtLocation', () => {
  describe('when the node has a generic constraint', () => {
    it('returns the generic constraint type', () => {
      const typeAtLocation = mockType();
      const baseConstraintOfType = mockType();
      const services = mockServices({
        baseConstraintOfType,
        typeAtLocation,
      });

      expect(getConstrainedTypeAtLocation(services, node)).toBe(
        baseConstraintOfType,
      );
    });
  });

  describe('when the node does not have a generic constraint', () => {
    it('returns the node type', () => {
      const typeAtLocation = mockType();
      const services = mockServices({ typeAtLocation });

      expect(getConstrainedTypeAtLocation(services, node)).toBe(typeAtLocation);
    });
  });
});
