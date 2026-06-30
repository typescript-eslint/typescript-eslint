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

function packageNameMatches(
  packageName: string,
  typesPackageName: string,
  packageIdName: string,
): boolean {
  // A package id name takes one of two forms:
  //   - `<packageName>/<subpath>` for packages that ship their own types
  //     (e.g. `typescript/lib/typescript.d.ts`), or
  //   - `@types/<typesPackageName>/<subpath>` for `@types` packages
  //     (e.g. `@types/babel__code-frame/index.d.ts`).
  // The package name must match along path-component boundaries, so that
  // (for example) `@angular/common` does not match a specifier for
  // `@angular/common/http` or vice versa.
  const candidate = packageIdName.startsWith('@types/')
    ? packageIdName.slice('@types/'.length)
    : packageIdName;
  return [packageName, typesPackageName].some(
    name => candidate === name || candidate.startsWith(`${name}/`),
  );
}

function typeDeclaredInDeclarationFile(
  packageName: string,
  declarationFiles: ts.SourceFile[],
  program: ts.Program,
): boolean {
  // Handle scoped packages: if the name starts with @, remove it and replace / with __
  const typesPackageName = packageName.replace(/^@([^/]+)\//, '$1__');

  return declarationFiles.some(declaration => {
    const packageIdName = program.sourceFileToPackageName.get(declaration.path);
    return (
      packageIdName != null &&
      packageNameMatches(packageName, typesPackageName, packageIdName) &&
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
