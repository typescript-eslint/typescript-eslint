import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { getValueOfLiteralType } from './getValueOfLiteralType';

// Truthiness utilities
const isTruthyLiteral = (type: ts.Type): boolean =>
  tsutils.isTrueLiteralType(type) ||
  (type.isLiteral() && !!getValueOfLiteralType(type));

export const isPossiblyFalsy = (type: ts.Type): boolean =>
  tsutils
    .unionTypeParts(type)
    // Intersections like `string & {}` can also be possibly falsy,
    // requiring us to look into the intersection.
    .flatMap(type => tsutils.intersectionTypeParts(type))
    // PossiblyFalsy flag includes literal values, so exclude ones that
    // are definitely truthy
    .filter(t => !isTruthyLiteral(t))
    .some(type => tsutils.isTypeFlagSet(type, ts.TypeFlags.PossiblyFalsy));

export const isPossiblyTruthy = (type: ts.Type): boolean =>
  tsutils
    .unionTypeParts(type)
    .map(type => tsutils.intersectionTypeParts(type))
    .some(intersectionParts =>
      // It is possible to define intersections that are always falsy,
      // like `"" & { __brand: string }`.
      intersectionParts.every(type => !tsutils.isFalsyType(type)),
    );
