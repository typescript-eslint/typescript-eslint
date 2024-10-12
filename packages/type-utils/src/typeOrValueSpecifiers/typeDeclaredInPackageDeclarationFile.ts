import console from 'node:console';
import path from 'node:path';

import { getCanonicalFileName } from '@typescript-eslint/typescript-estree';
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
  // Handle scoped packages: if the name starts with @, remove it and replace / with __
  const typesPackageName = packageName.replace(/^@([^/]+)\//, '$1__');

  const packageNameMatcher = new RegExp(`${packageName}|${typesPackageName}`);
  console.log(
    program.getCompilerOptions().typeRoots ?? ['node_modules'],
    getCanonicalFileName(
      path.join(program.getCurrentDirectory(), relativePath),
    ),
  );
  const fileNameMatcher = new RegExp(
    `node_modules/(?:${packageName}|@types/${typesPackageName})/`,
  );
  return declarationFiles.some(declaration => {
    const packageIdName = program.sourceFileToPackageName.get(declaration.path);
    return (
      (packageIdName == null
        ? fileNameMatcher.test(declaration.fileName)
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
