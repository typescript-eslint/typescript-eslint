import * as ts from 'typescript';

function getCanonicalPackageName(packageName: string): string {
  if (!packageName.startsWith('@types/')) {
    return packageName;
  }

  const typesPackageName = packageName.slice('@types/'.length);
  const scopeSeparatorIndex = typesPackageName.indexOf('__');
  if (scopeSeparatorIndex === -1) {
    return typesPackageName;
  }

  return `@${typesPackageName.slice(0, scopeSeparatorIndex)}/${typesPackageName.slice(scopeSeparatorIndex + 2)}`;
}

function packageNameMatches(
  expectedPackageName: string,
  actualPackageName: string,
): boolean {
  const canonicalPackageName = getCanonicalPackageName(actualPackageName);
  return (
    canonicalPackageName === expectedPackageName ||
    canonicalPackageName.startsWith(`${expectedPackageName}/`)
  );
}

function findParentModuleDeclaration(
  node: ts.Node,
): ts.ModuleDeclaration | undefined {
  switch (node.kind) {
    case ts.SyntaxKind.ModuleDeclaration:
      // "namespace x {...}" should be ignored here
      if (node.flags & ts.NodeFlags.Namespace) {
        break;
      }
      return ts.isStringLiteral((node as ts.ModuleDeclaration).name)
        ? (node as ts.ModuleDeclaration)
        : undefined;
    case ts.SyntaxKind.SourceFile:
      return undefined;
  }
  return findParentModuleDeclaration(node.parent);
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
  return declarationFiles.some(declaration => {
    const packageIdName = program.sourceFileToPackageName.get(declaration.path);
    return (
      packageIdName != null &&
      packageNameMatches(packageName, packageIdName) &&
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
