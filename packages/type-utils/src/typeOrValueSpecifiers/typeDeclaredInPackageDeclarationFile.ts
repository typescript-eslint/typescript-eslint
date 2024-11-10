import { getCanonicalFileName } from '@typescript-eslint/typescript-estree';
import path from 'node:path';
import * as ts from 'typescript';

function findParentModuleDeclaration(
  node: ts.Node,
): ts.ModuleDeclaration | undefined {
  switch (node.kind) {
    case ts.SyntaxKind.ModuleDeclaration:
      return ts.isStringLiteral((node as ts.ModuleDeclaration).name)
        ? (node as ts.ModuleDeclaration)
        : undefined;
    case ts.SyntaxKind.SourceFile:
      return undefined;
    default:
      return findParentModuleDeclaration(node.parent);
  }
}

function typeDeclaredInDeclareModule(
  packageName: string,
  declarations: ts.Node[],
): boolean {
  return declarations.some(
    declaration =>
      findParentModuleDeclaration(declaration)?.name.text === packageName,
  );
}

function typeDeclaredInDeclarationFile(
  packageName: string,
  declarationFiles: ts.SourceFile[],
  program: ts.Program,
): boolean {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#escaping
  const escapeAlternates = (alternates: string[]): string =>
    alternates
      .map(alternate => alternate.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

  const packageNameRegExp = escapeAlternates([
    packageName,
    // Handle scoped packages: if the name starts with @, remove it and replace / with __
    `@types/${packageName.replace(/^@([^/]+)\//, '$1__')}`,
  ]);
  const packageNameMatcher = new RegExp(packageNameRegExp);
  const { typeRoots } = program.getCompilerOptions();
  const fileNameMatcher = new RegExp(
    `(?:${escapeAlternates(
      typeRoots
        ? typeRoots.map(typeRoot =>
            getCanonicalFileName(
              path.join(program.getCurrentDirectory(), typeRoot),
            ),
          )
        : ['node_modules'],
    )})/(?:${packageNameRegExp})/`,
  );
  return declarationFiles.some(declaration => {
    const packageIdName = program.sourceFileToPackageName.get(declaration.path);
    return (
      (packageIdName == null
        ? fileNameMatcher.test(getCanonicalFileName(declaration.fileName))
        : packageNameMatcher.test(packageIdName)) &&
      program.isSourceFileFromExternalLibrary(declaration)
    );
  });
}

export function typeDeclaredInPackageDeclarationFile(
  packageName: string,
  declarations: ts.Node[],
  declarationFiles: ts.SourceFile[],
  program: ts.Program,
): boolean {
  return (
    typeDeclaredInDeclareModule(packageName, declarations) ||
    typeDeclaredInDeclarationFile(packageName, declarationFiles, program)
  );
}
