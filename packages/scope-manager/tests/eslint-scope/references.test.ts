import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

describe('References:', () => {
  describe('When there is a `let` declaration on global,', () => {
    it('the reference on global should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('let a = 0;');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[0]);

      assert.exists(reference.writeExpr);

      expect(reference.isWrite()).toBe(true);
      expect(reference.isRead()).toBe(false);
    });

    it('the reference in functions should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        let a = 0;
        function foo() {
          let b = a;
        }
      `);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );

      assert.notExists(reference.writeExpr);

      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });

    it('the reference in default parameters should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        let a = 0;
        function foo(b = a) {
        }
      `);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );

      assert.notExists(reference.writeExpr);

      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe('When there is a `const` declaration on global,', () => {
    it('the reference on global should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('const a = 0;');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[0]);

      assert.exists(reference.writeExpr);

      expect(reference.isWrite()).toBe(true);
      expect(reference.isRead()).toBe(false);
    });

    it('the reference in functions should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        const a = 0;
        function foo() {
          const b = a;
        }
      `);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );

      assert.notExists(reference.writeExpr);

      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe('When there is a `var` declaration on global,', () => {
    it('the reference on global should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('var a = 0;');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toStrictEqual(variables[0]);

      assert.exists(reference.writeExpr);

      expect(reference.isWrite()).toBe(true);
      expect(reference.isRead()).toBe(false);
    });

    it('the reference in functions should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        var a = 0;
        function foo() {
          var b = a;
        }
      `);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      const [outerVariable] = getRealVariables(
        scopeManager.scopes[0].variables,
      );
      expect(reference.resolved).toStrictEqual(outerVariable);

      assert.notExists(reference.writeExpr);

      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe('When there is a `function` declaration on global,', () => {
    it('the reference on global should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(
        `
                  function a() {}
                  a();
              `,
        { sourceType: 'script' },
      );

      expect(scopeManager.scopes).toHaveLength(2); // [global, a]

      const scope = scopeManager.scopes[0];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toStrictEqual(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toStrictEqual(variables[0]);
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });

    it('the reference in functions should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
                  function a() {}
                  function foo() {
                      let b = a();
                  }
              `);

      expect(scopeManager.scopes).toHaveLength(3); // [global, a, foo]

      const scope = scopeManager.scopes[2];

      expect(scope.variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toStrictEqual(scope);
      expect(reference.identifier.name).toBe('a');
      const [variable] = getRealVariables(scopeManager.scopes[0].variables);
      expect(reference.resolved).toStrictEqual(variable);
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe('When there is a `class` declaration on global,', () => {
    it('the reference on global should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        class A {}
        let b = new A();
      `);

      expect(scopeManager.scopes).toHaveLength(2); // [global, A]

      const scope = scopeManager.scopes[0];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [A, b]
      expect(scope.references).toHaveLength(2); // [b, A]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('A');
      expect(reference.resolved).toBe(variables[0]);

      assert.notExists(reference.writeExpr);

      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });

    it('the reference in functions should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        class A {}
        function foo() {
          let b = new A();
        }
      `);

      expect(scopeManager.scopes).toHaveLength(3); // [global, A, foo]

      const scope = scopeManager.scopes[2];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, A]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('A');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );

      assert.notExists(reference.writeExpr);

      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe('When there is a `let` declaration in functions,', () => {
    it('the reference on the function should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        function foo() {
          let a = 0;
        }
      `);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, a]
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[1]);

      assert.exists(reference.writeExpr);

      expect(reference.isWrite()).toBe(true);
      expect(reference.isRead()).toBe(false);
    });

    it('the reference in nested functions should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        function foo() {
          let a = 0;
          function bar() {
            let b = a;
          }
        }
      `);

      expect(scopeManager.scopes).toHaveLength(3); // [global, foo, bar]

      const scope = scopeManager.scopes[2];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[1].variables)[1],
      );

      assert.notExists(reference.writeExpr);

      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe('When there is a `var` declaration in functions,', () => {
    it('the reference on the function should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        function foo() {
          var a = 0;
        }
      `);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, a]
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[1]);

      assert.exists(reference.writeExpr);

      expect(reference.isWrite()).toBe(true);
      expect(reference.isRead()).toBe(false);
    });

    it('the reference in nested functions should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        function foo() {
          var a = 0;
          function bar() {
            var b = a;
          }
        }
      `);

      expect(scopeManager.scopes).toHaveLength(3); // [global, foo, bar]

      const scope = scopeManager.scopes[2];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[1].variables)[1],
      );

      assert.notExists(reference.writeExpr);

      expect(reference.isWrite()).toBe(false);
      expect(reference.isRead()).toBe(true);
    });
  });

  describe('When there is a `let` declaration with destructuring assignment', () => {
    it('"let [a] = [1];", the reference should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('let [a] = [1];');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[0]);

      assert.exists(reference.writeExpr);

      expect(reference.isWrite()).toBe(true);
      expect(reference.isRead()).toBe(false);
    });

    it('"let {a} = {a: 1};", the reference should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('let {a} = {a: 1};');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[0]);

      assert.exists(reference.writeExpr);

      expect(reference.isWrite()).toBe(true);
      expect(reference.isRead()).toBe(false);
    });

    it('"let {a: {a}} = {a: {a: 1}};", the reference should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('let {a: {a}} = {a: {a: 1}};');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[0]);

      assert.exists(reference.writeExpr);

      expect(reference.isWrite()).toBe(true);
      expect(reference.isRead()).toBe(false);
    });
  });

  describe('Reference.init should be a boolean value of whether it is one to initialize or not.', () => {
    const trueCodes = [
      'var a = 0;',
      'let a = 0;',
      'const a = 0;',
      'var [a] = [];',
      'let [a] = [];',
      'const [a] = [];',
      'var [a = 1] = [];',
      'let [a = 1] = [];',
      'const [a = 1] = [];',
      'var {a} = {};',
      'let {a} = {};',
      'const {a} = {};',
      'var {b: a} = {};',
      'let {b: a} = {};',
      'const {b: a} = {};',
      'var {b: a = 0} = {};',
      'let {b: a = 0} = {};',
      'const {b: a = 0} = {};',
      'for (var a in []);',
      'for (let a in []);',
      'for (var [a] in []);',
      'for (let [a] in []);',
      'for (var [a = 0] in []);',
      'for (let [a = 0] in []);',
      'for (var {a} in []);',
      'for (let {a} in []);',
      'for (var {a = 0} in []);',
      'for (let {a = 0} in []);',
      'new function(a = 0) {}',
      'new function([a = 0] = []) {}',
      'new function({b: a = 0} = {}) {}',
    ] as const;

    it.for(trueCodes)(
      '"%s", all references should be true.',
      (code, { expect }) => {
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes.length).toBeGreaterThanOrEqual(1);

        const scope = scopeManager.scopes[scopeManager.scopes.length - 1];
        const variables = getRealVariables(scope.variables);

        expect(variables.length).toBeGreaterThanOrEqual(1);
        expect(scope.references.length).toBeGreaterThanOrEqual(1);

        scope.references.forEach(reference => {
          expect(reference.identifier.name).toBe('a');
          expect(reference.isWrite()).toBe(true);
          expect(reference.init).toBe(true);
        });
      },
    );

    const falseCodes = [
      'let a; a = 0;',
      'let a; [a] = [];',
      'let a; [a = 1] = [];',
      'let a; ({a} = {});',
      'let a; ({b: a} = {});',
      'let a; ({b: a = 0} = {});',
      'let a; for (a in []);',
      'let a; for ([a] in []);',
      'let a; for ([a = 0] in []);',
      'let a; for ({a} in []);',
      'let a; for ({a = 0} in []);',
    ] as const;

    it.for(falseCodes)(
      '"%s", all references should be false.',
      (code, { expect }) => {
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes.length).toBeGreaterThanOrEqual(1);

        const scope = scopeManager.scopes[scopeManager.scopes.length - 1];
        const variables = getRealVariables(scope.variables);

        expect(variables).toHaveLength(1);
        expect(scope.references.length).toBeGreaterThanOrEqual(1);

        scope.references.forEach(reference => {
          expect(reference.identifier.name).toBe('a');
          expect(reference.isWrite()).toBe(true);
          expect(reference.init).toBe(false);
        });
      },
    );

    it.for([
      'let a; let b = a;',
      'let a; let [b] = a;',
      'let a; let [b = a] = [];',
      'let a; for (var b in a);',
      'let a; for (var [b = a] in []);',
      'let a; for (let b in a);',
      'let a; for (let [b = a] in []);',
      'let a,b; b = a;',
      'let a,b; [b] = a;',
      'let a,b; [b = a] = [];',
      'let a,b; for (b in a);',
      'let a,b; for ([b = a] in []);',
      'let a; a.foo = 0;',
      'let a,b; b = a.foo;',
    ] as const)(
      '"%s", readonly references of "a" should be undefined.',
      (code, { expect }) => {
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes.length).toBeGreaterThanOrEqual(1);

        const scope = scopeManager.scopes[0];
        const variables = getRealVariables(scope.variables);

        expect(variables.length).toBeGreaterThanOrEqual(1);
        expect(variables[0].name).toBe('a');

        const { references } = variables[0];

        expect(references.length).toBeGreaterThanOrEqual(1);

        references.forEach(reference => {
          expect(reference.isRead()).toBe(true);

          assert.notExists(reference.init);
        });
      },
    );
  });
});
