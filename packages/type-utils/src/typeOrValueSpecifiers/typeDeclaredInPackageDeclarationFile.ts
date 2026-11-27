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

function resolveExportedSymbol(
  exportedSymbol: ts.Symbol,
  checker: ts.TypeChecker,
): ts.Symbol {
  return tsutils.isSymbolFlagSet(exportedSymbol, ts.SymbolFlags.Alias)
    ? checker.getAliasedSymbol(exportedSymbol)
    : exportedSymbol;
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

  const moduleSymbol = checker.resolveName(
    `"${packageName}"`,
    undefined,
    ts.SymbolFlags.ValueModule,
    false,
  );

  if (!moduleSymbol) {
    return false;
  }

  return checker
    .getExportsOfModule(moduleSymbol)
    .some(
      exportedSymbol =>
        resolveExportedSymbol(exportedSymbol, checker) === symbol,
    );
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

function typeDeclaredInDeclarationFile(
  packageName: string,
  declarationFiles: ts.SourceFile[],
  program: ts.Program,
): boolean {
  return declarationFiles.some(declaration => {
    if (!program.isSourceFileFromExternalLibrary(declaration)) {
      return false;
    }

    // A package id name is a path within the package, such as
    // `typescript/lib/typescript.d.ts` or `@types/semver/classes/semver.d.ts`.
    const packageIdName =
      program.sourceFileToPackageName.get(declaration.path) ??
      resolvePackageIdName(declaration.fileName);

    return (
      packageIdName != null &&
      packageIdMatchesSpecifier(packageIdName, packageName)
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

const packageExportSymbolsCache = new WeakMap<
  ts.Program,
  Map<string, ReadonlySet<ts.Symbol>>
>();

const RESOLUTION_MODES: ts.ResolutionMode[] = [
  ts.ModuleKind.ESNext,
  ts.ModuleKind.CommonJS,
];

const EMPTY_SYMBOL_SET: ReadonlySet<ts.Symbol> = new Set();

function collectResolvedExports(
  moduleSymbols: readonly ts.Symbol[],
  checker: ts.TypeChecker,
): Set<ts.Symbol> {
  const exports = new Set<ts.Symbol>();

  for (const moduleSymbol of moduleSymbols) {
    for (const exportedSymbol of checker.getExportsOfModule(moduleSymbol)) {
      exports.add(resolveExportedSymbol(exportedSymbol, checker));
    }
  }

  return exports;
}

function getExternalSourceFilesForPackage(
  packageName: string,
  program: ts.Program,
): ts.SourceFile[] {
  return program.getSourceFiles().filter(sourceFile => {
    if (!program.isSourceFileFromExternalLibrary(sourceFile)) {
      return false;
    }

    const packageIdName =
      program.sourceFileToPackageName.get(sourceFile.path) ??
      resolvePackageIdName(sourceFile.fileName);
    return (
      packageIdName != null &&
      packageIdMatchesSpecifier(packageIdName, packageName)
    );
  });
}

interface PackageEntryResolution {
  moduleSymbols: readonly ts.Symbol[];
  /**
   * True when `resolveModuleName` found an external library entry for the
   * package, even if that file is not loaded into the program.
   */
  resolved: boolean;
}

function getPackageEntryResolution(
  packageName: string,
  program: ts.Program,
): PackageEntryResolution {
  // typescript doesn't provide a ts.sys implementation for browser environments
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ts.sys == null) {
    return { moduleSymbols: [], resolved: false };
  }

  const rootFileNames = program.getRootFileNames();
  if (rootFileNames.length === 0) {
    return { moduleSymbols: [], resolved: false };
  }

  const checker = program.getTypeChecker();
  const compilerOptions = program.getCompilerOptions();
  const moduleSymbols: ts.Symbol[] = [];
  const seen = new Set<ts.Symbol>();
  let resolved = false;

  for (const containingFile of rootFileNames) {
    for (const mode of RESOLUTION_MODES) {
      const { resolvedModule } = ts.resolveModuleName(
        packageName,
        containingFile,
        compilerOptions,
        ts.sys,
        undefined,
        undefined,
        mode,
      );

      if (!resolvedModule?.isExternalLibraryImport) {
        continue;
      }

      resolved = true;

      const entryFile = program.getSourceFile(resolvedModule.resolvedFileName);
      const moduleSymbol =
        entryFile != null ? checker.getSymbolAtLocation(entryFile) : undefined;

      if (moduleSymbol != null && !seen.has(moduleSymbol)) {
        seen.add(moduleSymbol);
        moduleSymbols.push(moduleSymbol);
      }
    }
  }

  return { moduleSymbols, resolved };
}

/**
 * Public exports of `packageName`: prefer the resolved package entry
 * (including `exports`-mapped subpaths). Only if resolution fails entirely,
 * fall back to package files already in the program.
 */
function getPackageExportSymbols(
  packageName: string,
  program: ts.Program,
): ReadonlySet<ts.Symbol> {
  let packageCache = packageExportSymbolsCache.get(program);
  if (packageCache == null) {
    packageCache = new Map();
    packageExportSymbolsCache.set(program, packageCache);
  }

  const cached = packageCache.get(packageName);
  if (cached != null) {
    return cached;
  }

  const checker = program.getTypeChecker();
  const { moduleSymbols, resolved } = getPackageEntryResolution(
    packageName,
    program,
  );

  let exports: ReadonlySet<ts.Symbol>;
  if (moduleSymbols.length > 0) {
    exports = collectResolvedExports(moduleSymbols, checker);
  } else if (resolved) {
    // Entry resolved but isn't in the program — don't treat internal package
    // files as the public API.
    exports = EMPTY_SYMBOL_SET;
  } else {
    const fallbackModuleSymbols = getExternalSourceFilesForPackage(
      packageName,
      program,
    )
      .map(sourceFile => checker.getSymbolAtLocation(sourceFile))
      .filter(symbol => symbol != null);

    exports = collectResolvedExports(fallbackModuleSymbols, checker);
  }

  packageCache.set(packageName, exports);
  return exports;
}

function typeReExportedFromPackage(
  packageName: string,
  symbol: ts.Symbol | undefined,
  program: ts.Program,
): boolean {
  return (
    symbol != null && getPackageExportSymbols(packageName, program).has(symbol)
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
    typeReExportedFromPackage(packageName, symbol, program)
  );
}
