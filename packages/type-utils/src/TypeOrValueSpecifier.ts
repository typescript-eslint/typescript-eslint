import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import * as tsutils from 'ts-api-utils';
import type * as ts from 'typescript';

import { specifierNameMatches } from './typeOrValueSpecifiers/specifierNameMatches';
import { typeDeclaredInFile } from './typeOrValueSpecifiers/typeDeclaredInFile';
import { typeDeclaredInLib } from './typeOrValueSpecifiers/typeDeclaredInLib';
import { typeDeclaredInPackage } from './typeOrValueSpecifiers/typeDeclaredInPackage';

export interface FileSpecifier {
  from: 'file';
  name: string[] | string;
  path?: string;
}

export interface LibSpecifier {
  from: 'lib';
  name: string[] | string;
}

export interface PackageSpecifier {
  from: 'package';
  name: string[] | string;
  package: string;
}

export type TypeOrValueSpecifier =
  | FileSpecifier
  | LibSpecifier
  | PackageSpecifier
  | string;

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

export function typeMatchesSpecifier(
  type: ts.Type,
  specifier: TypeOrValueSpecifier,
  program: ts.Program,
): boolean {
  if (tsutils.isIntrinsicErrorType(type)) {
    return false;
  }
  if (typeof specifier === 'string') {
    return specifierNameMatches(type, specifier);
  }
  if (!specifierNameMatches(type, specifier.name)) {
    return false;
  }
  const symbol = type.getSymbol() ?? type.aliasSymbol;
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
      return typeDeclaredInPackage(
        specifier.package,
        declarations,
        declarationFiles,
        program,
      );
  }
}
