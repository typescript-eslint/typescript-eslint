import type { TSESTree } from '@typescript-eslint/types';
import type { ParserServicesWithTypeInformation } from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import { getDeclaration } from '../src';

const node = {} as TSESTree.Node;

describe('getDeclaration', () => {
  describe('when symbol does not exist', () => {
    it('returns null', () => {
      const services = {
        getSymbolAtLocation: () => undefined,
      } as unknown as ParserServicesWithTypeInformation;

      expect(getDeclaration(services, node)).toBeNull();
    });
  });

  describe('when declarations do not exist', () => {
    it('returns null', () => {
      const symbol = {
        getDeclarations: () => undefined,
      } as unknown as ts.Symbol;
      const services = {
        getSymbolAtLocation: () => symbol,
      } as unknown as ParserServicesWithTypeInformation;

      expect(getDeclaration(services, node)).toBeNull();
    });
  });

  describe('when declarations exist', () => {
    it('returns the first declaration', () => {
      const declaration1 = {} as ts.Declaration;
      const declaration2 = {} as ts.Declaration;
      const symbol = {
        getDeclarations: () => [declaration1, declaration2],
      } as unknown as ts.Symbol;
      const services = {
        getSymbolAtLocation: () => symbol,
      } as unknown as ParserServicesWithTypeInformation;

      expect(getDeclaration(services, node)).toBe(declaration1);
    });
  });
});
