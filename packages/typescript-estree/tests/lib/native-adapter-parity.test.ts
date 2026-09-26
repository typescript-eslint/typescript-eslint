import type { TSESTree } from '@typescript-eslint/types';

import path from 'node:path';
import * as ts from 'typescript';

import type { ParserServicesWithTypeInformation } from '../../src/index.js';

import { parseAndGenerateServices } from '../../src/index.js';
import {
  isolateNativeBackend,
  nativeFilePath,
  nativeFixtures,
  nativePath,
} from './nativeTestUtils';

isolateNativeBackend();

interface QueryContext {
  ast: TSESTree.Program;
  checker: ts.TypeChecker;
  program: ts.Program;
  services: ParserServicesWithTypeInformation;
  sourceFile: ts.SourceFile;
  tsNode: (node: TSESTree.Node) => ts.Node;
}

function parse(code: string, native: boolean, filePath = nativeFilePath) {
  const { ast, services } = parseAndGenerateServices(code, {
    filePath,
    projectService: native ? { EXPERIMENTAL_backend: 'native' } : true,
  });
  assert.isNotNull(services.program);
  return {
    ast,
    checker: services.program.getTypeChecker(),
    program: services.program,
    services,
    sourceFile: services.esTreeNodeToTSNodeMap.get(ast),
    tsNode: (node: TSESTree.Node) => services.esTreeNodeToTSNodeMap.get(node),
  };
}

function onBothBackends<T>(
  code: string,
  query: (context: QueryContext) => T,
  filePath = nativeFilePath,
): { classic: T; native: T } {
  return {
    classic: query(parse(code, false, filePath)),
    native: query(parse(code, true, filePath)),
  };
}

function declarationOf(ast: TSESTree.Program, index: number) {
  return (ast.body[index] as TSESTree.VariableDeclaration).declarations[0];
}

describe('native adapter parity', () => {
  it('answers intrinsic types', () => {
    const { classic, native } = onBothBackends('export {};', ({ checker }) =>
      [
        checker.getAnyType(),
        checker.getBigIntType(),
        checker.getBooleanType(),
        checker.getESSymbolType(),
        checker.getNeverType(),
        checker.getNullType(),
        checker.getUndefinedType(),
        checker.getUnknownType(),
        checker.getVoidType(),
      ].map(type => checker.typeToString(type)),
    );

    expect(native).toEqual(classic);
  });

  it('answers constant values', () => {
    const { classic, native } = onBothBackends(
      'enum Enum { A = 3 }',
      ({ ast, checker, tsNode }) =>
        checker.getConstantValue(
          tsNode(
            (ast.body[0] as TSESTree.TSEnumDeclaration).body.members[0],
          ) as ts.EnumMember,
        ),
    );

    expect(native).toBe(3);
    expect(native).toBe(classic);
  });

  it('answers module exports and aliases', () => {
    const { classic, native } = onBothBackends(
      [
        "import * as dependencyModule from './dependency';",
        "import { dependency } from './dependency';",
        'export { dependency as renamed };',
        'export const local = dependencyModule;',
      ].join('\n'),
      ({ ast, checker, tsNode }) => {
        const [namespaceImport, namedImport, reexport] = ast.body as [
          TSESTree.ImportDeclaration,
          TSESTree.ImportDeclaration,
          TSESTree.ExportNamedDeclaration,
        ];
        const moduleSymbol = checker.getSymbolAtLocation(
          tsNode(namespaceImport.source),
        )!;
        const exports = checker.getExportsOfModule(moduleSymbol);
        const alias = checker.getSymbolAtLocation(
          tsNode(namedImport.specifiers[0].local),
        )!;

        return {
          aliased: checker.getImmediateAliasedSymbol(alias)?.name,
          exports: exports.map(symbol => symbol.name),
          localTarget: checker.getExportSpecifierLocalTargetSymbol(
            tsNode(reexport.specifiers[0]) as ts.ExportSpecifier,
          )?.name,
          qualifiedName: checker
            .getFullyQualifiedName(exports[0])
            .split('.')
            .at(-1),
        };
      },
    );

    expect(native).toEqual(classic);
  });

  it('answers non-nullable types', () => {
    const { classic, native } = onBothBackends(
      'declare const value: string | undefined;',
      ({ ast, checker, tsNode }) =>
        checker.typeToString(
          checker.getNonNullableType(
            checker.getTypeAtLocation(tsNode(declarationOf(ast, 0).id)),
          ),
        ),
    );

    expect(native).toBe('string');
    expect(native).toBe(classic);
  });

  it('answers special symbols and names in scope', () => {
    const { classic, native } = onBothBackends(
      'function f() {\n  return [arguments, undefined];\n}',
      ({ ast, checker, tsNode }) => {
        const returned = (
          (ast.body[0] as TSESTree.FunctionDeclaration).body
            .body[0] as TSESTree.ReturnStatement
        ).argument as TSESTree.ArrayExpression;
        const [argumentsSymbol, undefinedSymbol] = returned.elements.map(
          element => checker.getSymbolAtLocation(tsNode(element!))!,
        );

        return {
          isArguments: checker.isArgumentsSymbol(argumentsSymbol),
          isUndefined: checker.isUndefinedSymbol(undefinedSymbol),
          isUnknown: checker.isUnknownSymbol(argumentsSymbol),
          resolved: checker.resolveName(
            'Promise',
            tsNode(returned),
            ts.SymbolFlags.Type,
            false,
          )?.name,
        };
      },
    );

    expect(native).toEqual({
      isArguments: true,
      isUndefined: true,
      isUnknown: false,
      resolved: 'Promise',
    });
    expect(native).toEqual(classic);
  });

  it('answers signature declarations and type nodes', () => {
    const { classic, native } = onBothBackends(
      'declare function f(a: string, b?: number): boolean;',
      ({ ast, checker, tsNode }) => {
        const declaration = tsNode(ast.body[0]) as ts.FunctionDeclaration;
        const signature = checker.getSignatureFromDeclaration(declaration)!;
        const signatureDeclaration = checker.signatureToSignatureDeclaration(
          signature,
          ts.SyntaxKind.FunctionType,
          undefined,
          undefined,
        )!;
        const typeNode = checker.typeToTypeNode(
          checker.getTypeAtLocation(declaration.name!),
          undefined,
          undefined,
        )!;

        return {
          parameters: signatureDeclaration.parameters.length,
          signatureKind: ts.SyntaxKind[signatureDeclaration.kind],
          typeNodeKind: ts.SyntaxKind[typeNode.kind],
        };
      },
    );

    expect(native).toEqual(classic);
  });

  it('answers program diagnostics and files', () => {
    const { classic, native } = onBothBackends(
      "import { dependency } from './dependency';\nconst value: string = dependency;",
      ({ program, sourceFile }) => ({
        configFileParsing: program.getConfigFileParsingDiagnostics().length,
        declaration: program.getDeclarationDiagnostics(sourceFile).length,
        external: program.isSourceFileFromExternalLibrary(sourceFile),
        global: program.getGlobalDiagnostics().length,
        hasDependency: program
          .getSourceFiles()
          .some(file => file.fileName.endsWith('dependency.ts')),
        library: program.isSourceFileDefaultLibrary(sourceFile),
        roots: program
          .getRootFileNames()
          .map(fileName => path.basename(fileName))
          .sort(),
        semantic: program
          .getSemanticDiagnostics(sourceFile)
          .map(diagnostic => diagnostic.code),
        syntactic: program.getSyntacticDiagnostics(sourceFile).length,
      }),
    );

    expect(native.semantic).toEqual([2322]);
    expect(native).toEqual(classic);
  });

  it('answers resolution modes', () => {
    const { classic, native } = onBothBackends(
      "import { dependency } from './dependency';\nexport { dependency };",
      ({ ast, program, sourceFile, tsNode }) => ({
        atIndex: program.getModeForResolutionAtIndex(sourceFile, 0),
        usage: program.getModeForUsageLocation(
          sourceFile,
          tsNode(
            (ast.body[0] as TSESTree.ImportDeclaration).source,
          ) as ts.StringLiteral,
        ),
      }),
    );

    expect(native).toEqual(classic);
  });

  it('answers type members', () => {
    const { classic, native } = onBothBackends(
      [
        'function withDefault<T = string>(value?: T) { return value; }',
        'class Box {}',
        'declare const box: Box;',
        "declare const literal: 'text';",
      ].join('\n'),
      ({ ast, checker, tsNode }) => {
        const typeParameter = checker.getTypeAtLocation(
          tsNode(
            (ast.body[0] as TSESTree.FunctionDeclaration).typeParameters!
              .params[0],
          ),
        );

        return {
          apparentProperties: checker
            .getTypeAtLocation(tsNode(declarationOf(ast, 3).id))
            .getApparentProperties().length,
          default: checker.typeToString(typeParameter.getDefault()!),
          isClass: checker
            .getTypeAtLocation(tsNode(declarationOf(ast, 2).id))
            .isClass(),
        };
      },
    );

    expect(native).toEqual(classic);
  });

  it('answers symbol and signature documentation', () => {
    const { classic, native } = onBothBackends(
      [
        '/**',
        ' * Adds one.',
        ' * @deprecated Use add instead.',
        ' */',
        'export function increment(value: number) {',
        '  return value + 1;',
        '}',
      ].join('\n'),
      ({ ast, checker, tsNode }) => {
        const declaration = tsNode(
          (ast.body[0] as TSESTree.ExportNamedDeclaration).declaration!,
        ) as ts.FunctionDeclaration;
        const symbol = checker.getSymbolAtLocation(declaration.name!)!;
        const tags = (tagInfos: ts.JSDocTagInfo[]) =>
          tagInfos.map(tag => [tag.name, ts.displayPartsToString(tag.text)]);

        return {
          documentation: ts.displayPartsToString(
            symbol.getDocumentationComment(checker),
          ),
          isFunction: (symbol.getFlags() & ts.SymbolFlags.Function) !== 0,
          signatureTags: tags(
            checker.getSignatureFromDeclaration(declaration)!.getJsDocTags(),
          ),
          symbolTags: tags(symbol.getJsDocTags(checker)),
        };
      },
    );

    expect(native).toEqual(classic);
  });

  it('answers signature parameter types', () => {
    const { classic, native } = onBothBackends(
      'declare function first<T>(values: T[]): T;',
      ({ ast, checker, tsNode }) =>
        checker.typeToString(
          checker
            .getSignatureFromDeclaration(
              tsNode(ast.body[0]) as ts.FunctionDeclaration,
            )!
            .getTypeParameterAtPosition(0),
        ),
    );

    expect(native).toBe(classic);
  });

  it('answers node children and text', () => {
    const { classic, native } = onBothBackends(
      '// leading\nconst value = [1, 2];',
      ({ ast, sourceFile, tsNode }) => {
        const statement = tsNode(ast.body[0]);
        let arrays = 0;
        let children = 0;
        sourceFile.forEachChild(
          () => {
            children++;
          },
          () => {
            arrays++;
          },
        );

        return {
          arrays,
          childCount: statement.getChildCount(sourceFile),
          children,
          fullText: statement.getFullText(sourceFile),
          lastToken: ts.SyntaxKind[statement.getLastToken(sourceFile)!.kind],
          leadingTriviaWidth: statement.getLeadingTriviaWidth(sourceFile),
        };
      },
    );

    expect(native).toEqual(classic);
  });

  it('answers a JSX closing tag’s first token as classic splits it', () => {
    const { classic, native } = onBothBackends(
      'const element = <div></div>;',
      ({ ast, sourceFile, tsNode }) => {
        const element = declarationOf(ast, 0).init as TSESTree.JSXElement;
        const closing = tsNode(element.closingElement!);

        return ts.SyntaxKind[closing.getFirstToken(sourceFile)!.kind];
      },
      nativePath(nativeFixtures, 'component.tsx'),
    );

    expect(native).toBe(classic);
  });

  it('refuses classic objects in native queries', () => {
    const classic = parse('declare const value: string;', false);
    const native = parse('declare const value: string;', true);
    const classicNode = classic.tsNode(declarationOf(classic.ast, 0).id);

    expect(() =>
      native.checker.typeToString(
        classic.checker.getTypeAtLocation(classicNode),
      ),
    ).toThrow('cannot be mixed');
    expect(() => native.checker.getTypeAtLocation(classicNode)).toThrow(
      'not created by this native node adapter',
    );
  });
});
