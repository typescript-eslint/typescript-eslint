import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';
import { simpleTraverse } from '@typescript-eslint/typescript-estree';
import { parse } from '../util/parse';
import { analyze } from '../../src/analyze';

describe('ScopeManager.prototype.getDeclaredVariables', () => {
  function verify(
    ast: TSESTree.Node,
    type: AST_NODE_TYPES,
    expectedNamesList: string[][],
  ): void {
    const scopeManager = analyze(ast, {
      ecmaVersion: 6,
      sourceType: 'module',
    });

    simpleTraverse(ast, {
      [type](node) {
        const expected = expectedNamesList.shift()!;
        const actual = scopeManager.getDeclaredVariables(node);

        expect(actual).toHaveLength(expected.length);
        if (actual.length > 0) {
          const end = actual.length - 1;

          for (let i = 0; i <= end; i++) {
            expect(actual[i].name).toBe(expected[i]);
          }
        }
      },
    });

    expect(expectedNamesList).toHaveLength(0);
  }

  it('should get variables that declared on `VariableDeclaration`', () => {
    const ast = parse(`
      var {a, x: [b], y: {c = 0}} = foo;
      let {d, x: [e], y: {f = 0}} = foo;
      const {g, x: [h], y: {i = 0}} = foo, {j, k = function() { let l; }} = bar;
    `);

    verify(ast, AST_NODE_TYPES.VariableDeclaration, [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      ['g', 'h', 'i', 'j', 'k'],
      ['l'],
    ]);
  });

  it('should get variables that declared on `VariableDeclaration` in for-in/of', () => {
    const ast = parse(`
      for (var {a, x: [b], y: {c = 0}} in foo) {
        let g;
      }
      for (let {d, x: [e], y: {f = 0}} of foo) {
        let h;
      }
    `);

    verify(ast, AST_NODE_TYPES.VariableDeclaration, [
      ['a', 'b', 'c'],
      ['g'],
      ['d', 'e', 'f'],
      ['h'],
    ]);
  });

  it('should get variables that declared on `VariableDeclarator`', () => {
    const ast = parse(`
      var {a, x: [b], y: {c = 0}} = foo;
      let {d, x: [e], y: {f = 0}} = foo;
      const {g, x: [h], y: {i = 0}} = foo, {j, k = function() { let l; }} = bar;
    `);

    verify(ast, AST_NODE_TYPES.VariableDeclarator, [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      ['g', 'h', 'i'],
      ['j', 'k'],
      ['l'],
    ]);
  });

  it('should get variables that declared on `FunctionDeclaration`', () => {
    const ast = parse(`
      function foo({a, x: [b], y: {c = 0}}, [d, e]) {
        let z;
      }
      function bar({f, x: [g], y: {h = 0}}, [i, j = function(q) { let w; }]) {
        let z;
      }
    `);

    verify(ast, AST_NODE_TYPES.FunctionDeclaration, [
      ['foo', 'a', 'b', 'c', 'd', 'e'],
      ['bar', 'f', 'g', 'h', 'i', 'j'],
    ]);
  });

  it('should get variables that declared on `FunctionExpression`', () => {
    const ast = parse(`
      (function foo({a, x: [b], y: {c = 0}}, [d, e]) {
        let z;
      });
      (function bar({f, x: [g], y: {h = 0}}, [i, j = function(q) { let w; }]) {
        let z;
      });
    `);

    verify(ast, AST_NODE_TYPES.FunctionExpression, [
      ['foo', 'a', 'b', 'c', 'd', 'e'],
      ['bar', 'f', 'g', 'h', 'i', 'j'],
      ['q'],
    ]);
  });

  it('should get variables that declared on `ArrowFunctionExpression`', () => {
    const ast = parse(`
      (({a, x: [b], y: {c = 0}}, [d, e]) => {
        let z;
      });
      (({f, x: [g], y: {h = 0}}, [i, j]) => {
        let z;
      });
    `);

    verify(ast, AST_NODE_TYPES.ArrowFunctionExpression, [
      ['a', 'b', 'c', 'd', 'e'],
      ['f', 'g', 'h', 'i', 'j'],
    ]);
  });

  it('should get variables that declared on `ClassDeclaration`', () => {
    const ast = parse(`
      class A { foo(x) { let y; } }
      class B { foo(x) { let y; } }
    `);

    verify(ast, AST_NODE_TYPES.ClassDeclaration, [
      ['A', 'A'], // outer scope"s and inner scope"s.
      ['B', 'B'],
    ]);
  });

  it('should get variables that declared on `ClassExpression`', () => {
    const ast = parse(`
      (class A { foo(x) { let y; } });
      (class B { foo(x) { let y; } });
    `);

    verify(ast, AST_NODE_TYPES.ClassExpression, [['A'], ['B']]);
  });

  it('should get variables that declared on `CatchClause`', () => {
    const ast = parse(`
      try {} catch ({a, b}) {
        let x;
        try {} catch ({c, d}) {
          let y;
        }
      }
    `);

    verify(ast, AST_NODE_TYPES.CatchClause, [
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('should get variables that declared on `ImportDeclaration`', () => {
    const ast = parse(
      `
        import "aaa";
        import * as a from "bbb";
        import b, {c, x as d} from "ccc";\
      `,
      'module',
    );

    verify(ast, AST_NODE_TYPES.ImportDeclaration, [[], ['a'], ['b', 'c', 'd']]);
  });

  it('should get variables that declared on `ImportSpecifier`', () => {
    const ast = parse(
      `
        import "aaa";
        import * as a from "bbb";
        import b, {c, x as d} from "ccc";
      `,
      'module',
    );

    verify(ast, AST_NODE_TYPES.ImportSpecifier, [['c'], ['d']]);
  });

  it('should get variables that declared on `ImportDefaultSpecifier`', () => {
    const ast = parse(
      `
        import "aaa";
        import * as a from "bbb";
        import b, {c, x as d} from "ccc";
      `,
      'module',
    );

    verify(ast, AST_NODE_TYPES.ImportDefaultSpecifier, [['b']]);
  });

  it('should get variables that declared on `ImportNamespaceSpecifier`', () => {
    const ast = parse(
      `
        import "aaa";
        import * as a from "bbb";
        import b, {c, x as d} from "ccc";
      `,
      'module',
    );

    verify(ast, AST_NODE_TYPES.ImportNamespaceSpecifier, [['a']]);
  });

  it("should not get duplicate even if it's declared twice", () => {
    const ast = parse('var a = 0, a = 1;');

    verify(ast, AST_NODE_TYPES.VariableDeclaration, [['a']]);
  });
});
