import type * as ts from 'typescript';

import * as tsutils from 'ts-api-utils';

import { isTypeAnyType, isTypeAnyArrayType } from './predicates';

export enum AnyType {
  Any,
  PromiseAny,
  AnyArray,
  Safe,
}
/**
 * @returns `AnyType.Any` if the type is `any`, `AnyType.AnyArray` if the type is `any[]` or `readonly any[]`, `AnyType.PromiseAny` if the type is `Promise<any>`,
 *          otherwise it returns `AnyType.Safe`.
 */
export function discriminateAnyType(
  type: ts.Type,
  checker: ts.TypeChecker,
  program: ts.Program,
  tsNode: ts.Node,
): AnyType {
  return discriminateAnyTypeWorker(type, checker, program, tsNode, new Set());
}

function discriminateAnyTypeWorker(
  type: ts.Type,
  checker: ts.TypeChecker,
  program: ts.Program,
  tsNode: ts.Node,
  visited: Set<ts.Type>,
) {
  if (visited.has(type)) {
    return AnyType.Safe;
  }
  visited.add(type);
  if (isTypeAnyType(type)) {
    return AnyType.Any;
  }
  if (isTypeAnyArrayType(type, checker)) {
    return AnyType.AnyArray;
  }
  for (const part of tsutils.typeConstituents(type)) {
    if (tsutils.isThenableType(checker, tsNode, part)) {
      const awaitedType = checker.getAwaitedType(part);
      if (awaitedType) {
        const awaitedAnyType = discriminateAnyTypeWorker(
          awaitedType,
          checker,
          program,
          tsNode,
          visited,
        );
        if (awaitedAnyType === AnyType.Any) {
          return AnyType.PromiseAny;
        }
      }
    }
  }

  return AnyType.Safe;
}
