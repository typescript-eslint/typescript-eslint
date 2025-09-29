import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import {
  nullThrows,
  NullThrowsReasons,
} from '@typescript-eslint/utils/eslint-utils';

/**
 * Generates report loc suitable for reporting on how a class member is
 * declared, rather than how it's implemented.
 *
 * ```ts
 * class A {
 *   abstract method(): void;
 *   ~~~~~~~~~~~~~~~
 *
 *   concreteMethod(): void {
 *   ~~~~~~~~~~~~~~
 *      // code
 *   }
 *
 *   abstract private property?: string;
 *   ~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 *   @decorator override concreteProperty = 'value';
 *              ~~~~~~~~~~~~~~~~~~~~~~~~~
 * }
 * ```
 */
export function getMemberHeadLoc(
  sourceCode: Readonly<TSESLint.SourceCode>,
  node:
    | TSESTree.AccessorProperty
    | TSESTree.MethodDefinition
    | TSESTree.PropertyDefinition
    | TSESTree.TSAbstractAccessorProperty
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.TSAbstractPropertyDefinition,
): TSESTree.SourceLocation {
  let start: TSESTree.Position;

  if (node.decorators.length === 0) {
    start = node.loc.start;
  } else {
    const lastDecorator = node.decorators[node.decorators.length - 1];
    const nextToken = nullThrows(
      sourceCode.getTokenAfter(lastDecorator),
      NullThrowsReasons.MissingToken('token', 'last decorator'),
    );
    start = nextToken.loc.start;
  }

  let end: TSESTree.Position;

  if (!node.computed) {
    end = node.key.loc.end;
  } else {
    const closingBracket = nullThrows(
      sourceCode.getTokenAfter(node.key, token => token.value === ']'),
      NullThrowsReasons.MissingToken(']', node.type),
    );
    end = closingBracket.loc.end;
  }

  return {
    end: structuredClone(end),
    start: structuredClone(start),
  };
}

/**
 * Generates report loc suitable for reporting on how a parameter property is
 * declared.
 *
 * ```ts
 * class A {
 *   constructor(private property: string = 'value') {
 *               ~~~~~~~~~~~~~~~~
 *   }
 * ```
 */
export function getParameterPropertyHeadLoc(
  sourceCode: Readonly<TSESLint.SourceCode>,
  node: TSESTree.TSParameterProperty,
  nodeName: string,
): TSESTree.SourceLocation {
  // Parameter properties have a weirdly different AST structure
  // than other class members.

  let start: TSESTree.Position;

  if (node.decorators.length === 0) {
    start = structuredClone(node.loc.start);
  } else {
    const lastDecorator = node.decorators[node.decorators.length - 1];
    const nextToken = nullThrows(
      sourceCode.getTokenAfter(lastDecorator),
      NullThrowsReasons.MissingToken('token', 'last decorator'),
    );
    start = structuredClone(nextToken.loc.start);
  }

  const end = sourceCode.getLocFromIndex(
    node.parameter.range[0] + nodeName.length,
  );

  return {
    end,
    start,
  };
}
