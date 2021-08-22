import { getRealVariables, parseAndAnalyze } from '../util';

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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[0]);
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [A, b]
      expect(scope.references).toHaveLength(2); // [b, A]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('A');
      expect(reference.resolved).toBe(variables[0]);
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, A]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('A');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[0].variables)[0],
      );
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, a]
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[1]);
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[1].variables)[1],
      );
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, a]
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[1]);
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(2); // [arguments, b]
      expect(scope.references).toHaveLength(2); // [b, a]

      const reference = scope.references[1];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(
        getRealVariables(scopeManager.scopes[1].variables)[1],
      );
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
      const variables = getRealVariables(scope.variables);

      expect(variables).toHaveLength(1);
      expect(scope.references).toHaveLength(1);

      const reference = scope.references[0];

      expect(reference.from).toBe(scope);
      expect(reference.identifier.name).toBe('a');
      expect(reference.resolved).toBe(variables[0]);
      expect(reference.writeExpr).not.toBeUndefined();
      expect(reference.isWrite()).toBeTruthy();
      expect(reference.isRead()).toBeFalsy();
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
      expect(reference.writeExpr).not.toBeUndefined();
      expect(reference.isWrite()).toBeTruthy();
      expect(reference.isRead()).toBeFalsy();
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
        const variables = getRealVariables(scope.variables);

        expect(variables.length).toBeGreaterThanOrEqual(1);
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
        const variables = getRealVariables(scope.variables);

        expect(variables).toHaveLength(1);
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
        const variables = getRealVariables(scope.variables);

        expect(variables.length).toBeGreaterThanOrEqual(1);
        expect(variables[0].name).toBe('a');

        const references = variables[0].references;

        expect(references.length).toBeGreaterThanOrEqual(1);

        references.forEach(reference => {
          expect(reference.isRead()).toBeTruthy();
          expect(reference.init).toBeUndefined();
        });
      }),
    );
  });

  describe('When emitDecoratorMetadata is true', () => {
    it('check type referenced by decorator metadata', () => {
      const { scopeManager } = parseAndAnalyze(
        `
        @deco
        class A {
          property: Type1;
          @deco
          propertyWithDeco: a.Foo;

          set foo(@deco a: SetterType) {}

          constructor(foo: b.Foo) {}

          foo1(@deco a: Type2, b: Type0) {}

          @deco
          foo2(a: Type3) {}

          @deco
          foo3(): Type4 {}

          set ['a'](a: Type5) {}
          set [0](a: Type6) {}
          @deco
          get a() {}
          @deco
          get [0]() {}
        }

        const keyName = 'foo';
        class B {
          constructor(@deco foo: c.Foo) {}

          set [keyName](a: Type) {}
          @deco
          get [keyName]() {}
        }

        declare class C {
          @deco
          foo(): TypeC;
        }
      `,
        {
          emitDecoratorMetadata: true,
        },
      );

      const classAScope = scopeManager.globalScope!.childScopes[0];
      const propertyTypeRef = classAScope.references[2];
      expect(propertyTypeRef.identifier.name).toBe('a');
      expect(propertyTypeRef.isTypeReference).toBe(true);
      expect(propertyTypeRef.isValueReference).toBe(true);

      const setterParamTypeRef = classAScope.childScopes[0].references[0];
      expect(setterParamTypeRef.identifier.name).toBe('SetterType');
      expect(setterParamTypeRef.isTypeReference).toBe(true);
      expect(setterParamTypeRef.isValueReference).toBe(false);

      const constructorParamTypeRef = classAScope.childScopes[1].references[0];
      expect(constructorParamTypeRef.identifier.name).toBe('b');
      expect(constructorParamTypeRef.isTypeReference).toBe(true);
      expect(constructorParamTypeRef.isValueReference).toBe(true);

      const methodParamTypeRef = classAScope.childScopes[2].references[0];
      expect(methodParamTypeRef.identifier.name).toBe('Type2');
      expect(methodParamTypeRef.isTypeReference).toBe(true);
      expect(methodParamTypeRef.isValueReference).toBe(true);
      const methodParamTypeRef0 = classAScope.childScopes[2].references[2];
      expect(methodParamTypeRef0.identifier.name).toBe('Type0');
      expect(methodParamTypeRef0.isTypeReference).toBe(true);
      expect(methodParamTypeRef0.isValueReference).toBe(true);

      const methodParamTypeRef1 = classAScope.childScopes[3].references[0];
      expect(methodParamTypeRef1.identifier.name).toBe('Type3');
      expect(methodParamTypeRef1.isTypeReference).toBe(true);
      expect(methodParamTypeRef1.isValueReference).toBe(true);

      const methodReturnTypeRef = classAScope.childScopes[4].references[0];
      expect(methodReturnTypeRef.identifier.name).toBe('Type4');
      expect(methodReturnTypeRef.isTypeReference).toBe(true);
      expect(methodReturnTypeRef.isValueReference).toBe(true);

      const setterParamTypeRef1 = classAScope.childScopes[5].references[0];
      expect(setterParamTypeRef1.identifier.name).toBe('Type5');
      expect(setterParamTypeRef1.isTypeReference).toBe(true);
      expect(setterParamTypeRef1.isValueReference).toBe(true);

      const setterParamTypeRef2 = classAScope.childScopes[6].references[0];
      expect(setterParamTypeRef2.identifier.name).toBe('Type6');
      expect(setterParamTypeRef2.isTypeReference).toBe(true);
      expect(setterParamTypeRef2.isValueReference).toBe(true);

      const classBScope = scopeManager.globalScope!.childScopes[1];

      const constructorParamTypeRef1 = classBScope.childScopes[0].references[0];
      expect(constructorParamTypeRef1.identifier.name).toBe('c');
      expect(constructorParamTypeRef1.isTypeReference).toBe(true);
      expect(constructorParamTypeRef1.isValueReference).toBe(true);

      const setterParamTypeRef3 = classBScope.childScopes[1].references[0];
      expect(setterParamTypeRef3.identifier.name).toBe('Type');
      expect(setterParamTypeRef3.isTypeReference).toBe(true);
      expect(setterParamTypeRef3.isValueReference).toBe(false);

      const classCScope = scopeManager.globalScope!.childScopes[2];

      const methodReturnTypeRef1 = classCScope.childScopes[0].references[0];
      expect(methodReturnTypeRef1.identifier.name).toBe('TypeC');
      expect(methodReturnTypeRef1.isTypeReference).toBe(true);
      expect(methodReturnTypeRef1.isValueReference).toBe(false);
    });
  });
});
