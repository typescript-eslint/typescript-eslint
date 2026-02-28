import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { ScopeType } from '../../src/index.js';
import { parseAndAnalyze } from '../test-utils/index.js';

describe('"use strict" directives', () => {
  describe('top level', () => {
    it('"use strict" at top level makes the global scope strict', () => {
      const { scopeManager } = parseAndAnalyze('"use strict";', 'script');

      expect(scopeManager.scopes).toHaveLength(1);

      const globalScope = scopeManager.scopes[0];
      assert.isScopeOfType(globalScope, ScopeType.global);
      expect(globalScope.isStrict).toBe(true);

      const statement = globalScope.block.body[0];
      assert.isNodeOfType(statement, AST_NODE_TYPES.ExpressionStatement);
      expect(statement.directive).toBe('use strict');
    });

    it('"use strict" at top level makes child scopes strict', () => {
      const { scopeManager } = parseAndAnalyze(
        `
          "use strict";
          {
            let x;
          }
          function f() {}
        `,
        'script',
      );

      expect(scopeManager.scopes).toHaveLength(3);

      const globalScope = scopeManager.scopes[0];
      assert.isScopeOfType(globalScope, ScopeType.global);
      expect(globalScope.isStrict).toBe(true);

      const blockScope = scopeManager.scopes[1];
      assert.isScopeOfType(blockScope, ScopeType.block);
      expect(blockScope.isStrict).toBe(true);

      const functionScope = scopeManager.scopes[2];
      assert.isScopeOfType(functionScope, ScopeType.function);
      assert.isNodeOfType(
        functionScope.block,
        AST_NODE_TYPES.FunctionDeclaration,
      );
      expect(functionScope.isStrict).toBe(true);
    });

    it('`ExpressionStatement`s without `directive` property are not directives', () => {
      const { scopeManager } = parseAndAnalyze('("use strict");', 'script');

      expect(scopeManager.scopes).toHaveLength(1);

      const globalScope = scopeManager.scopes[0];
      assert.isScopeOfType(globalScope, ScopeType.global);
      expect(globalScope.isStrict).toBe(false);

      const statement = globalScope.block.body[0];
      assert.isNodeOfType(statement, AST_NODE_TYPES.ExpressionStatement);
      expect(statement.directive).toBeUndefined();
    });

    it('other directives at top level do not make the global scope strict', () => {
      const { scopeManager } = parseAndAnalyze('"use server";', 'script');

      expect(scopeManager.scopes).toHaveLength(1);

      const globalScope = scopeManager.scopes[0];
      assert.isScopeOfType(globalScope, ScopeType.global);
      expect(globalScope.isStrict).toBe(false);
    });
  });

  describe('function', () => {
    it('"use strict" in a function makes that function scope strict', () => {
      const { scopeManager } = parseAndAnalyze(
        'function f() { "use strict"; }',
        'script',
      );

      expect(scopeManager.scopes).toHaveLength(2);

      const globalScope = scopeManager.scopes[0];
      assert.isScopeOfType(globalScope, ScopeType.global);
      expect(globalScope.isStrict).toBe(false);

      const functionScope = scopeManager.scopes[1];
      assert.isScopeOfType(functionScope, ScopeType.function);
      assert.isNodeOfType(
        functionScope.block,
        AST_NODE_TYPES.FunctionDeclaration,
      );
      expect(functionScope.isStrict).toBe(true);

      const statement = functionScope.block.body.body[0];
      assert.isNodeOfType(statement, AST_NODE_TYPES.ExpressionStatement);
      expect(statement.directive).toBe('use strict');
    });

    it('"use strict" in a function makes child scopes strict', () => {
      const { scopeManager } = parseAndAnalyze(
        `
        function f() {
          "use strict";
          {
            let x;
          }
          function g() {}
        }
      `,
        'script',
      );

      expect(scopeManager.scopes).toHaveLength(4);

      const globalScope = scopeManager.scopes[0];
      assert.isScopeOfType(globalScope, ScopeType.global);
      expect(globalScope.isStrict).toBe(false);

      const outerFunctionScope = scopeManager.scopes[1];
      assert.isScopeOfType(outerFunctionScope, ScopeType.function);
      assert.isNodeOfType(
        outerFunctionScope.block,
        AST_NODE_TYPES.FunctionDeclaration,
      );
      expect(outerFunctionScope.isStrict).toBe(true);

      const blockScope = scopeManager.scopes[2];
      assert.isScopeOfType(blockScope, ScopeType.block);
      expect(blockScope.isStrict).toBe(true);

      const innerFunctionScope = scopeManager.scopes[3];
      assert.isScopeOfType(innerFunctionScope, ScopeType.function);
      assert.isNodeOfType(
        innerFunctionScope.block,
        AST_NODE_TYPES.FunctionDeclaration,
      );
      expect(innerFunctionScope.isStrict).toBe(true);
    });

    it('`ExpressionStatement`s without `directive` property are not directives', () => {
      const { scopeManager } = parseAndAnalyze(
        'function f() { ("use strict"); }',
        'script',
      );

      expect(scopeManager.scopes).toHaveLength(2);

      const globalScope = scopeManager.scopes[0];
      assert.isScopeOfType(globalScope, ScopeType.global);
      expect(globalScope.isStrict).toBe(false);

      const functionScope = scopeManager.scopes[1];
      assert.isScopeOfType(functionScope, ScopeType.function);
      assert.isNodeOfType(
        functionScope.block,
        AST_NODE_TYPES.FunctionDeclaration,
      );
      expect(functionScope.isStrict).toBe(false);

      const statement = functionScope.block.body.body[0];
      assert.isNodeOfType(statement, AST_NODE_TYPES.ExpressionStatement);
      expect(statement.directive).toBeUndefined();
    });

    it('other directives do not make the function scope strict', () => {
      const { scopeManager } = parseAndAnalyze(
        'function f() { "use server"; }',
        'script',
      );

      expect(scopeManager.scopes).toHaveLength(2);

      const globalScope = scopeManager.scopes[0];
      assert.isScopeOfType(globalScope, ScopeType.global);
      expect(globalScope.isStrict).toBe(false);

      const functionScope = scopeManager.scopes[1];
      assert.isScopeOfType(functionScope, ScopeType.function);
      assert.isNodeOfType(
        functionScope.block,
        AST_NODE_TYPES.FunctionDeclaration,
      );
      expect(functionScope.isStrict).toBe(false);
    });
  });
});
