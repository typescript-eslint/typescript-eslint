import { AST_NODE_TYPES } from '@typescript-eslint/types';

describe('ScopeManager.prototype.getDeclaredVariables', () => {
  it('should get variables that declared on `VariableDeclaration`', () => {
    expect(`
      var {a, x: [b], y: {c = 0}} = foo;
      let {d, x: [e], y: {f = 0}} = foo;
      const {g, x: [h], y: {i = 0}} = foo, {j, k = function() { let l; }} = bar;
    `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.VariableDeclaration,
      expectedNamesList: [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i', 'j', 'k'],
        ['l'],
      ],
    });
  });

  it('should get variables that declared on `VariableDeclaration` in for-in/of', () => {
    expect(`
      for (var {a, x: [b], y: {c = 0}} in foo) {
        let g;
      }
      for (let {d, x: [e], y: {f = 0}} of foo) {
        let h;
      }
    `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.VariableDeclaration,
      expectedNamesList: [['a', 'b', 'c'], ['g'], ['d', 'e', 'f'], ['h']],
    });
  });

  it('should get variables that declared on `VariableDeclarator`', () => {
    expect(`
      var {a, x: [b], y: {c = 0}} = foo;
      let {d, x: [e], y: {f = 0}} = foo;
      const {g, x: [h], y: {i = 0}} = foo, {j, k = function() { let l; }} = bar;
    `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.VariableDeclarator,
      expectedNamesList: [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i'],
        ['j', 'k'],
        ['l'],
      ],
    });
  });

  it('should get variables that declared on `FunctionDeclaration`', () => {
    expect(`
      function foo({a, x: [b], y: {c = 0}}, [d, e]) {
        let z;
      }
      function bar({f, x: [g], y: {h = 0}}, [i, j = function(q) { let w; }]) {
        let z;
      }
    `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.FunctionDeclaration,
      expectedNamesList: [
        ['foo', 'a', 'b', 'c', 'd', 'e'],
        ['bar', 'f', 'g', 'h', 'i', 'j'],
      ],
    });
  });

  it('should get variables that declared on `FunctionExpression`', () => {
    expect(`
      (function foo({a, x: [b], y: {c = 0}}, [d, e]) {
        let z;
      });
      (function bar({f, x: [g], y: {h = 0}}, [i, j = function(q) { let w; }]) {
        let z;
      });
    `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.FunctionExpression,
      expectedNamesList: [
        ['foo', 'a', 'b', 'c', 'd', 'e'],
        ['bar', 'f', 'g', 'h', 'i', 'j'],
        ['q'],
      ],
    });
  });

  it('should get variables that declared on `ArrowFunctionExpression`', () => {
    expect(`
      (({a, x: [b], y: {c = 0}}, [d, e]) => {
        let z;
      });
      (({f, x: [g], y: {h = 0}}, [i, j]) => {
        let z;
      });
    `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.ArrowFunctionExpression,
      expectedNamesList: [
        ['a', 'b', 'c', 'd', 'e'],
        ['f', 'g', 'h', 'i', 'j'],
      ],
    });
  });

  it('should get variables that declared on `ClassDeclaration`', () => {
    expect(`
      class A { foo(x) { let y; } }
      class B { foo(x) { let y; } }
    `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.ClassDeclaration,
      expectedNamesList: [
        ['A', 'A'], // outer scope"s and inner scope"s.
        ['B', 'B'],
      ],
    });
  });

  it('should get variables that declared on `ClassExpression`', () => {
    expect(`
      (class A { foo(x) { let y; } });
      (class B { foo(x) { let y; } });
    `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.ClassExpression,
      expectedNamesList: [['A'], ['B']],
    });
  });

  it('should get variables that declared on `CatchClause`', () => {
    expect(`
      try {} catch ({a, b}) {
        let x;
        try {} catch ({c, d}) {
          let y;
        }
      }
    `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.CatchClause,
      expectedNamesList: [
        ['a', 'b'],
        ['c', 'd'],
      ],
    });
  });

  it('should get variables that declared on `ImportDeclaration`', () => {
    expect(`
        import "aaa";
        import * as a from "bbb";
        import b, {c, x as d} from "ccc";\
      `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.ImportDeclaration,
      expectedNamesList: [[], ['a'], ['b', 'c', 'd']],
      parserOptions: { sourceType: 'module' },
    });
  });

  it('should get variables that declared on `ImportSpecifier`', () => {
    expect(`
        import "aaa";
        import * as a from "bbb";
        import b, {c, x as d} from "ccc";
      `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.ImportSpecifier,
      expectedNamesList: [['c'], ['d']],
      parserOptions: { sourceType: 'module' },
    });
  });

  it('should get variables that declared on `ImportDefaultSpecifier`', () => {
    expect(`
        import "aaa";
        import * as a from "bbb";
        import b, {c, x as d} from "ccc";
      `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.ImportDefaultSpecifier,
      expectedNamesList: [['b']],
      parserOptions: { sourceType: 'module' },
    });
  });

  it('should get variables that declared on `ImportNamespaceSpecifier`', () => {
    expect(`
        import "aaa";
        import * as a from "bbb";
        import b, {c, x as d} from "ccc";
      `).toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.ImportNamespaceSpecifier,
      expectedNamesList: [['a']],
      parserOptions: { sourceType: 'module' },
    });
  });

  it("should not get duplicate even if it's declared twice", () => {
    expect('var a = 0, a = 1;').toHaveDeclaredVariables({
      astNodeType: AST_NODE_TYPES.VariableDeclaration,
      expectedNamesList: [['a']],
    });
  });
});
