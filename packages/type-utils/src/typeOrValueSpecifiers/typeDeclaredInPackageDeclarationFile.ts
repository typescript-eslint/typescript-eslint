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

  const matcher = new RegExp(`${packageName}|${typesPackageName}`);
  return matcher.test(packageIdName);
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

function symbolHasDeclaration(
  declarations: ts.Node[],
  symbol: ts.Symbol | undefined,
): boolean {
  return (
    symbol
      ?.getDeclarations()
      ?.some(declaration => declarations.includes(declaration)) ?? false
  );
}

function exportSpecifierMatchesDeclaration(
  declarations: ts.Node[],
  checker: ts.TypeChecker,
  specifier: ts.ExportSpecifier,
): boolean {
  const symbol = checker.getSymbolAtLocation(specifier.name);
  const exportedSymbol =
    symbol != null && tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Alias)
      ? checker.getAliasedSymbol(symbol)
      : symbol;

  return symbolHasDeclaration(declarations, exportedSymbol);
}

function typeReExportedFromDeclarationFile(
  packageName: string,
  declarations: ts.Node[],
  program: ts.Program,
): boolean {
  const checker = program.getTypeChecker();

  return program.getSourceFiles().some(sourceFile => {
    if (!program.isSourceFileFromExternalLibrary(sourceFile)) {
      return false;
    }

    const packageIdName = program.sourceFileToPackageName.get(sourceFile.path);
    if (
      packageIdName == null ||
      !packageNameMatches(packageName, packageIdName)
    ) {
      return false;
    }

    return sourceFile.statements.some(
      statement =>
        ts.isExportDeclaration(statement) &&
        statement.exportClause != null &&
        ts.isNamedExports(statement.exportClause) &&
        statement.exportClause.elements.some(specifier =>
          exportSpecifierMatchesDeclaration(declarations, checker, specifier),
        ),
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
    typeDeclaredInDeclarationFile(packageName, declarationFiles, program) ||
    typeReExportedFromDeclarationFile(packageName, declarations, program)
  );
}
