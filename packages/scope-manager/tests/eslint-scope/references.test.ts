import { parseAndAnalyze } from '../util';

describe('References:', () => {
  describe('When there is a `let` declaration on global,', () => {
    it('the reference on global should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('let a = 0;');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];

      expect(scope.variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(scope.variables[0]);
      expect(reference.writeExpr).not.toBeUndefined();
      expect(reference.isWrite()).toBeTruthy();
      expect(reference.isRead()).toBeFalsy();
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

      expect(scope.variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(scopeManager.scopes[0].variables[0]);
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBeFalsy();
      expect(reference.isRead()).toBeTruthy();
    });

    it('the reference in default parameters should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        let a = 0;
        function foo(b = a) {
        }
      `);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];

      expect(scope.variables).toHaveLength(2); // [arguments, b]
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

  describe('When there is a `const` declaration on global,', () => {
    it('the reference on global should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('const a = 0;');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];

      expect(scope.variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(scope.variables[0]);
      expect(reference.writeExpr).not.toBeUndefined();
      expect(reference.isWrite()).toBeTruthy();
      expect(reference.isRead()).toBeFalsy();
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

      expect(scope.variables).toHaveLength(2); // [arguments, b]
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

  describe('When there is a `var` declaration on global,', () => {
    it('the reference on global should NOT be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('var a = 0;');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];

      expect(scope.variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBeNull();
      expect(reference.writeExpr).not.toBeUndefined();
      expect(reference.isWrite()).toBeTruthy();
      expect(reference.isRead()).toBeFalsy();
    });

    it('the reference in functions should NOT be resolved.', () => {
      const { scopeManager } = parseAndAnalyze(`
        var a = 0;
        function foo() {
          var b = a;
        }
      `);

      expect(scopeManager.scopes).toHaveLength(2); // [global, foo]

      const scope = scopeManager.scopes[1];

      expect(scope.variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBeNull();
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBeFalsy();
      expect(reference.isRead()).toBeTruthy();
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

      expect(scope.variables).toHaveLength(2); // [A, b]
      expect(scope.references).toHaveLength(2); // [b, A]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('A');
      expect(reference.resolved).toBe(scope.variables[0]);
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBeFalsy();
      expect(reference.isRead()).toBeTruthy();
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

      expect(scope.variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, A]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('A');
      expect(reference.resolved).toBe(scopeManager.scopes[0].variables[0]);
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBeFalsy();
      expect(reference.isRead()).toBeTruthy();
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

      expect(scope.variables).toHaveLength(2); // [arguments, a]
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(scope.variables[1]);
      expect(reference.writeExpr).not.toBeUndefined();
      expect(reference.isWrite()).toBeTruthy();
      expect(reference.isRead()).toBeFalsy();
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

      expect(scope.variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(scopeManager.scopes[1].variables[1]);
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBeFalsy();
      expect(reference.isRead()).toBeTruthy();
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

      expect(scope.variables).toHaveLength(2); // [arguments, a]
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(scope.variables[1]);
      expect(reference.writeExpr).not.toBeUndefined();
      expect(reference.isWrite()).toBeTruthy();
      expect(reference.isRead()).toBeFalsy();
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

      expect(scope.variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(scopeManager.scopes[1].variables[1]);
      expect(reference.writeExpr).toBeUndefined();
      expect(reference.isWrite()).toBeFalsy();
      expect(reference.isRead()).toBeTruthy();
    });
  });

  describe('When there is a `let` declaration with destructuring assignment', () => {
    it('"let [a] = [1];", the reference should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('let [a] = [1];');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];

      expect(scope.variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(scope.variables[0]);
      expect(reference.writeExpr).not.toBeUndefined();
      expect(reference.isWrite()).toBeTruthy();
      expect(reference.isRead()).toBeFalsy();
    });

    it('"let {a} = {a: 1};", the reference should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('let {a} = {a: 1};');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];

      expect(scope.variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(scope.variables[0]);
      expect(reference.writeExpr).not.toBeUndefined();
      expect(reference.isWrite()).toBeTruthy();
      expect(reference.isRead()).toBeFalsy();
    });

    it('"let {a: {a}} = {a: {a: 1}};", the reference should be resolved.', () => {
      const { scopeManager } = parseAndAnalyze('let {a: {a}} = {a: {a: 1}};');

      expect(scopeManager.scopes).toHaveLength(1);

      const scope = scopeManager.scopes[0];

      expect(scope.variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(scope.variables[0]);
      expect(reference.writeExpr).not.toBeUndefined();
      expect(reference.isWrite()).toBeTruthy();
      expect(reference.isRead()).toBeFalsy();
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
    ];

    trueCodes.forEach(code =>
      it(`"${code}", all references should be true.`, () => {
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes.length).toBeGreaterThanOrEqual(1);

        const scope = scopeManager.scopes[scopeManager.scopes.length - 1];

        expect(scope.variables.length).toBeGreaterThanOrEqual(1);
        expect(scope.references.length).toBeGreaterThanOrEqual(1);

        scope.references.forEach(reference => {
          expect(reference.identifier.name).toBe('a');
          expect(reference.isWrite()).toBeTruthy();
          expect(reference.init).toBeTruthy();
        });
      }),
    );

    let falseCodes = [
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
    ];

    falseCodes.forEach(code =>
      it(`"${code}", all references should be false.`, () => {
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes.length).toBeGreaterThanOrEqual(1);

        const scope = scopeManager.scopes[scopeManager.scopes.length - 1];

        expect(scope.variables).toHaveLength(1);
        expect(scope.references.length).toBeGreaterThanOrEqual(1);

        scope.references.forEach(reference => {
          expect(reference.identifier.name).toBe('a');
          expect(reference.isWrite()).toBeTruthy();
          expect(reference.init).toBeFalsy();
        });
      }),
    );

    falseCodes = [
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
    ];
    falseCodes.forEach(code =>
      it(`"${code}", readonly references of "a" should be undefined.`, () => {
        const { scopeManager } = parseAndAnalyze(code);

        expect(scopeManager.scopes.length).toBeGreaterThanOrEqual(1);

        const scope = scopeManager.scopes[0];

        expect(scope.variables.length).toBeGreaterThanOrEqual(1);
        expect(scope.variables[0].name).toBe('a');

        const references = scope.variables[0].references;

        expect(references.length).toBeGreaterThanOrEqual(1);

        references.forEach(reference => {
          expect(reference.isRead()).toBeTruthy();
          expect(reference.init).toBeUndefined();
        });
      }),
    );
  });
});
