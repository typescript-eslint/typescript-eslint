import * as tsutils from 'ts-api-utils';
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
  packageIdName: string,
): boolean {
  // Handle scoped packages: if the name starts with @, remove it and replace / with __
  const typesPackageName = packageName.replace(/^@([^/]+)\//, '$1__');

  return (
    packageIdName.includes(packageName) ||
    packageIdName.includes(typesPackageName)
  );
}

const reExportSourceFilesCache = new WeakMap<
  ts.Program,
  Map<string, ts.SourceFile[]>
>();

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
      packageIdName != null && packageNameMatches(packageName, packageIdName)
    );
  });

  packageCache.set(packageName, sourceFiles);
  return sourceFiles;
}

function typeDeclaredInDeclarationFile(
  packageName: string,
  declarationFiles: ts.SourceFile[],
  program: ts.Program,
): boolean {
  return declarationFiles.some(declaration => {
    const packageIdName = program.sourceFileToPackageName.get(declaration.path);
    if (packageIdName == null) {
      return false;
    }

    if (!packageNameMatches(packageName, packageIdName)) {
      return false;
    }

    return program.isSourceFileFromExternalLibrary(declaration);
  });
}

function symbolHasDeclaration(
  declarations: ts.Node[],
  symbol: ts.Symbol,
): boolean {
  const symbolDeclarations = symbol.getDeclarations();
  /* istanbul ignore if -- defensive for unresolved export specifiers. */
  if (symbolDeclarations == null) {
    return false;
  }

  return symbolDeclarations.some(declaration =>
    declarations.includes(declaration),
  );
}

function exportSpecifierMatchesDeclaration(
  declarations: ts.Node[],
  checker: ts.TypeChecker,
  specifier: ts.ExportSpecifier,
): boolean {
  const symbol = checker.getSymbolAtLocation(specifier.name);
  /* istanbul ignore if -- TypeScript provides symbols for parsed export specifiers. */
  if (symbol == null) {
    return false;
  }

  /* istanbul ignore else -- named export specifiers are aliases; keep a fallback for checker edge cases. */
  if (tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)) {
    const exportedSymbol = checker.getAliasedSymbol(symbol);
    return symbolHasDeclaration(declarations, exportedSymbol);
  }

  return symbolHasDeclaration(declarations, symbol);
}

function typeReExportedFromDeclarationFile(
  packageName: string,
  declarations: ts.Node[],
  program: ts.Program,
): boolean {
  const checker = program.getTypeChecker();

  return getExternalSourceFilesForPackage(packageName, program).some(
    sourceFile =>
      sourceFile.statements.some(statement => {
        if (!ts.isExportDeclaration(statement)) {
          return false;
        }

        if (statement.exportClause == null) {
          return false;
        }

        if (!ts.isNamedExports(statement.exportClause)) {
          return false;
        }

        return statement.exportClause.elements.some(specifier =>
          exportSpecifierMatchesDeclaration(declarations, checker, specifier),
        );
      }),
  );
}

export function typeDeclaredInPackageDeclarationFile(
  packageName: string,
  declarations: ts.Node[],
  declarationFiles: ts.SourceFile[],
  program: ts.Program,
): boolean {
  return (
    typeDeclaredInDeclareModule(packageName, declarations) ||
    typeDeclaredInDeclarationFile(packageName, declarationFiles, program) ||
    typeReExportedFromDeclarationFile(packageName, declarations, program)
  );
}
