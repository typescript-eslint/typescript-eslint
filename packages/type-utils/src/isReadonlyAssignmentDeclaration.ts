import type { CallExpression, TypeChecker } from 'typescript';

import { isBindableObjectDefinePropertyCall } from './isBindableObjectDefinePropertyCall';
import { isBooleanLiteralType } from './isBooleanLiteralType';
import { isPropertyAssignment } from './isPropertyAssignment';

export function isReadonlyAssignmentDeclaration(
  node: CallExpression,
  checker: TypeChecker,
): boolean {
  if (!isBindableObjectDefinePropertyCall(node)) {
    return false;
  }

  const descriptorType = checker.getTypeAtLocation(node.arguments[2]);

  if (descriptorType.getProperty('value') === undefined) {
    return descriptorType.getProperty('set') === undefined;
  }

  const writableProp = descriptorType.getProperty('writable');

  if (writableProp === undefined) {
    return false;
  }

  const writableType =
    writableProp.valueDeclaration !== undefined &&
    isPropertyAssignment(writableProp.valueDeclaration)
      ? checker.getTypeAtLocation(writableProp.valueDeclaration.initializer)
      : checker.getTypeOfSymbolAtLocation(writableProp, node.arguments[2]);

  return isBooleanLiteralType(writableType, false);
}
