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
 * Extracts just the package name from a module specifier that may include
 * subpath segments (e.g. `@angular/common/http` → `@angular/common`,
 * `lodash/fp` → `lodash`).
 */
function extractPackageName(moduleSpecifier: string): string {
  if (moduleSpecifier.startsWith('@')) {
    const slashIndex = moduleSpecifier.indexOf('/', 1);
    const secondSlash =
      slashIndex !== -1 ? moduleSpecifier.indexOf('/', slashIndex + 1) : -1;
    return secondSlash !== -1
      ? moduleSpecifier.slice(0, secondSlash)
      : moduleSpecifier;
  }
  const slashIndex = moduleSpecifier.indexOf('/');
  return slashIndex !== -1
    ? moduleSpecifier.slice(0, slashIndex)
    : moduleSpecifier;
}

/**
 * Falls back to deriving the package name from the file-system path when
 * TypeScript's `sourceFileToPackageName` map has no entry for the file.
 * This covers cases where a package re-exports its symbols through
 * dynamically-named internal files (e.g. Angular 19.2.5+ hashed chunks)
 * that the compiler cannot automatically attribute to a package.
 */
function getPackageNameFromFilePath(filePath: string): string | undefined {
  const normalized = filePath.replaceAll('\\', '/');
  const marker = '/node_modules/';
  const idx = normalized.lastIndexOf(marker);
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
    const rawPackageIdName = program.sourceFileToPackageName.get(
      declaration.path,
    );
    // Fall back to deriving the package name from the file path for packages
    // that use dynamic/hashed re-export filenames (e.g. Angular 19.2.5+).
    const packageIdName =
      rawPackageIdName ?? getPackageNameFromFilePath(declaration.path);
    if (packageIdName == null) {
      return false;
    }

    // Normalize to the bare package name (strip any subpath like `/http`).
    const extractedName = extractPackageName(packageIdName);

    return (
      extractedName === packageName ||
      extractedName === typesPackageName ||
      extractedName === `@types/${typesPackageName}`
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
