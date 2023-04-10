import path from 'path';
import * as ts from 'typescript';

interface FileSpecifier {
  from: 'file';
  name: string | string[];
  path?: string;
}

interface LibSpecifier {
  from: 'lib';
  name: string | string[];
}

interface PackageSpecifier {
  from: 'package';
  name: string | string[];
  package: string;
}

export type TypeOrValueSpecifier =
  | string
  | FileSpecifier
  | LibSpecifier
  | PackageSpecifier;

export const typeOrValueSpecifierSchema = {
  oneOf: [
    {
      type: 'string',
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'string',
          const: 'file',
        },
        name: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
              },
            },
          ],
        },
        path: {
          type: 'string',
        },
      },
      required: ['from', 'name'],
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'string',
          const: 'lib',
        },
        name: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
              },
            },
          ],
        },
      },
      required: ['from', 'name'],
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'string',
          const: 'package',
        },
        name: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
              },
            },
          ],
        },
        package: {
          type: 'string',
        },
      },
      required: ['from', 'name', 'package'],
    },
  ],
};

function specifierNameMatches(type: ts.Type, name: string | string[]): boolean {
  if (typeof name === 'string') {
    name = [name];
  }
  const symbol = type.aliasSymbol ?? type.getSymbol();
  if (symbol === undefined) {
    return false;
  }
  return name.some(item => item === symbol.escapedName);
}

function typeDeclaredInFile(
  relativePath: string | undefined,
  declarationFiles: ts.SourceFile[],
  program: ts.Program,
): boolean {
  if (relativePath === undefined) {
    const cwd = program.getCurrentDirectory().toLowerCase();
    const typeRoots = ts.getEffectiveTypeRoots(
      program.getCompilerOptions(),
      program,
    );

    return declarationFiles.some(declaration => {
      if (program.isSourceFileFromExternalLibrary(declaration)) {
        return false;
      }
      const fileName = declaration.fileName.toLowerCase();
      if (!fileName.startsWith(cwd)) {
        return false;
      }
      return (
        typeRoots?.some(typeRoot => fileName.startsWith(typeRoot)) !== true
      );
    });
  }
  const absolutePath = path
    .join(program.getCurrentDirectory(), relativePath)
    .toLowerCase();
  return declarationFiles.some(
    declaration => declaration.fileName.toLowerCase() === absolutePath,
  );
}

export function typeMatchesSpecifier(
  type: ts.Type,
  specifier: TypeOrValueSpecifier,
  program: ts.Program,
): boolean {
  if (typeof specifier === 'string') {
    return specifierNameMatches(type, specifier);
  }
  if (!specifierNameMatches(type, specifier.name)) {
    return false;
  }
  const declarationFiles =
    type
      .getSymbol()
      ?.getDeclarations()
      ?.map(declaration => declaration.getSourceFile()) ?? [];
  switch (specifier.from) {
    case 'file':
      return typeDeclaredInFile(specifier.path, declarationFiles, program);
    case 'lib':
      return declarationFiles.some(declaration =>
        program.isSourceFileDefaultLibrary(declaration),
      );
    case 'package':
      return declarationFiles.some(
        declaration =>
          declaration.fileName.includes(`node_modules/${specifier.package}/`) ||
          declaration.fileName.includes(
            `node_modules/@types/${specifier.package}/`,
          ),
      );
  }
}
