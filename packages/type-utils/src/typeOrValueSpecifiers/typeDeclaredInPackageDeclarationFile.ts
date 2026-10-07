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
    // A package id name is a path within the package, such as
    // `typescript/lib/typescript.d.ts` or `@types/semver/classes/semver.d.ts`.
    const packageIdName = getPackageIdName(declaration, program);
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

function getPackageIdName(
  declaration: ts.SourceFile,
  program: ts.Program,
): string | undefined {
  const packageIdName = program.sourceFileToPackageName.get(declaration.path);

  if (packageIdName != null) {
    return packageIdName;
  }

  const packageRoots = getPackageRoots(program);

  let directory = path.posix.dirname(declaration.path);

  while (true) {
    const packageName = packageRoots.get(directory);

    if (packageName != null) {
      const relativeDeclarationPath = declaration.path.slice(directory.length);

      return `${packageName}${relativeDeclarationPath}`;
    }

    const parentDirectory = path.posix.dirname(directory);

    // Reached the file system root without finding a package.
    if (parentDirectory === directory) {
      return undefined;
    }

    directory = parentDirectory;
  }
}

const packageRootsCache = new WeakMap<ts.Program, Map<string, string>>();

/**
 * Map TypeScript's `sourceFileToPackageName` to `package-root-directory -> package-name`.
 *
 * We need this because for linked packages (e.g. workspace dependencies),
 * `sourceFileToPackageName` only includes files that are imported by package
 * name, such as the entry point. Other files in the package are imported with
 * relative paths that point outside `node_modules`, so TypeScript doesn't
 * know which package they belong to.
 *
 * E.g., mapping this:
 *  `/repo/packages/linked-package/dist/index.d.ts -> @org/linked-package/dist/index.d.ts`
 *
 * to this:
 *  `/repo/packages/linked-package -> @org/linked-package`
 *
 * So a file that TypeScript didn't name, such as
 * `/repo/packages/linked-package/dist/types.d.ts`, can be matched to its
 * package root and named `@org/linked-package/dist/types.d.ts`.
 */
function getPackageRoots(program: ts.Program): Map<string, string> {
  let packageRoots = packageRootsCache.get(program);

  if (packageRoots == null) {
    packageRoots = new Map();

    for (const [absPath, packageIdName] of program.sourceFileToPackageName) {
      const packageName = /^(@[^/]+\/)?[^/]+/.exec(packageIdName)?.[0];

      if (packageName == null) {
        continue;
      }

      const subPathLength = packageIdName.length - packageName.length;
      const packagePath = absPath.slice(0, absPath.length - subPathLength);

      packageRoots.set(packagePath, packageName);
    }

    packageRootsCache.set(program, packageRoots);
  }

  return packageRoots;
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
