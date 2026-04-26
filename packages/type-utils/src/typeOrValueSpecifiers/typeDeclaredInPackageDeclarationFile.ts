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

/**
 * Extracts the bare package name from a module specifier that may include
 * subpath segments (e.g. `@angular/common/http` → `@angular/common`,
 * `lodash/fp` → `lodash`).
 */
function extractPackageName(moduleSpecifier: string): string {
  if (moduleSpecifier.startsWith('@')) {
    // Scoped package: keep the first two segments.
    return moduleSpecifier.split('/').slice(0, 2).join('/');
  }
  // Unscoped package: keep only the first segment.
  return moduleSpecifier.split('/')[0];
}

/**
 * Derives the package name from the `node_modules` portion of a file path.
 * Returns `undefined` when the path does not contain a `node_modules` segment.
 *
 * This is used alongside `program.sourceFileToPackageName` to cover packages
 * that re-export symbols through dynamically-named internal chunk files
 * (e.g. Angular 19.2.5+ hashed files) where the TS compiler map may lack an
 * entry.
 */
function packageNameFromFilePath(filePath: string): string | undefined {
  const normalized = filePath.replaceAll('\\', '/');
  const marker = '/node_modules/';
  const idx = normalized.lastIndexOf(marker);
  /* v8 ignore next 3 */
  if (idx === -1) {
    return undefined;
  }
  return extractPackageName(normalized.slice(idx + marker.length));
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

    // Consult both TypeScript's own package-name map and the file-system path.
    // Using both covers packages that re-export via dynamically-named internal
    // files (e.g. Angular 19.2.5+ hashed chunks) where the TS map may have no
    // entry for the declaration file.
    const candidateNames = [
      program.sourceFileToPackageName.get(declaration.path),
      packageNameFromFilePath(declaration.path),
    ];

    return candidateNames.some(packageIdName => {
      if (packageIdName == null) {
        return false;
      }
      const extracted = extractPackageName(packageIdName);
      return (
        extracted === packageName ||
        extracted === typesPackageName ||
        extracted === `@types/${typesPackageName}`
      );
    });
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
