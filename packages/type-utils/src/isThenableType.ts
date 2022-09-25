import type {
  Expression,
  Node,
  ParameterDeclaration,
  Symbol as SymbolType,
  Type,
  TypeChecker,
} from 'typescript';

import { unionTypeParts } from './unionTypeParts';

/** Determines if a type thenable and can be used with `await`. */
export function isThenableType(
  checker: TypeChecker,
  node: Node,
  type: Type,
): boolean;
/** Determines if a type thenable and can be used with `await`. */
export function isThenableType(
  checker: TypeChecker,
  node: Expression,
  type?: Type,
): boolean;
export function isThenableType(
  checker: TypeChecker,
  node: Node,
  type = checker.getTypeAtLocation(node)!,
): boolean {
  for (const ty of unionTypeParts(checker.getApparentType(type))) {
    const then = ty.getProperty('then');
    if (then === undefined) {
      continue;
    }

    const thenType = checker.getTypeOfSymbolAtLocation(then, node);

    for (const t of unionTypeParts(thenType)) {
      for (const signature of t.getCallSignatures()) {
        if (
          signature.parameters.length !== 0 &&
          isCallback(checker, signature.parameters[0], node)
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

function isCallback(
  checker: TypeChecker,
  param: SymbolType,
  node: Node,
): boolean {
  let type: Type | undefined = checker.getApparentType(
    checker.getTypeOfSymbolAtLocation(param, node),
  );

  if ((<ParameterDeclaration>param.valueDeclaration).dotDotDotToken) {
    // unwrap array type of rest parameter
    type = type.getNumberIndexType();

    if (type === undefined) {
      return false;
    }
  }

  for (const t of unionTypeParts(type)) {
    if (t.getCallSignatures().length !== 0) {
      return true;
    }
  }

  return false;
}
