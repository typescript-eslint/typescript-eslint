import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import * as tsutils from 'ts-api-utils';
import type * as ts from 'typescript';

import { specifierNameMatches } from './typeOrValueSpecifiers/specifierNameMatches';
import { typeDeclaredInFile } from './typeOrValueSpecifiers/typeDeclaredInFile';
import { typeDeclaredInLib } from './typeOrValueSpecifiers/typeDeclaredInLib';
import { typeDeclaredInPackageDeclarationFile } from './typeOrValueSpecifiers/typeDeclaredInPackageDeclarationFile';

/**
 * Describes specific types or values declared in local files.
 * See [TypeOrValueSpecifier > FileSpecifier](/packages/type-utils/type-or-value-specifier#filespecifier).
 */
export interface FileSpecifier {
  from: 'file';

  /**
   * Type or value name(s) to match on.
   */
  name: string[] | string;

  /**
   * A specific file the types or values must be declared in.
   */
  path?: string;
}

/**
 * Describes specific types or values declared in TypeScript's built-in lib definitions.
 * See [TypeOrValueSpecifier > LibSpecifier](/packages/type-utils/type-or-value-specifier#libspecifier).
 */
export interface LibSpecifier {
  from: 'lib';

  /**
   * Type or value name(s) to match on.
   */
  name: string[] | string;
}

/**
 * Describes specific types or values imported from packages.
 * See [TypeOrValueSpecifier > PackageSpecifier](/packages/type-utils/type-or-value-specifier#packagespecifier).
 */
export interface PackageSpecifier {
  from: 'package';

  /**
   * Type or value name(s) to match on.
   */
  name: string[] | string;

  /**
   * Package name the type or value must be declared in.
   */
  package: string;
}

/**
 * A centralized format for rule options to describe specific _types_ and/or _values_.
 * See [TypeOrValueSpecifier](/packages/type-utils/type-or-value-specifier).
 */
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
      return typeDeclaredInPackageDeclarationFile(
        specifier.package,
        declarations,
        declarationFiles,
        program,
      );
  }
}
