import { getCanonicalFileName } from '@typescript-eslint/typescript-estree';
import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import path from 'path';
import type * as ts from 'typescript';

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

export const typeOrValueSpecifierSchema: JSONSchema4 = {
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
          enum: ['file'],
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
          enum: ['lib'],
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
          enum: ['package'],
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
    const cwd = getCanonicalFileName(program.getCurrentDirectory());
    return declarationFiles.some(declaration =>
      getCanonicalFileName(declaration.fileName).startsWith(cwd),
    );
  }
  const absolutePath = getCanonicalFileName(
    path.join(program.getCurrentDirectory(), relativePath),
  );
  return declarationFiles.some(
    declaration => getCanonicalFileName(declaration.fileName) === absolutePath,
  );
}

function typeDeclaredInPackage(
  packageName: string,
  declarationFiles: ts.SourceFile[],
): boolean {
  // Handle scoped packages - if the name starts with @, remove it and replace / with __
  const typesPackageName =
    '@types/' + packageName.replace(/^@([^/]+)\//, '$1__');
  const matcher = new RegExp(
    `node_modules/(?:${packageName}|${typesPackageName})/`,
  );
  return declarationFiles.some(declaration =>
    matcher.test(declaration.fileName),
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
      return typeDeclaredInPackage(specifier.package, declarationFiles);
  }
}
