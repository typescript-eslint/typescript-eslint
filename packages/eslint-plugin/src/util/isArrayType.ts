import type * as ts from 'typescript';

import * as tsutils from 'ts-api-utils';

export function isArrayType(checker: ts.TypeChecker, type: ts.Type): boolean {
  return tsutils
    .unionTypeParts(type)
    .every(unionPart =>
      tsutils
        .intersectionTypeParts(unionPart)
        .every(t => checker.isArrayType(t) || checker.isTupleType(t)),
    );
}
