import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

describe('ES6 default parameters:', () => {
  describe('a default parameter creates a writable reference for its initialization:', () => {
    const patterns = [
      [AST_NODE_TYPES.ArrowFunctionExpression, 'let foo = (a, b = 0) => {};'],
      [AST_NODE_TYPES.FunctionDeclaration, 'function foo(a, b = 0) {}'],
      [AST_NODE_TYPES.FunctionExpression, 'let foo = function(a, b = 0) {};'],
    ] as const;

    it.for(patterns)('%s', ([name, code], { expect }) => {
      const numVars = name === AST_NODE_TYPES.ArrowFunctionExpression ? 2 : 3;
      const { scopeManager } = parseAndAnalyze(code);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(numVars); // [arguments?, a, b]
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('b');
      expect(reference.resolved).toBe(variables[numVars - 1]);
      expect(reference.writeExpr).toBeDefined();
      expect(reference.isWrite()).toBe(true);
      expect(reference.isRead()).toBe(false);
    });
  });

  describe('a default parameter creates a readable reference for references in right:', () => {
    const patterns = [
      [
        AST_NODE_TYPES.ArrowFunctionExpression,
        `
        let a;
        let foo = (b = a) => {};
      `,
      ],
      [
        AST_NODE_TYPES.FunctionDeclaration,
        `
        let a;
        function foo(b = a) {}
      `,
      ],
      [
        AST_NODE_TYPES.FunctionExpression,
        `
        let a;
        let foo = function(b = a) {}
      `,
      ],
    ] as const;

    it.for(patterns)('%s', ([name, code], { expect }) => {
      const numVars = name === AST_NODE_TYPES.ArrowFunctionExpression ? 1 : 2;
      const { scopeManager } = parseAndAnalyze(code);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(numVars); // [arguments?, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe('a default parameter creates a readable reference for references in right (for const):', () => {
    const patterns = [
      [
        AST_NODE_TYPES.ArrowFunctionExpression,
        `
        const a = 0;
        let foo = (b = a) => {};
      `,
      ],
      [
        AST_NODE_TYPES.FunctionDeclaration,
        `
        const a = 0;
        function foo(b = a) {}
      `,
      ],
      [
        AST_NODE_TYPES.FunctionExpression,
        `
        const a = 0;
        let foo = function(b = a) {}
      `,
      ],
    ] as const;

    it.for(patterns)('%s', ([name, code], { expect }) => {
      const numVars = name === AST_NODE_TYPES.ArrowFunctionExpression ? 1 : 2;
      const { scopeManager } = parseAndAnalyze(code);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(numVars); // [arguments?, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe('a default parameter creates a readable reference for references in right (partial):', () => {
    const patterns = [
      [
        AST_NODE_TYPES.ArrowFunctionExpression,
        `
        let a;
        let foo = (b = a.c) => {};
      `,
      ],
      [
        AST_NODE_TYPES.FunctionDeclaration,
        `
        let a;
        function foo(b = a.c) {}
      `,
      ],
      [
        AST_NODE_TYPES.FunctionExpression,
        `
        let a;
        let foo = function(b = a.c) {}
      `,
      ],
    ] as const;

    it.for(patterns)('%s', ([name, code], { expect }) => {
      const numVars = name === AST_NODE_TYPES.ArrowFunctionExpression ? 1 : 2;
      const { scopeManager } = parseAndAnalyze(code);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(numVars); // [arguments?, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe("a default parameter creates a readable reference for references in right's nested scope:", () => {
    const patterns = [
      [
        AST_NODE_TYPES.ArrowFunctionExpression,
        `
        let a;
        let foo = (b = function() { return a; }) => {};
      `,
      ],
      [
        AST_NODE_TYPES.FunctionDeclaration,
        `
        let a;
        function foo(b = function() { return a; }) {}
      `,
      ],
      [
        AST_NODE_TYPES.FunctionExpression,
        `
        let a;
        let foo = function(b = function() { return a; }) {}
      `,
      ],
    ] as const;

    it.for(patterns)('%s', ([, code], { expect }) => {
      const { scopeManager } = parseAndAnalyze(code);

      expect(scopeManager.scopes).toHaveLength(3); // [global, foo, anonymous]

      const scope = scopeManager.scopes[2];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1); // [arguments]
      expect(scope.references).toHaveLength(1); // [a]

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe("a default parameter creates a readable reference for references in right. It's resolved to outer scope's even if there is the variable in the function body:", () => {
    const patterns = [
      [
        AST_NODE_TYPES.ArrowFunctionExpression,
        `
        let a;
        let foo = (b = a) => { let a; };
      `,
      ],
      [
        AST_NODE_TYPES.FunctionDeclaration,
        `
        let a;
        function foo(b = a) { let a; }
      `,
      ],
      [
        AST_NODE_TYPES.FunctionExpression,
        `
        let a;
        let foo = function(b = a) { let a; }
      `,
      ],
    ] as const;

    it.for(patterns)('%s', ([name, code], { expect }) => {
      const numVars = name === AST_NODE_TYPES.ArrowFunctionExpression ? 2 : 3;
      const { scopeManager } = parseAndAnalyze(code);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(numVars); // [arguments?, b, a]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe("a default parameter creates a readable reference for references in right. It's resolved to the parameter:", () => {
    const patterns = [
      [
        AST_NODE_TYPES.ArrowFunctionExpression,
        `
        let a;
        let foo = (b = a, a) => { };
      `,
      ],
      [
        AST_NODE_TYPES.FunctionDeclaration,
        `
        let a;
        function foo(b = a, a) { }
      `,
      ],
      [
        AST_NODE_TYPES.FunctionExpression,
        `
        let a;
        let foo = function(b = a, a) { }
      `,
      ],
    ] as const;

    it.for(patterns)('%s', ([name, code], { expect }) => {
      const numVars = name === AST_NODE_TYPES.ArrowFunctionExpression ? 2 : 3;
      const { scopeManager } = parseAndAnalyze(code);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(numVars); // [arguments?, b, a]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[variables.length - 1]);
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe("a default parameter creates a readable reference for references in right (nested scope). It's resolved to outer scope's even if there is the variable in the function body:", () => {
    const patterns = [
      [
        AST_NODE_TYPES.ArrowFunctionExpression,
        `
        let a;
        let foo = (b = function(){ a }) => { let a; };
      `,
      ],
      [
        AST_NODE_TYPES.FunctionDeclaration,
        `
        let a;
        function foo(b = function(){ a }) { let a; }
      `,
      ],
      [
        AST_NODE_TYPES.FunctionExpression,
        `
        let a;
        let foo = function(b = function(){ a }) { let a; }
      `,
      ],
    ] as const;

    it.for(patterns)('%s', ([, code], { expect }) => {
      const { scopeManager } = parseAndAnalyze(code);

      expect(scopeManager.scopes).toHaveLength(3); // [global, foo, anonymous function]

      const scope = scopeManager.scopes[2];

      expect(scope.references).toHaveLength(1); // [a]

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });
});
