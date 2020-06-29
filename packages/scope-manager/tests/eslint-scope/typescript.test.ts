import { AST_NODE_TYPES } from '@typescript-eslint/types';
import {
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  parseAndAnalyze,
} from '../util';

describe('typescript', () => {
  describe('multiple call signatures', () => {
    it('should create a function scope', () => {
      const { scopeManager } = parseAndAnalyze(
        `
          function foo(bar: number): number;
          function foo(bar: string): string;
          function foo(bar: string | number): string | number {
            return bar;
          }
        `,
        'script',
      );

      expect(scopeManager.scopes).toHaveLength(4);

      let scope = scopeManager.scopes[0];
      expectToBeGlobalScope(scope);
      expect(scope.references).toHaveLength(0);
      expect(scope.variables).toHaveLength(1);
      expect(scope.variables[0].defs).toHaveLength(3);

      for (let i = 1; i < 4; i += 1) {
        scope = scopeManager.scopes[i];
        expectToBeFunctionScope(scope);
        expect(scope.variables).toHaveLength(2);
        expect(scope.variables[0].name).toBe('arguments');
        if (scope.block.type === AST_NODE_TYPES.TSDeclareFunction) {
          expect(scope.references).toHaveLength(0);
        } else {
          expect(scope.references).toHaveLength(1);
        }
      }
    });
  });
});
