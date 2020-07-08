import { parseAndAnalyze } from '../util';

function forEach<T extends string>(
  obj: Record<T, string>,
  cb: (name: T) => void,
): void {
  Object.keys(obj).forEach(name => {
    cb(name as T);
  });
}

describe('ES6 default parameters:', () => {
  describe('a default parameter creates a writable reference for its initialization:', () => {
    const patterns = {
      FunctionDeclaration: 'function foo(a, b = 0) {}',
      FunctionExpression: 'let foo = function(a, b = 0) {};',
      ArrowExpression: 'let foo = (a, b = 0) => {};',
    };

    forEach(patterns, name => {
      const code = patterns[name];

      it(name, () => {
        const numVars = name === 'ArrowExpression' ? 2 : 3;
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

        const scope = scopeManager.scopes[1];

        expect(scope.variables).toHaveLength(numVars); // [arguments?, a, b]
        expect(scope.references).toHaveLength(1);

        const reference = scope.references[0];

        expect(reference.from).toBe(scope);
        expect(reference.identifier.name).toBe('b');
        expect(reference.resolved).toBe(scope.variables[numVars - 1]);
        expect(reference.writeExpr).not.toBeUndefined();
        expect(reference.isWrite()).toBeTruthy();
        expect(reference.isRead()).toBeFalsy();
      });
    });
  });

  describe('a default parameter creates a readable reference for references in right:', () => {
    const patterns = {
      FunctionDeclaration: `
        let a;
        function foo(b = a) {}
      `,
      FunctionExpression: `
        let a;
        let foo = function(b = a) {}
      `,
      ArrowExpression: `
        let a;
        let foo = (b = a) => {};
      `,
    };

    forEach(patterns, name => {
      const code = patterns[name];

      it(name, () => {
        const numVars = name === 'ArrowExpression' ? 1 : 2;
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

        const scope = scopeManager.scopes[1];

        expect(scope.variables).toHaveLength(numVars); // [arguments?, b]
        expect(scope.references).toHaveLength(2); // [b, a]

        const reference = scope.references[1];

        expect(reference.from).toBe(scope);
        expect(reference.identifier.name).toBe('a');
        expect(reference.resolved).toBe(scopeManager.scopes[0].variables[0]);
        expect(reference.writeExpr).toBeUndefined();
        expect(reference.isWrite()).toBeFalsy();
        expect(reference.isRead()).toBeTruthy();
      });
    });
  });

  describe('a default parameter creates a readable reference for references in right (for const):', () => {
    const patterns = {
      FunctionDeclaration: `
        const a = 0;
        function foo(b = a) {}
      `,
      FunctionExpression: `
        const a = 0;
        let foo = function(b = a) {}
      `,
      ArrowExpression: `
        const a = 0;
        let foo = (b = a) => {};
      `,
    };

    forEach(patterns, name => {
      const code = patterns[name];

      it(name, () => {
        const numVars = name === 'ArrowExpression' ? 1 : 2;
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

        const scope = scopeManager.scopes[1];

        expect(scope.variables).toHaveLength(numVars); // [arguments?, b]
        expect(scope.references).toHaveLength(2); // [b, a]

        const reference = scope.references[1];

        expect(reference.from).toBe(scope);
        expect(reference.identifier.name).toBe('a');
        expect(reference.resolved).toBe(scopeManager.scopes[0].variables[0]);
        expect(reference.writeExpr).toBeUndefined();
        expect(reference.isWrite()).toBeFalsy();
        expect(reference.isRead()).toBeTruthy();
      });
    });
  });

  describe('a default parameter creates a readable reference for references in right (partial):', () => {
    const patterns = {
      FunctionDeclaration: `
        let a;
        function foo(b = a.c) {}
      `,
      FunctionExpression: `
        let a;
        let foo = function(b = a.c) {}
      `,
      ArrowExpression: `
        let a;
        let foo = (b = a.c) => {};
      `,
    };

    forEach(patterns, name => {
      const code = patterns[name];

      it(name, () => {
        const numVars = name === 'ArrowExpression' ? 1 : 2;
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

        const scope = scopeManager.scopes[1];

        expect(scope.variables).toHaveLength(numVars); // [arguments?, b]
        expect(scope.references).toHaveLength(2); // [b, a]

        const reference = scope.references[1];

        expect(reference.from).toBe(scope);
        expect(reference.identifier.name).toBe('a');
        expect(reference.resolved).toBe(scopeManager.scopes[0].variables[0]);
        expect(reference.writeExpr).toBeUndefined();
        expect(reference.isWrite()).toBeFalsy();
        expect(reference.isRead()).toBeTruthy();
      });
    });
  });

  describe("a default parameter creates a readable reference for references in right's nested scope:", () => {
    const patterns = {
      FunctionDeclaration: `
        let a;
        function foo(b = function() { return a; }) {}
      `,
      FunctionExpression: `
        let a;
        let foo = function(b = function() { return a; }) {}
      `,
      ArrowExpression: `
        let a;
        let foo = (b = function() { return a; }) => {};
      `,
    };

    forEach(patterns, name => {
      const code = patterns[name];

      it(name, () => {
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes).toHaveLength(3); // [global, foo, anonymous]

        const scope = scopeManager.scopes[2];

        expect(scope.variables).toHaveLength(1); // [arguments]
        expect(scope.references).toHaveLength(1); // [a]

        const reference = scope.references[0];

        expect(reference.from).toBe(scope);
        expect(reference.identifier.name).toBe('a');
        expect(reference.resolved).toBe(scopeManager.scopes[0].variables[0]);
        expect(reference.writeExpr).toBeUndefined();
        expect(reference.isWrite()).toBeFalsy();
        expect(reference.isRead()).toBeTruthy();
      });
    });
  });

  describe("a default parameter creates a readable reference for references in right. It's resolved to outer scope's even if there is the variable in the function body:", () => {
    const patterns = {
      FunctionDeclaration: `
        let a;
        function foo(b = a) { let a; }
      `,
      FunctionExpression: `
        let a;
        let foo = function(b = a) { let a; }
      `,
      ArrowExpression: `
        let a;
        let foo = (b = a) => { let a; };
      `,
    };

    forEach(patterns, name => {
      const code = patterns[name];

      it(name, () => {
        const numVars = name === 'ArrowExpression' ? 2 : 3;
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

        const scope = scopeManager.scopes[1];

        expect(scope.variables).toHaveLength(numVars); // [arguments?, b, a]
        expect(scope.references).toHaveLength(2); // [b, a]

        const reference = scope.references[1];

        expect(reference.from).toBe(scope);
        expect(reference.identifier.name).toBe('a');
        expect(reference.resolved).toBe(scopeManager.scopes[0].variables[0]);
        expect(reference.writeExpr).toBeUndefined();
        expect(reference.isWrite()).toBeFalsy();
        expect(reference.isRead()).toBeTruthy();
      });
    });
  });

  describe("a default parameter creates a readable reference for references in right. It's resolved to the parameter:", () => {
    const patterns = {
      FunctionDeclaration: `
        let a;
        function foo(b = a, a) { }
      `,
      FunctionExpression: `
        let a;
        let foo = function(b = a, a) { }
      `,
      ArrowExpression: `
        let a;
        let foo = (b = a, a) => { };
      `,
    };

    forEach(patterns, name => {
      const code = patterns[name];

      it(name, () => {
        const numVars = name === 'ArrowExpression' ? 2 : 3;
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

        const scope = scopeManager.scopes[1];

        expect(scope.variables).toHaveLength(numVars); // [arguments?, b, a]
        expect(scope.references).toHaveLength(2); // [b, a]

        const reference = scope.references[1];

        expect(reference.from).toBe(scope);
        expect(reference.identifier.name).toBe('a');
        expect(reference.resolved).toBe(
          scope.variables[scope.variables.length - 1],
        );
        expect(reference.writeExpr).toBeUndefined();
        expect(reference.isWrite()).toBeFalsy();
        expect(reference.isRead()).toBeTruthy();
      });
    });
  });

  describe("a default parameter creates a readable reference for references in right (nested scope). It's resolved to outer scope's even if there is the variable in the function body:", () => {
    const patterns = {
      FunctionDeclaration: `
        let a;
        function foo(b = function(){ a }) { let a; }
      `,
      FunctionExpression: `
        let a;
        let foo = function(b = function(){ a }) { let a; }
      `,
      ArrowExpression: `
        let a;
        let foo = (b = function(){ a }) => { let a; };
      `,
    };

    forEach(patterns, name => {
      const code = patterns[name];

      it(name, () => {
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes).toHaveLength(3); // [global, foo, anonymous function]

        const scope = scopeManager.scopes[2];

        expect(scope.references).toHaveLength(1); // [a]

        const reference = scope.references[0];

        expect(reference.from).toBe(scope);
        expect(reference.identifier.name).toBe('a');
        expect(reference.resolved).toBe(scopeManager.scopes[0].variables[0]);
        expect(reference.writeExpr).toBeUndefined();
        expect(reference.isWrite()).toBeFalsy();
        expect(reference.isRead()).toBeTruthy();
      });
    });
  });
});
