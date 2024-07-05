import * as ts from 'typescript';

function findParentModuleDeclaration(
  node: ts.Node,
): ts.ModuleDeclaration | undefined {
  switch (node.kind) {
    case ts.SyntaxKind.ModuleDeclaration:
      return node as ts.ModuleDeclaration;
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

  const matcher = new RegExp(`${packageName}|${typesPackageName}`);
  return declarationFiles.some(declaration => {
    const packageIdName = program.sourceFileToPackageName.get(declaration.path);
    return (
      packageIdName !== undefined &&
      matcher.test(packageIdName) &&
      program.isSourceFileFromExternalLibrary(declaration)
    );
  });
}

export function typeDeclaredInPackage(
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
