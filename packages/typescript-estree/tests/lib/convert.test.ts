import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import * as ts from 'typescript';

import type { TSNode } from '../../src';
import type { ConverterOptions } from '../../src/convert';
import { Converter } from '../../src/convert';

describe('convert', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  function convertCode(code: string): ts.SourceFile {
    return ts.createSourceFile(
      'text.ts',
      code,
      ts.ScriptTarget.ESNext,
      true,
      ts.ScriptKind.TSX,
    );
  }

  /* eslint-disable @typescript-eslint/dot-notation */
  describe('deeplyCopy', () => {
    it('should convert node correctly', () => {
      const ast = convertCode('type foo = ?foo<T> | ?(() => void)?');

      function fakeUnknownKind(node: ts.Node): void {
        ts.forEachChild(node, fakeUnknownKind);
        // @ts-expect-error -- intentionally writing to a readonly field
        // eslint-disable-next-line deprecation/deprecation, @typescript-eslint/no-unused-expressions
        node.kind = ts.SyntaxKind.UnparsedPrologue;
      }

      ts.forEachChild(ast, fakeUnknownKind);

      const instance = new Converter(ast);
      expect(instance.convertProgram()).toMatchSnapshot();
    });

    it('should convert node with decorators correctly', () => {
      const ast = convertCode('@test class foo {}');

      const instance = new Converter(ast);

      expect(
        instance['deeplyCopy'](ast.statements[0] as ts.ClassDeclaration),
      ).toMatchSnapshot();
    });

    it('should convert node with type parameters correctly', () => {
      const ast = convertCode('class foo<T> {}');

      const instance = new Converter(ast);

      expect(
        instance['deeplyCopy'](ast.statements[0] as ts.ClassDeclaration),
      ).toMatchSnapshot();
    });

    it('should convert node with type arguments correctly', () => {
      const ast = convertCode('new foo<T>()');

      const instance = new Converter(ast);

      expect(
        instance['deeplyCopy'](
          (ast.statements[0] as ts.ExpressionStatement)
            .expression as ts.NewExpression,
        ),
      ).toMatchSnapshot();
    });

    it('should convert array of nodes', () => {
      const ast = convertCode('new foo<T>()');

      const instance = new Converter(ast);
      expect(instance['deeplyCopy'](ast)).toMatchSnapshot();
    });

    it('should fail on unknown node', () => {
      const ast = convertCode('type foo = ?foo<T> | ?(() => void)?');

      const instance = new Converter(ast, {
        errorOnUnknownASTType: true,
      });

      expect(() => instance['deeplyCopy'](ast)).toThrow(
        'Unknown AST_NODE_TYPE: "TSSourceFile"',
      );
    });
  });
  /* eslint-enable @typescript-eslint/dot-notation */

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

    function checkMaps(child: ts.Node | ts.SourceFile): void {
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

    function checkMaps(child: ts.Node | ts.SourceFile): void {
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

    function checkMaps(child: ts.Node | ts.SourceFile): void {
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

  /* eslint-disable @typescript-eslint/dot-notation */
  describe('createNode', () => {
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
  });
  /* eslint-enable @typescript-eslint/dot-notation */

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

  describe('allowInvalidAST', () => {
    const code = 'const;';

    it(`throws an error for an invalid AST when allowInvalidAST is false`, () => {
      const ast = convertCode(code);

      const instance = new Converter(ast);

      expect(() => instance.convertProgram()).toThrow(
        'A variable declaration list must have at least one variable declarator.',
      );
    });

    it(`does not throw an error for an invalid AST when allowInvalidAST is true`, () => {
      const ast = convertCode(code);

      const instance = new Converter(ast, {
        allowInvalidAST: true,
      });

      expect(() => instance.convertProgram()).not.toThrow();
    });
  });

  describe('suppressDeprecatedPropertyWarnings', () => {
    const makeNodeGetter =
      <S extends ts.Statement, T extends TSESTree.Node>(
        code: string,
        tsToEsNode: (statement: S) => TSNode,
      ) =>
      (converterOptions?: ConverterOptions): T => {
        const ast = convertCode(code);
        const instance = new Converter(ast, {
          shouldPreserveNodeMaps: true,
          ...converterOptions,
        });

        instance.convertProgram();

        return instance
          .getASTMaps()
          .tsNodeToESTreeNodeMap.get(tsToEsNode(ast.statements[0] as S));
      };

    const getEsTsEnumDeclaration = makeNodeGetter<
      ts.EnumDeclaration,
      TSESTree.TSEnumDeclaration
    >('enum Enum { A }', enumDeclaration => enumDeclaration);

    const getEsTsMappedType = makeNodeGetter<
      ts.TypeAliasDeclaration,
      TSESTree.TSMappedType
    >(
      'type MappedType = { [Key in Type]: Value };',
      ({ type }) => type as ts.MappedTypeNode,
    );

    it('warns on a deprecated aliased property access when suppressDeprecatedPropertyWarnings is false', () => {
      const emitWarning = jest
        .spyOn(process, 'emitWarning')
        .mockImplementation();
      const esTsEnumDeclaration = getEsTsEnumDeclaration({
        suppressDeprecatedPropertyWarnings: false,
      });

      // eslint-disable-next-line deprecation/deprecation, @typescript-eslint/no-unused-expressions
      esTsEnumDeclaration.members;

      expect(emitWarning).toHaveBeenCalledWith(
        `The 'members' property is deprecated on TSEnumDeclaration nodes. Use 'body.members' instead. See https://typescript-eslint.io/linting/troubleshooting#the-key-property-is-deprecated-on-type-nodes-use-key-instead-warnings.`,
        'DeprecationWarning',
      );
    });

    it('does not warn on a subsequent deprecated aliased property access when suppressDeprecatedPropertyWarnings is false', () => {
      const emitWarning = jest
        .spyOn(process, 'emitWarning')
        .mockImplementation();
      const esTsEnumDeclaration = getEsTsEnumDeclaration({
        suppressDeprecatedPropertyWarnings: false,
      });

      /* eslint-disable deprecation/deprecation, @typescript-eslint/no-unused-expressions */
      esTsEnumDeclaration.members;
      esTsEnumDeclaration.members;
      /* eslint-enable deprecation/deprecation, @typescript-eslint/no-unused-expressions */

      expect(emitWarning).toHaveBeenCalledTimes(1);
    });

    it('does not warn on a deprecated aliased property access when suppressDeprecatedPropertyWarnings is true', () => {
      const emitWarning = jest
        .spyOn(process, 'emitWarning')
        .mockImplementation();
      const esTsEnumDeclaration = getEsTsEnumDeclaration({
        suppressDeprecatedPropertyWarnings: true,
      });

      // eslint-disable-next-line deprecation/deprecation, @typescript-eslint/no-unused-expressions
      esTsEnumDeclaration.members;

      expect(emitWarning).not.toHaveBeenCalled();
    });

    it('does not allow enumeration of deprecated aliased properties', () => {
      const esTsEnumDeclaration = getEsTsEnumDeclaration();

      expect(Object.keys(esTsEnumDeclaration)).not.toContain('members');
    });

    it('allows writing to the deprecated aliased property as a new enumerable value', () => {
      const esTsEnumDeclaration = getEsTsEnumDeclaration();

      // eslint-disable-next-line deprecation/deprecation, @typescript-eslint/no-unused-expressions
      esTsEnumDeclaration.members = [];

      // eslint-disable-next-line deprecation/deprecation, @typescript-eslint/no-unused-expressions
      expect(esTsEnumDeclaration.members).toEqual([]);
      expect(Object.keys(esTsEnumDeclaration)).toContain('members');
    });

    it('warns on a deprecated getter property access when suppressDeprecatedPropertyWarnings is false', () => {
      const emitWarning = jest
        .spyOn(process, 'emitWarning')
        .mockImplementation();
      const tsMappedType = getEsTsMappedType({
        suppressDeprecatedPropertyWarnings: false,
      });

      // eslint-disable-next-line deprecation/deprecation, @typescript-eslint/no-unused-expressions
      tsMappedType.typeParameter;

      expect(emitWarning).toHaveBeenCalledWith(
        `The 'typeParameter' property is deprecated on TSMappedType nodes. Use 'constraint' and 'key' instead. See https://typescript-eslint.io/linting/troubleshooting#the-key-property-is-deprecated-on-type-nodes-use-key-instead-warnings.`,
        'DeprecationWarning',
      );
    });

    it('does not warn on a subsequent deprecated getter property access when suppressDeprecatedPropertyWarnings is false', () => {
      const emitWarning = jest
        .spyOn(process, 'emitWarning')
        .mockImplementation();
      const tsMappedType = getEsTsMappedType({
        suppressDeprecatedPropertyWarnings: false,
      });

      /* eslint-disable deprecation/deprecation, @typescript-eslint/no-unused-expressions */
      tsMappedType.typeParameter;
      tsMappedType.typeParameter;
      /* eslint-enable deprecation/deprecation, @typescript-eslint/no-unused-expressions */

      expect(emitWarning).toHaveBeenCalledTimes(1);
    });

    it('does not warn on a deprecated getter property access when suppressDeprecatedPropertyWarnings is true', () => {
      const emitWarning = jest
        .spyOn(process, 'emitWarning')
        .mockImplementation();
      const tsMappedType = getEsTsMappedType({
        suppressDeprecatedPropertyWarnings: true,
      });

      // eslint-disable-next-line deprecation/deprecation, @typescript-eslint/no-unused-expressions
      tsMappedType.typeParameter;

      expect(emitWarning).not.toHaveBeenCalled();
    });

    it('does not allow enumeration of deprecated getter properties', () => {
      const tsMappedType = getEsTsMappedType();

      expect(Object.keys(tsMappedType)).not.toContain('typeParameter');
    });

    it('allows writing to the deprecated getter property as a new enumerable value', () => {
      const tsMappedType = getEsTsMappedType();

      // eslint-disable-next-line deprecation/deprecation, @typescript-eslint/no-unused-expressions
      tsMappedType.typeParameter = undefined!;

      // eslint-disable-next-line deprecation/deprecation, @typescript-eslint/no-unused-expressions
      expect(tsMappedType.typeParameter).toBeUndefined();
      expect(Object.keys(tsMappedType)).toContain('typeParameter');
    });
  });
});
