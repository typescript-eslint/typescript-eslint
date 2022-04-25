import {
  TSESTree,
  AST_NODE_TYPES,
  ESLintUtils,
  TSESLint,
} from '@typescript-eslint/utils';
import { isTypeAssertion, isConstructor, isSetter } from './astUtils';
import { getFunctionHeadLoc } from './getFunctionHeadLoc';

type FunctionExpression =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;
type FunctionNode = FunctionExpression | TSESTree.FunctionDeclaration;

/**
 * Checks if a node is a variable declarator with a type annotation.
 * ```
 * const x: Foo = ...
 * ```
 */
function isVariableDeclaratorWithTypeAnnotation(
  node: TSESTree.Node,
): node is TSESTree.VariableDeclarator {
  return (
    node.type === AST_NODE_TYPES.VariableDeclarator && !!node.id.typeAnnotation
  );
}

/**
 * Checks if a node is a class property with a type annotation.
 * ```
 * public x: Foo = ...
 * ```
 */
function isPropertyDefinitionWithTypeAnnotation(
  node: TSESTree.Node,
): node is TSESTree.PropertyDefinition {
  return (
    node.type === AST_NODE_TYPES.PropertyDefinition && !!node.typeAnnotation
  );
}

/**
 * Checks if a node belongs to:
 * ```
 * new Foo(() => {})
 *         ^^^^^^^^
 * ```
 */
function isConstructorArgument(
  node: TSESTree.Node,
): node is TSESTree.NewExpression {
  return node.type === AST_NODE_TYPES.NewExpression;
}

/**
 * Checks if a node is a property or a nested property of a typed object:
 * ```
 * const x: Foo = { prop: () => {} }
 * const x = { prop: () => {} } as Foo
 * const x = <Foo>{ prop: () => {} }
 * const x: Foo = { bar: { prop: () => {} } }
 * ```
 */
function isPropertyOfObjectWithType(
  property: TSESTree.Node | undefined,
): boolean {
  if (!property || property.type !== AST_NODE_TYPES.Property) {
    return false;
  }
  const objectExpr = property.parent; // this shouldn't happen, checking just in case
  /* istanbul ignore if */ if (
    !objectExpr ||
    objectExpr.type !== AST_NODE_TYPES.ObjectExpression
  ) {
    return false;
  }

  const parent = objectExpr.parent; // this shouldn't happen, checking just in case
  /* istanbul ignore if */ if (!parent) {
    return false;
  }

  return (
    isTypeAssertion(parent) ||
    isPropertyDefinitionWithTypeAnnotation(parent) ||
    isVariableDeclaratorWithTypeAnnotation(parent) ||
    isFunctionArgument(parent) ||
    isPropertyOfObjectWithType(parent)
  );
}

/**
 * Checks if a function belongs to:
 * ```
 * () => () => ...
 * () => function () { ... }
 * () => { return () => ... }
 * () => { return function () { ... } }
 * function fn() { return () => ... }
 * function fn() { return function() { ... } }
 * ```
 */
function doesImmediatelyReturnFunctionExpression({
  body,
}: FunctionNode): boolean {
  // Should always have a body; really checking just in case
  /* istanbul ignore if */ if (!body) {
    return false;
  }

  // Check if body is a block with a single statement
  if (body.type === AST_NODE_TYPES.BlockStatement && body.body.length === 1) {
    const [statement] = body.body;

    // Check if that statement is a return statement with an argument
    if (
      statement.type === AST_NODE_TYPES.ReturnStatement &&
      !!statement.argument
    ) {
      // If so, check that returned argument as body
      body = statement.argument;
    }
  }

  // Check if the body being returned is a function expression
  return (
    body.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    body.type === AST_NODE_TYPES.FunctionExpression
  );
}

/**
 * Checks if a node belongs to:
 * ```
 * foo(() => 1)
 * ```
 */
function isFunctionArgument(
  parent: TSESTree.Node,
  callee?: FunctionExpression,
): parent is TSESTree.CallExpression {
  return (
    parent.type === AST_NODE_TYPES.CallExpression &&
    // make sure this isn't an IIFE
    parent.callee !== callee
  );
}

/**
 * Checks if a function belongs to:
 * ```
 * () => ({ action: 'xxx' } as const)
 * ```
 */
function returnsConstAssertionDirectly(
  node: TSESTree.ArrowFunctionExpression,
): boolean {
  const { body } = node;
  if (isTypeAssertion(body)) {
    const { typeAnnotation } = body;
    if (typeAnnotation.type === AST_NODE_TYPES.TSTypeReference) {
      const { typeName } = typeAnnotation;
      if (
        typeName.type === AST_NODE_TYPES.Identifier &&
        typeName.name === 'const'
      ) {
        return true;
      }
    }
  }

  return false;
}

interface Options {
  allowExpressions?: boolean;
  allowTypedFunctionExpressions?: boolean;
  allowHigherOrderFunctions?: boolean;
  allowDirectConstAssertionInArrowFunctions?: boolean;
}

/**
 * True when the provided function expression is typed.
 */
function isTypedFunctionExpression(
  node: FunctionExpression,
  options: Options,
): boolean {
  const parent = ESLintUtils.nullThrows(
    node.parent,
    ESLintUtils.NullThrowsReasons.MissingParent,
  );

  if (!options.allowTypedFunctionExpressions) {
    return false;
  }

  return (
    isTypeAssertion(parent) ||
    isVariableDeclaratorWithTypeAnnotation(parent) ||
    isPropertyDefinitionWithTypeAnnotation(parent) ||
    isPropertyOfObjectWithType(parent) ||
    isFunctionArgument(parent, node) ||
    isConstructorArgument(parent)
  );
}

/**
 * Check whether the function expression return type is either typed or valid
 * with the provided options.
 */
function isValidFunctionExpressionReturnType(
  node: FunctionExpression,
  options: Options,
): boolean {
  if (isTypedFunctionExpression(node, options)) {
    return true;
  }

  const parent = ESLintUtils.nullThrows(
    node.parent,
    ESLintUtils.NullThrowsReasons.MissingParent,
  );
  if (
    options.allowExpressions &&
    parent.type !== AST_NODE_TYPES.VariableDeclarator &&
    parent.type !== AST_NODE_TYPES.MethodDefinition &&
    parent.type !== AST_NODE_TYPES.ExportDefaultDeclaration &&
    parent.type !== AST_NODE_TYPES.PropertyDefinition
  ) {
    return true;
  }

  // https://github.com/typescript-eslint/typescript-eslint/issues/653
  return (
    options.allowDirectConstAssertionInArrowFunctions === true &&
    node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
    returnsConstAssertionDirectly(node)
  );
}

/**
 * Check that the function expression or declaration is valid.
 */
function isValidFunctionReturnType(
  node: FunctionNode,
  options: Options,
): boolean {
  if (
    options.allowHigherOrderFunctions &&
    doesImmediatelyReturnFunctionExpression(node)
  ) {
    return true;
  }

  return (
    node.returnType != null ||
    isConstructor(node.parent) ||
    isSetter(node.parent)
  );
}

/**
 * Checks if a function declaration/expression has a return type.
 */
function checkFunctionReturnType(
  node: FunctionNode,
  options: Options,
  sourceCode: TSESLint.SourceCode,
  report: (loc: TSESTree.SourceLocation) => void,
): void {
  if (isValidFunctionReturnType(node, options)) {
    return;
  }

  report(getFunctionHeadLoc(node, sourceCode));
}

/**
 * Checks if a function declaration/expression has a return type.
 */
function checkFunctionExpressionReturnType(
  node: FunctionExpression,
  options: Options,
  sourceCode: TSESLint.SourceCode,
  report: (loc: TSESTree.SourceLocation) => void,
): void {
  if (isValidFunctionExpressionReturnType(node, options)) {
    return;
  }

  checkFunctionReturnType(node, options, sourceCode, report);
}

/**
 * Check whether any ancestor of the provided function has a valid return type.
 */
function ancestorHasReturnType(node: FunctionNode): boolean {
  let ancestor = node.parent;

  if (ancestor?.type === AST_NODE_TYPES.Property) {
    ancestor = ancestor.value;
  }

  // if the ancestor is not a return, then this function was not returned at all, so we can exit early
  const isReturnStatement = ancestor?.type === AST_NODE_TYPES.ReturnStatement;
  const isBodylessArrow =
    ancestor?.type === AST_NODE_TYPES.ArrowFunctionExpression &&
    ancestor.body.type !== AST_NODE_TYPES.BlockStatement;
  if (!isReturnStatement && !isBodylessArrow) {
    return false;
  }

  while (ancestor) {
    switch (ancestor.type) {
      case AST_NODE_TYPES.ArrowFunctionExpression:
      case AST_NODE_TYPES.FunctionExpression:
      case AST_NODE_TYPES.FunctionDeclaration:
        if (ancestor.returnType) {
          return true;
        }
        break;

      // const x: Foo = () => {};
      // Assume that a typed variable types the function expression
      case AST_NODE_TYPES.VariableDeclarator:
        if (ancestor.id.typeAnnotation) {
          return true;
        }
        break;
    }

    ancestor = ancestor.parent;
  }

  return false;
}

export {
  checkFunctionExpressionReturnType,
  checkFunctionReturnType,
  doesImmediatelyReturnFunctionExpression,
  FunctionExpression,
  FunctionNode,
  isTypedFunctionExpression,
  isValidFunctionExpressionReturnType,
  ancestorHasReturnType,
};
