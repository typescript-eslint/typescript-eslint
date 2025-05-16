import type { TSESTree } from '@typescript-eslint/types';
import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import * as tsutils from 'ts-api-utils';

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
  name: string | string[];

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
  name: string | string[];
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
  name: string | string[];

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
  | string
  | FileSpecifier
  | LibSpecifier
  | PackageSpecifier;

export const typeOrValueSpecifiersSchema = {
  items: {
    oneOf: [
      {
        type: 'string',
      },
      {
        additionalProperties: false,
        properties: {
          from: {
            enum: ['file'],
            type: 'string',
          },
          name: {
            oneOf: [
              {
                type: 'string',
              },
              {
                items: {
                  type: 'string',
                },
                minItems: 1,
                type: 'array',
                uniqueItems: true,
              },
            ],
          },
          path: {
            type: 'string',
          },
        },
        required: ['from', 'name'],
        type: 'object',
      },
      {
        additionalProperties: false,
        properties: {
          from: {
            enum: ['lib'],
            type: 'string',
          },
          name: {
            oneOf: [
              {
                type: 'string',
              },
              {
                items: {
                  type: 'string',
                },
                minItems: 1,
                type: 'array',
                uniqueItems: true,
              },
            ],
          },
        },
        required: ['from', 'name'],
        type: 'object',
      },
      {
        additionalProperties: false,
        properties: {
          from: {
            enum: ['package'],
            type: 'string',
          },
          name: {
            oneOf: [
              {
                type: 'string',
              },
              {
                items: {
                  type: 'string',
                },
                minItems: 1,
                type: 'array',
                uniqueItems: true,
              },
            ],
          },
          package: {
            type: 'string',
          },
        },
        required: ['from', 'name', 'package'],
        type: 'object',
      },
    ],
  },
  type: 'array',
} as const satisfies JSONSchema4;

export function typeMatchesSpecifier(
  type: ts.Type,
  specifier: TypeOrValueSpecifier,
  program: ts.Program,
): boolean {
  const wholeTypeMatches = ((): boolean => {
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
  })();

  if (wholeTypeMatches) {
    return true;
  }

  if (
    tsutils.isIntersectionType(type) &&
    tsutils
      .intersectionConstituents(type)
      .some(part => typeMatchesSpecifier(part, specifier, program))
  ) {
    return true;
  }

  return false;
}

export const typeMatchesSomeSpecifier = (
  type: ts.Type,
  specifiers: TypeOrValueSpecifier[] = [],
  program: ts.Program,
): boolean =>
  specifiers.some(specifier => typeMatchesSpecifier(type, specifier, program));

const getSpecifierNames = (specifierName: string | string[]): string[] => {
  return typeof specifierName === 'string' ? [specifierName] : specifierName;
};

const getStaticName = (node: TSESTree.Node): string | undefined => {
  if (
    node.type === AST_NODE_TYPES.Identifier ||
    node.type === AST_NODE_TYPES.JSXIdentifier ||
    node.type === AST_NODE_TYPES.PrivateIdentifier
  ) {
    return node.name;
  }

  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string') {
    return node.value;
  }

  return undefined;
};

export function valueMatchesSpecifier(
  node: TSESTree.Node,
  specifier: TypeOrValueSpecifier,
  program: ts.Program,
  type: ts.Type,
): boolean {
  const staticName = getStaticName(node);
  if (!staticName) {
    return false;
  }

  if (typeof specifier === 'string') {
    return specifier === staticName;
  }

  if (!getSpecifierNames(specifier.name).includes(staticName)) {
    return false;
  }

  if (specifier.from === 'package') {
    const symbol = type.getSymbol() ?? type.aliasSymbol;
    const declarations = symbol?.getDeclarations() ?? [];
    const declarationFiles = declarations.map(declaration =>
      declaration.getSourceFile(),
    );
    return typeDeclaredInPackageDeclarationFile(
      specifier.package,
      declarations,
      declarationFiles,
      program,
    );
  }

  return true;
}

export const valueMatchesSomeSpecifier = (
  node: TSESTree.Node,
  specifiers: TypeOrValueSpecifier[] = [],
  program: ts.Program,
  type: ts.Type,
): boolean =>
  specifiers.some(specifier =>
    valueMatchesSpecifier(node, specifier, program, type),
  );
