import path from 'path';
import type * as ts from 'typescript';

interface FileSpecifier {
  from: 'file';
  name: string | string[];
  source?: string;
}

interface LibSpecifier {
  from: 'lib';
  name: string | string[];
}

interface PackageSpecifier {
  from: 'package';
  name: string | string[];
  source: string;
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
        source: {
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
        source: {
          type: 'string',
        },
      },
      required: ['from', 'name', 'source'],
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'array',
          minItems: 1,
          uniqueItems: true,
          items: {
            type: 'string',
            enum: ['file', 'lib', 'package'],
          },
        },
        name: {
          type: 'string',
        },
      },
      required: ['from', 'name'],
    },
  ],
};

function specifierNameMatches(type: ts.Type, name: string | string[]): boolean {
  if (typeof name === 'string') {
    name = [name];
  }
  const symbol = type.getSymbol();
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
    return declarationFiles.some(declaration =>
      declaration.fileName.startsWith(program.getCurrentDirectory()),
    );
  }
  const absolutePath = path.join(program.getCurrentDirectory(), relativePath);
  return declarationFiles.some(
    declaration => declaration.fileName === absolutePath,
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
      return typeDeclaredInFile(specifier.source, declarationFiles, program);
    case 'lib':
      return declarationFiles.some(declaration =>
        program.isSourceFileDefaultLibrary(declaration),
      );
    case 'package':
      return declarationFiles.some(
        declaration =>
          declaration.fileName.includes(`node_modules/${specifier.source}/`) ||
          declaration.fileName.includes(
            `node_modules/@types/${specifier.source}/`,
          ),
      );
  }
}
