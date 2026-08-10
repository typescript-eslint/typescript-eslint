import * as ts from 'typescript';

function packageNameMatches(
  configuredPackageName: string,
  declaredPackageName: string,
): boolean {
  const typesPackageName = declaredPackageName.startsWith('@types/')
    ? declaredPackageName.slice('@types/'.length)
    : undefined;
  const scopeSeparatorIndex = typesPackageName?.indexOf('__') ?? -1;
  const normalizedDeclaredPackageName =
    typesPackageName == null
      ? declaredPackageName
      : scopeSeparatorIndex === -1
        ? typesPackageName
        : `@${typesPackageName.slice(0, scopeSeparatorIndex)}/${typesPackageName.slice(scopeSeparatorIndex + 2)}`;

  return (
    normalizedDeclaredPackageName === configuredPackageName ||
    normalizedDeclaredPackageName.startsWith(`${configuredPackageName}/`)
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
  return declarations.some(declaration => {
    const moduleName = findParentModuleDeclaration(declaration)?.name.text;

    return moduleName != null && packageNameMatches(packageName, moduleName);
  });
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
