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
    return moduleSpecifier.split('/').slice(0, 2).join('/');
  }
  return moduleSpecifier.split('/')[0];
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

    // Check both TypeScript's package-name map and the file path itself.
    // The file-path fallback handles packages that re-export via hashed internal
    // files (e.g. Angular 19.2.5+) where the TS map has no entry for the file.
    // External library files are always inside node_modules, so splitting on
    // '/node_modules/' always yields at least two parts; the last part is the
    // package-relative path from which we extract the package name.
    const normalized = declaration.path.replaceAll('\\', '/');
    const nmParts = normalized.split('/node_modules/');
    const fromFilePath = extractPackageName(nmParts[nmParts.length - 1]);

    const candidateNames = [
      program.sourceFileToPackageName.get(declaration.path),
      fromFilePath,
    ];

    return candidateNames.some(packageIdName => {
      if (packageIdName == null || packageIdName === '') {
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
