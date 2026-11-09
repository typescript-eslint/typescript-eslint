import type * as ts from 'typescript';

import type {
  FileSpecifier,
  LibSpecifier,
  PackageSpecifier,
} from '../TypeOrValueSpecifier';

import { typeDeclaredInFile } from './typeDeclaredInFile';
import { typeDeclaredInLib } from './typeDeclaredInLib';
import { typeDeclaredInPackageDeclarationFile } from './typeDeclaredInPackageDeclarationFile';

export function specifierSourceMatches(
  specifier: FileSpecifier | LibSpecifier | PackageSpecifier,
  symbol: ts.Symbol | undefined,
  program: ts.Program,
): boolean {
  const declarations = symbol?.getDeclarations() ?? [];
  const declarationFiles = declarations.map(declaration =>
    declaration.getSourceFile(),
  );
  switch (specifier.from) {
    case 'file':
      return typeDeclaredInFile(specifier.path, declarationFiles, program);
    case 'lib':
      return typeDeclaredInLib(declarationFiles, program);
    case 'package':
      return typeDeclaredInPackageDeclarationFile(
        specifier.package,
        symbol,
        declarations,
        declarationFiles,
        program,
      );
  }
}
