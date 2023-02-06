import { AST_NODE_TYPES } from '@typescript-eslint/types';
import * as ts from 'typescript';

import type { TSNode } from '../../src';
import { Converter } from '../../src/convert';

describe('convert', () => {
  function convertCode(code: string): ts.SourceFile {
    return ts.createSourceFile(
      'text.ts',
      code,
      ts.ScriptTarget.ESNext,
      true,
      ts.ScriptKind.TSX,
    );
  }

  it('deeplyCopy should convert node correctly', () => {
    const ast = convertCode('type foo = ?foo<T> | ?(() => void)?');

    function fakeUnknownKind(node: ts.Node): void {
      ts.forEachChild(node, fakeUnknownKind);
      // @ts-expect-error -- intentionally writing to a readonly field
      node.kind = ts.SyntaxKind.UnparsedPrologue;
    }

    ts.forEachChild(ast, fakeUnknownKind);

    const instance = new Converter(ast);
    expect(instance.convertProgram()).toMatchSnapshot();
  });

  it('deeplyCopy should convert node with decorators correctly', () => {
    const ast = convertCode('@test class foo {}');

    const instance = new Converter(ast);

    expect(
      instance['deeplyCopy'](ast.statements[0] as ts.ClassDeclaration),
    ).toMatchSnapshot();
  });

  it('deeplyCopy should convert node with type parameters correctly', () => {
    const ast = convertCode('class foo<T> {}');

    const instance = new Converter(ast);

    expect(
      instance['deeplyCopy'](ast.statements[0] as ts.ClassDeclaration),
    ).toMatchSnapshot();
  });

  it('deeplyCopy should convert node with type arguments correctly', () => {
    const ast = convertCode('new foo<T>()');

    const instance = new Converter(ast);

    expect(
      instance['deeplyCopy'](
        (ast.statements[0] as ts.ExpressionStatement)
          .expression as ts.NewExpression,
      ),
    ).toMatchSnapshot();
  });

  it('deeplyCopy should convert array of nodes', () => {
    const ast = convertCode('new foo<T>()');

    const instance = new Converter(ast);
    expect(instance['deeplyCopy'](ast)).toMatchSnapshot();
  });

  it('deeplyCopy should fail on unknown node', () => {
    const ast = convertCode('type foo = ?foo<T> | ?(() => void)?');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: true,
    });

    expect(() => instance['deeplyCopy'](ast)).toThrow(
      'Unknown AST_NODE_TYPE: "TSSourceFile"',
    );
  });

  it('nodeMaps should contain basic nodes', () => {
    const ast = convertCode(`
      'test';
      2;
      class foo {};
      type bar = {};
    `);

    const instance = new Converter(ast, {
      shouldPreserveNodeMaps: true,
    });
    instance.convertProgram();
    const maps = instance.getASTMaps();

    function checkMaps(child: ts.SourceFile | ts.Node): void {
      child.forEachChild(node => {
        if (
          node.kind !== ts.SyntaxKind.EndOfFileToken &&
          node.kind !== ts.SyntaxKind.JsxAttributes &&
          node.kind !== ts.SyntaxKind.VariableDeclaration
        ) {
          expect(node).toBe(
            maps.esTreeNodeToTSNodeMap.get(
              maps.tsNodeToESTreeNodeMap.get(node as TSNode),
            ),
          );
        }
        checkMaps(node);
      });
    }

    expect(ast).toBe(
      maps.esTreeNodeToTSNodeMap.get(maps.tsNodeToESTreeNodeMap.get(ast)),
    );
    checkMaps(ast);
  });

  it('nodeMaps should contain jsx nodes', () => {
    const ast = convertCode(`<a.b.c.d.e></a.b.c.d.e>`);

    const instance = new Converter(ast, {
      shouldPreserveNodeMaps: true,
    });
    instance.convertProgram();
    const maps = instance.getASTMaps();

    function checkMaps(child: ts.SourceFile | ts.Node): void {
      child.forEachChild(node => {
        if (
          node.kind !== ts.SyntaxKind.EndOfFileToken &&
          node.kind !== ts.SyntaxKind.JsxAttributes
        ) {
          expect(node).toBe(
            maps.esTreeNodeToTSNodeMap.get(
              maps.tsNodeToESTreeNodeMap.get(node as TSNode),
            ),
          );
        }
        checkMaps(node);
      });
    }

    expect(ast).toBe(
      maps.esTreeNodeToTSNodeMap.get(maps.tsNodeToESTreeNodeMap.get(ast)),
    );
    checkMaps(ast);
  });

  it('nodeMaps should contain export node', () => {
    const ast = convertCode(`export function foo () {}`);

    const instance = new Converter(ast, {
      shouldPreserveNodeMaps: true,
    });
    const program = instance.convertProgram();
    const maps = instance.getASTMaps();

    function checkMaps(child: ts.SourceFile | ts.Node): void {
      child.forEachChild(node => {
        if (node.kind !== ts.SyntaxKind.EndOfFileToken) {
          expect(ast).toBe(
            maps.esTreeNodeToTSNodeMap.get(maps.tsNodeToESTreeNodeMap.get(ast)),
          );
        }
        checkMaps(node);
      });
    }

    expect(ast).toBe(
      maps.esTreeNodeToTSNodeMap.get(maps.tsNodeToESTreeNodeMap.get(ast)),
    );

    expect(maps.esTreeNodeToTSNodeMap.get(program.body[0])).toBeDefined();
    expect(program.body[0]).not.toBe(
      maps.tsNodeToESTreeNodeMap.get(ast.statements[0] as TSNode),
    );
    checkMaps(ast);
  });

  it('should correctly create node with range and loc set', () => {
    const ast = convertCode('');
    const instance = new Converter(ast, {
      shouldPreserveNodeMaps: true,
    });

    const tsNode: ts.KeywordToken<ts.SyntaxKind.AbstractKeyword> = {
      ...ts.factory.createToken(ts.SyntaxKind.AbstractKeyword),
      end: 10,
      pos: 0,
    };
    const convertedNode = instance['createNode'](tsNode, {
      type: AST_NODE_TYPES.TSAbstractKeyword,
      range: [0, 20],
      loc: {
        start: {
          line: 10,
          column: 20,
        },
        end: {
          line: 15,
          column: 25,
        },
      },
    });
    expect(convertedNode).toEqual({
      type: AST_NODE_TYPES.TSAbstractKeyword,
      range: [0, 20],
      loc: {
        start: {
          line: 10,
          column: 20,
        },
        end: {
          line: 15,
          column: 25,
        },
      },
    });
  });

  it('should throw error on jsDoc node', () => {
    const jsDocCode = [
      'const x: function(new: number, string);',
      'const x: function(this: number, string);',
      'var g: function(number, number): number;',
    ];

    for (const code of jsDocCode) {
      const ast = convertCode(code);

      const instance = new Converter(ast);
      expect(() => instance.convertProgram()).toThrow(
        'JSDoc types can only be used inside documentation comments.',
      );
    }
  });

  describe('errorOnInvalidAST', () => {
    function generateTest(title: string, code: string, error: string): void {
      it(`does not throw an error for ${title} when errorOnInvalidAST is false`, () => {
        const ast = convertCode(code);

        const instance = new Converter(ast);

        expect(() => instance.convertProgram()).not.toThrow();
      });

      it(`throws an error for ${title} when errorOnInvalidAST is true`, () => {
        const ast = convertCode(code);

        const instance = new Converter(ast, {
          errorOnInvalidAST: true,
        });

        expect(() => instance.convertProgram()).toThrow(error);
      });
    }

    generateTest(
      'a throw statement inside a block',
      '{ throw }',
      'A throw statement must throw an expression.',
    );

    generateTest(
      'a decorator on an enum declaration',
      '@decl let value;',
      'Decorators are not valid here.',
    );

    generateTest(
      'a decorator on an interface declaration',
      '@decl interface _ {};',
      'Decorators are not valid here.',
    );

    generateTest(
      'a decorator on a type alias declaration',
      '@decl type _ = {};',
      'Decorators are not valid here.',
    );

    generateTest(
      'a decorator on a variable statement',
      '@decl let value;',
      'Decorators are not valid here.',
    );

    generateTest(
      'an exported class declaration without a name',
      'export class { }',
      "A class declaration without the 'default' modifier must have a name.",
    );

    generateTest(
      'a variable declaration with no variables',
      'const;',
      'A variable declaration list must have at least one variable declarator.',
    );
  });
});
