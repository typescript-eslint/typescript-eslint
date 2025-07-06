import type { TSESTree } from '@typescript-eslint/types';
import type { ParserServicesWithTypeInformation } from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import { getDeclaration } from '../src/index.js';

const node = {} as TSESTree.Node;

const mockSymbol = (declarations?: ts.Declaration[]): ts.Symbol => {
  return {
    getDeclarations: () => declarations,
  } as ts.Symbol;
};

const mockServices = (
  symbol?: ts.Symbol,
): ParserServicesWithTypeInformation => {
  return {
    getSymbolAtLocation: (_: TSESTree.Node) => symbol,
  } as ParserServicesWithTypeInformation;
};

const mockDeclaration = (): ts.Declaration => {
  return {} as ts.Declaration;
};

describe(getDeclaration, () => {
  describe('when symbol does not exist', () => {
    it('returns null', () => {
      const services = mockServices();

      assert.isNull(getDeclaration(services, node));
    });
  });

  describe('when declarations do not exist', () => {
    it('returns null', () => {
      const symbol = mockSymbol();
      const services = mockServices(symbol);

      assert.isNull(getDeclaration(services, node));
    });
  });

  describe('when declarations exist', () => {
    it('returns the first declaration', () => {
      const declaration1 = mockDeclaration();
      const declaration2 = mockDeclaration();
      const symbol = mockSymbol([declaration1, declaration2]);
      const services = mockServices(symbol);

      expect(getDeclaration(services, node)).toBe(declaration1);
    });
  });
});
