import { Converter } from '../../src/convert';
import ts from 'typescript';

describe('convert', () => {
  function convertCode(code: string): ts.SourceFile {
    return ts.createSourceFile(
      'text.ts',
      code,
      ts.ScriptTarget.ESNext,
      true,
      ts.ScriptKind.TSX
    );
  }

  it('deeplyCopy should convert node correctly', () => {
    const ast = convertCode('type foo = ?foo<T> | ?(() => void)?');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldProvideParserServices: false
    });
    expect(instance.convertProgram()).toMatchSnapshot();
  });

  it('deeplyCopy should convert node with decorators correctly', () => {
    const ast = convertCode('@test class foo {}');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldProvideParserServices: false
    });
    expect((instance as any).deeplyCopy(ast.statements[0])).toMatchSnapshot();
  });

  it('deeplyCopy should convert node with type parameters correctly', () => {
    const ast = convertCode('class foo<T> {}');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldProvideParserServices: false
    });
    expect((instance as any).deeplyCopy(ast.statements[0])).toMatchSnapshot();
  });

  it('deeplyCopy should convert node with type arguments correctly', () => {
    const ast = convertCode('new foo<T>()');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldProvideParserServices: false
    });
    expect(
      (instance as any).deeplyCopy((ast.statements[0] as any).expression)
    ).toMatchSnapshot();
  });

  it('deeplyCopy should convert array of nodes', () => {
    const ast = convertCode('new foo<T>()');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldProvideParserServices: false
    });
    expect((instance as any).deeplyCopy(ast)).toMatchSnapshot();
  });

  it('deeplyCopy should fail on unknown node', () => {
    const ast = convertCode('type foo = ?foo<T> | ?(() => void)?');

    const instance = new Converter(ast, {
      errorOnUnknownASTType: true,
      useJSXTextNode: false,
      shouldProvideParserServices: false
    });
    expect(() => instance.convertProgram()).toThrow(
      'Unknown AST_NODE_TYPE: "TSJSDocNullableType"'
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
      shouldProvideParserServices: true
    });
    instance.convertProgram();
    const maps = instance.getASTMaps();

    function checkMaps(child: any) {
      child.forEachChild((node: any) => {
        if (
          node.kind !== ts.SyntaxKind.EndOfFileToken &&
          node.kind !== ts.SyntaxKind.JsxAttributes &&
          node.kind !== ts.SyntaxKind.VariableDeclaration
        ) {
          expect(node).toBe(
            maps.esTreeNodeToTSNodeMap.get(maps.tsNodeToESTreeNodeMap.get(node))
          );
        }
        checkMaps(node);
      });
    }

    expect(ast).toBe(
      maps.esTreeNodeToTSNodeMap.get(maps.tsNodeToESTreeNodeMap.get(ast))
    );
    checkMaps(ast);
  });

  it('nodeMaps should contain jsx nodes', () => {
    const ast = convertCode(`<a.b.c.d.e></a.b.c.d.e>`);

    const instance = new Converter(ast, {
      errorOnUnknownASTType: false,
      useJSXTextNode: false,
      shouldProvideParserServices: true
    });
    instance.convertProgram();
    const maps = instance.getASTMaps();

    function checkMaps(child: any) {
      child.forEachChild((node: any) => {
        if (
          node.kind !== ts.SyntaxKind.EndOfFileToken &&
          node.kind !== ts.SyntaxKind.JsxAttributes
        ) {
          expect(node).toBe(
            maps.esTreeNodeToTSNodeMap.get(maps.tsNodeToESTreeNodeMap.get(node))
          );
        }
        checkMaps(node);
      });
    }

    expect(ast).toBe(
      maps.esTreeNodeToTSNodeMap.get(maps.tsNodeToESTreeNodeMap.get(ast))
    );
    checkMaps(ast);
  });
});
