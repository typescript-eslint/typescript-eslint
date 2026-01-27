import * as ts from 'typescript';

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

function normalizeDefinitelyTypedPackageName(name: string): string {
  if (!name.startsWith('@types/')) {
    return name;
  }

  // @types/babel__code-frame -> @babel__code-frame
  const withoutTypesPrefix = name.slice('@types/'.length);

  // @babel__code-frame -> @babel/code-frame
  const match = /^([^_]+)__(.+)$/.exec(withoutTypesPrefix);
  if (match) {
    return `@${match[1]}/${match[2]}`;
  }

  return withoutTypesPrefix;
}

function isSameOrSubpathPackage(
  packageIdName: string,
  targetPackageName: string,
): boolean {
  const normalizedPackageIdName =
    normalizeDefinitelyTypedPackageName(packageIdName);

  return (
    normalizedPackageIdName === targetPackageName ||
    normalizedPackageIdName.startsWith(`${targetPackageName}/`)
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
      isSameOrSubpathPackage(packageIdName, packageName) &&
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
