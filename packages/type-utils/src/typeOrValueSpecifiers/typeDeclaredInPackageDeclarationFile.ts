import path from 'node:path';
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
    if (!program.isSourceFileFromExternalLibrary(declaration)) {
      return false;
    }

    // A package id name is a path within the package, such as
    // `typescript/lib/typescript.d.ts` or `@types/semver/classes/semver.d.ts`.
    const packageIdName =
      program.sourceFileToPackageName.get(declaration.path) ??
      resolvePackageIdName(declaration.fileName);

    if (packageIdName == null) {
      return false;
    }

    return (
      pathIsInPackage(packageIdName, packageName) ||
      pathIsInPackage(packageIdName.replace(/^@types\//, ''), typesPackageName)
    );
  });
}

/**
 * TypeScript's `sourceFileToPackageName` doesn't include (1) files in linked
 * packages (e.g., workspace packages) that are reached through relative
 * imports, rather than by package name, or (2) any files of packages without
 * `version` in their `package.json`.
 *
 * So we're looking for the nearest `package.json` that has a `name` field,
 * starting from the directory of the declaration file, and using that as the
 * package name.
 */
function resolvePackageIdName(fileName: string): string | undefined {
  const packageRoot = findPackageRoot(path.dirname(fileName));

  if (!packageRoot) {
    return undefined;
  }

  const fileRelativeToPackage = fileName.slice(packageRoot.directory.length);

  return `${packageRoot.name}${fileRelativeToPackage}`;
}

interface PackageRoot {
  directory: string;
  name: string;
}

const packageRoots = new Map<string, PackageRoot | undefined>();

function findPackageRoot(directory: string): PackageRoot | undefined {
  if (!packageRoots.has(directory)) {
    const parentDir = path.dirname(directory);
    const packageName = getPackageName(directory);

    const packageRoot = packageName
      ? { directory, name: packageName }
      : parentDir === directory
        ? undefined
        : findPackageRoot(parentDir);

    packageRoots.set(directory, packageRoot);
  }

  return packageRoots.get(directory);
}

function getPackageName(directory: string): string | undefined {
  const result = ts.readConfigFile(
    path.join(directory, 'package.json'),
    ts.sys.readFile,
  );

  const config = result.config as { name?: unknown } | undefined;

  return typeof config?.name === 'string' ? config.name : undefined;
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
