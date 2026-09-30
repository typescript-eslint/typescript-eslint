import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

function findParentModuleDeclaration(
  node: ts.Node,
): ts.ModuleDeclaration | undefined {
  switch (node.kind) {
    case ts.SyntaxKind.ModuleDeclaration:
      // "namespace x {...}" and "global {...}" should be ignored here
      if (
        node.flags &
        (ts.NodeFlags.Namespace | ts.NodeFlags.GlobalAugmentation)
      ) {
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

function typeExportedFromDeclareModule(
  packageName: string,
  symbol: ts.Symbol | undefined,
  program: ts.Program,
): boolean {
  if (!symbol) {
    return false;
  }

  const checker = program.getTypeChecker();

  const moduleSymbol = checker
    .getAmbientModules()
    .find(ambientModule => ambientModule.name === `"${packageName}"`);

  if (!moduleSymbol) {
    return false;
  }

  return checker.getExportsOfModule(moduleSymbol).some(exportedSymbol => {
    const resolvedSymbol = tsutils.isSymbolFlagSet(
      exportedSymbol,
      ts.SymbolFlags.Alias,
    )
      ? checker.getAliasedSymbol(exportedSymbol)
      : exportedSymbol;

    return resolvedSymbol === symbol;
  });
}

/**
 * Whether `packagePath` is `packageName` itself or something inside it, comparing
 * whole path components: `semver` covers `semver` and `semver/classes/semver.d.ts`,
 * but not `semver-compare` or `my-semver`.
 */
function pathIsInPackage(packagePath: string, packageName: string): boolean {
  return (
    packagePath === packageName || packagePath.startsWith(`${packageName}/`)
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
    // A package id name is a path within the package, such as
    // `typescript/lib/typescript.d.ts` or `@types/semver/classes/semver.d.ts`.
    const packageIdName = program.sourceFileToPackageName.get(declaration.path);
    if (packageIdName == null) {
      return false;
    }

    return (
      (pathIsInPackage(packageIdName, packageName) ||
        pathIsInPackage(
          packageIdName.replace(/^@types\//, ''),
          typesPackageName,
        )) &&
      program.isSourceFileFromExternalLibrary(declaration)
    );
  });
}

export function typeDeclaredInPackageDeclarationFile(
  packageName: string,
  symbol: ts.Symbol | undefined,
  declarations: ts.Node[],
  declarationFiles: ts.SourceFile[],
  program: ts.Program,
): boolean {
  return (
    typeDeclaredInDeclareModule(packageName, declarations) ||
    typeDeclaredInDeclarationFile(packageName, declarationFiles, program) ||
    typeExportedFromDeclareModule(packageName, symbol, program)
  );
}
