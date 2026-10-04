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

const reExportSourceFilesCache = new WeakMap<
  ts.Program,
  Map<string, ts.SourceFile[]>
>();

function packageIdMatchesSpecifier(
  packageIdName: string,
  packageName: string,
): boolean {
  const typesPackageName = packageName.replace(/^@([^/]+)\//, '$1__');

  return (
    pathIsInPackage(packageIdName, packageName) ||
    pathIsInPackage(packageIdName.replace(/^@types\//, ''), typesPackageName)
  );
}

function getExternalSourceFilesForPackage(
  packageName: string,
  program: ts.Program,
): ts.SourceFile[] {
  let packageCache = reExportSourceFilesCache.get(program);
  if (packageCache == null) {
    packageCache = new Map();
    reExportSourceFilesCache.set(program, packageCache);
  }

  const cached = packageCache.get(packageName);
  if (cached != null) {
    return cached;
  }

  const sourceFiles = program.getSourceFiles().filter(sourceFile => {
    if (!program.isSourceFileFromExternalLibrary(sourceFile)) {
      return false;
    }

    const packageIdName = program.sourceFileToPackageName.get(sourceFile.path);
    return (
      packageIdName != null &&
      packageIdMatchesSpecifier(packageIdName, packageName)
    );
  });

  packageCache.set(packageName, sourceFiles);
  return sourceFiles;
}

function symbolDeclaresOneOf(
  symbol: ts.Symbol,
  declarations: readonly ts.Node[],
): boolean {
  return (
    symbol
      .getDeclarations()
      ?.some(declaration => declarations.includes(declaration)) ?? false
  );
}

function namedExportMatchesDeclarations(
  exportSpecifier: ts.ExportSpecifier,
  declarations: readonly ts.Node[],
  checker: ts.TypeChecker,
): boolean {
  const localSymbol = checker.getSymbolAtLocation(exportSpecifier.name);
  if (localSymbol == null) {
    return false;
  }

  return symbolDeclaresOneOf(
    checker.getAliasedSymbol(localSymbol),
    declarations,
  );
}

function typeReExportedFromPackage(
  packageName: string,
  declarations: readonly ts.Node[],
  program: ts.Program,
): boolean {
  const checker = program.getTypeChecker();

  return getExternalSourceFilesForPackage(packageName, program).some(
    sourceFile =>
      sourceFile.statements.some(statement => {
        if (!ts.isExportDeclaration(statement)) {
          return false;
        }

        const { exportClause } = statement;
        if (exportClause == null || !ts.isNamedExports(exportClause)) {
          return false;
        }

        return exportClause.elements.some(exportSpecifier =>
          namedExportMatchesDeclarations(
            exportSpecifier,
            declarations,
            checker,
          ),
        );
      }),
  );
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
    typeExportedFromDeclareModule(packageName, symbol, program) ||
    typeReExportedFromPackage(packageName, declarations, program)
  );
}
