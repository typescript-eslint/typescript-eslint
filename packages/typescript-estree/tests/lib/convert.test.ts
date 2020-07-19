// deeplyCopy is private internal
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Converter } from '../../src/convert';
import * as ts from 'typescript';

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- intentionally writing to a readonly field
      // @ts-expect-error
      node.kind = ts.SyntaxKind.UnparsedPrologue;
    }

    ts.forEachChild(ast, fakeUnknownKind);

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldPreserveNodeMaps: false,
    });
    expect(instance.convertProgram()).toMatchSnapshot();
  });

  it('deeplyCopy should convert node with decorators correctly', () => {
    const ast = convertCode('@test class foo {}');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldPreserveNodeMaps: false,
    }) as any;

    expect(instance.deeplyCopy(ast.statements[0])).toMatchSnapshot();
  });

  it('deeplyCopy should convert node with type parameters correctly', () => {
    const ast = convertCode('class foo<T> {}');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldPreserveNodeMaps: false,
    }) as any;

    expect(instance.deeplyCopy(ast.statements[0])).toMatchSnapshot();
  });

  it('deeplyCopy should convert node with type arguments correctly', () => {
    const ast = convertCode('new foo<T>()');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldPreserveNodeMaps: false,
    }) as any;

    expect(
      instance.deeplyCopy((ast.statements[0] as any).expression),
    ).toMatchSnapshot();
  });

  it('deeplyCopy should convert array of nodes', () => {
    const ast = convertCode('new foo<T>()');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldPreserveNodeMaps: false,
    }) as any;
    expect(instance.deeplyCopy(ast)).toMatchSnapshot();
  });

  it('deeplyCopy should fail on unknown node', () => {
    const ast = convertCode('type foo = ?foo<T> | ?(() => void)?');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: true,
      useJSXTextNode: false,
      shouldPreserveNodeMaps: false,
    }) as any;

    expect(() => instance.deeplyCopy(ast)).toThrow(
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
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
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
              maps.tsNodeToESTreeNodeMap.get(node as any),
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
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
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
              maps.tsNodeToESTreeNodeMap.get(node as any),
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
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
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
      maps.tsNodeToESTreeNodeMap.get(ast.statements[0] as any),
    );
    checkMaps(ast);
  });

  it('should correctly create node with range and loc set', () => {
    const ast = convertCode('');
    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldPreserveNodeMaps: true,
    });

    const tsNode = ts.createNode(ts.SyntaxKind.AsKeyword, 0, 10);
    const convertedNode = (instance as any).createNode(tsNode, {
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
      loc: {
        end: {
          column: 25,
          line: 15,
        },
        start: {
          column: 20,
          line: 10,
        },
      },
      range: [0, 20],
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

      const instance = new Converter(ast, {
        errorOnUnknownASTType: false,
        useJSXTextNode: false,
        shouldPreserveNodeMaps: false,
      });
      expect(() => instance.convertProgram()).toThrow(
        'JSDoc types can only be used inside documentation comments.',
      );
    }
  });
});
