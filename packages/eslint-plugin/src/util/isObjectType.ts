import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

/**
 * Returns whether the type is a fresh object literal, which will be subject to
 * excess property checking.
 *
 * For example, in the following snippet, the first function call has an object
 * literal type, and therefore is disallowed by excess property checking,
 * whereas the second function call is allowed, because the argument is not an
 * object literal type:
 *
 * ```ts
 * declare function f(x: { a: string });
 *
 * f({ a: 'foo', excess: 'property' }); // TS error
 *
 * const allowed = { a: 'foo', excess: 'property' };
 *
 * f(allowed); // allowed
 * ```
 */
export function isObjectLiteralType(type: ts.Type): boolean {
  return (
    tsutils.isObjectType(type) &&
    tsutils.isObjectFlagSet(type, ts.ObjectFlags.ObjectLiteral)
  );
}

/**
 * Maps object literal types into ordinary types, in order to be able to avoid
 * spurious results from `checker.isTypeAssignableTo()` due to excess property
 * checking.
 */
export function toWidenedType(checker: ts.TypeChecker, type: ts.Type): ts.Type {
  return isObjectLiteralType(type) ? checker.getWidenedType(type) : type;
}
