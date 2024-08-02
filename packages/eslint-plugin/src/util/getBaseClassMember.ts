import * as ts from 'typescript';

/**
 * When given a class property or method node,
 * if the class extends another class,
 * this function returns the corresponding property or method node in the base class.
 */
export function getBaseClassMember(
  memberNode: ts.PropertyDeclaration | ts.MethodDeclaration,
  checker: ts.TypeChecker,
): ts.Symbol | undefined {
  const classNode = memberNode.parent;
  const classType = checker.getTypeAtLocation(classNode);
  if (!classType.isClassOrInterface()) {
    // TODO: anonymous class expressions fail this check
    return undefined;
  }
  const memberNameNode = memberNode.name;
  if (ts.isComputedPropertyName(memberNameNode)) {
    return undefined;
  }
  const memberName = memberNameNode.getText();
  const baseTypes = checker.getBaseTypes(classType);
  for (const baseType of baseTypes) {
    const basePropSymbol = checker.getPropertyOfType(baseType, memberName);
    if (basePropSymbol != null) {
      return basePropSymbol;
    }
  }
  return undefined;
}
