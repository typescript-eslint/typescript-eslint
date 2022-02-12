import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    checksConditionals?: boolean;
    checksVoidReturn?: boolean;
  },
];

type MessageId =
  | 'conditional'
  | 'voidReturn'
  | 'voidReturnVariable'
  | 'voidReturnProperty'
  | 'voidReturnReturnValue'
  | 'voidReturnAttribute';

export default util.createRule<Options, MessageId>({
  name: 'no-misused-promises',
  meta: {
    docs: {
      description: 'Avoid using promises in places not designed to handle them',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      voidReturn:
        'Promise returned in function argument where a void return was expected.',
      voidReturnVariable:
        'Promise returned in variable where a void return was expected.',
      voidReturnProperty:
        'Promise returned in property where a void return was expected.',
      voidReturnReturnValue:
        'Promise returned in return value where a void return was expected.',
      voidReturnAttribute:
        'Promise returned in attribute where a void return was expected.',
      conditional: 'Expected non-Promise value in a boolean conditional.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          checksConditionals: {
            type: 'boolean',
          },
          checksVoidReturn: {
            type: 'boolean',
          },
        },
      },
    ],
    type: 'problem',
  },
  defaultOptions: [
    {
      checksConditionals: true,
      checksVoidReturn: true,
    },
  ],

  create(context, [{ checksConditionals, checksVoidReturn }]) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    const checkedNodes = new Set<TSESTree.Node>();

    const conditionalChecks: TSESLint.RuleListener = {
      ConditionalExpression: checkTestConditional,
      DoWhileStatement: checkTestConditional,
      ForStatement: checkTestConditional,
      IfStatement: checkTestConditional,
      LogicalExpression: checkConditional,
      'UnaryExpression[operator="!"]'(node: TSESTree.UnaryExpression) {
        checkConditional(node.argument, true);
      },
      WhileStatement: checkTestConditional,
    };

    const voidReturnChecks: TSESLint.RuleListener = {
      CallExpression: checkArguments,
      NewExpression: checkArguments,
      AssignmentExpression: checkAssignments,
      VariableDeclarator: checkVariableDeclaration,
      Property: checkProperties,
      ReturnStatement: checkReturnStatements,
      JSXAttribute: checkJSXAttributes,
    };

    function checkTestConditional(node: {
      test: TSESTree.Expression | null;
    }): void {
      if (node.test) {
        checkConditional(node.test, true);
      }
    }

    /**
     * This function analyzes the type of a node and checks if it is a Promise in a boolean conditional.
     * It uses recursion when checking nested logical operators.
     * @param node The AST node to check.
     * @param isTestExpr Whether the node is a descendant of a test expression.
     */
    function checkConditional(
      node: TSESTree.Expression,
      isTestExpr = false,
    ): void {
      // prevent checking the same node multiple times
      if (checkedNodes.has(node)) {
        return;
      }
      checkedNodes.add(node);

      if (node.type === AST_NODE_TYPES.LogicalExpression) {
        // ignore the left operand for nullish coalescing expressions not in a context of a test expression
        if (node.operator !== '??' || isTestExpr) {
          checkConditional(node.left, isTestExpr);
        }
        // we ignore the right operand when not in a context of a test expression
        if (isTestExpr) {
          checkConditional(node.right, isTestExpr);
        }
        return;
      }
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      if (isAlwaysThenable(checker, tsNode)) {
        context.report({
          messageId: 'conditional',
          node,
        });
      }
    }

    function checkArguments(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const voidParams = voidFunctionParams(checker, tsNode);
      if (voidParams.size === 0) {
        return;
      }

      for (const [index, argument] of node.arguments.entries()) {
        if (!voidParams.has(index)) {
          continue;
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(argument);
        if (returnsThenable(checker, tsNode as ts.Expression)) {
          context.report({
            messageId: 'voidReturn',
            node: argument,
          });
        }
      }
    }

    function checkAssignments(node: TSESTree.AssignmentExpression): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const varType = checker.getTypeAtLocation(tsNode.left);
      if (!isVoidReturningFunctionType(checker, tsNode.left, varType)) {
        return;
      }

      if (returnsThenable(checker, tsNode.right)) {
        context.report({
          messageId: 'voidReturnVariable',
          node: node.right,
        });
      }
    }

    function checkVariableDeclaration(node: TSESTree.VariableDeclarator): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      if (tsNode.initializer === undefined || node.init === null) {
        return;
      }
      const varType = checker.getTypeAtLocation(tsNode.name);
      if (!isVoidReturningFunctionType(checker, tsNode.initializer, varType)) {
        return;
      }

      if (returnsThenable(checker, tsNode.initializer)) {
        context.report({
          messageId: 'voidReturnVariable',
          node: node.init,
        });
      }
    }

    function checkProperties(node: TSESTree.Property): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      if (ts.isPropertyAssignment(tsNode)) {
        const contextualType = checker.getContextualType(tsNode.initializer);
        if (contextualType === undefined) {
          return;
        }
        if (
          !isVoidReturningFunctionType(
            checker,
            tsNode.initializer,
            contextualType,
          )
        ) {
          return;
        }
        if (returnsThenable(checker, tsNode.initializer)) {
          context.report({
            messageId: 'voidReturnProperty',
            node: node.value,
          });
        }
      } else if (ts.isShorthandPropertyAssignment(tsNode)) {
        const contextualType = checker.getContextualType(tsNode.name);
        if (contextualType === undefined) {
          return;
        }
        if (
          !isVoidReturningFunctionType(checker, tsNode.name, contextualType)
        ) {
          return;
        }
        if (returnsThenable(checker, tsNode.name)) {
          context.report({
            messageId: 'voidReturnProperty',
            node: node.value,
          });
        }
      } else if (ts.isMethodDeclaration(tsNode)) {
        if (ts.isComputedPropertyName(tsNode.name)) {
          return;
        }
        const obj = tsNode.parent;
        if (!ts.isObjectLiteralExpression(obj)) {
          return;
        }
        const objType =
          checker.getContextualType(obj) ?? checker.getTypeAtLocation(obj);
        const propertySymbol = checker.getPropertyOfType(
          objType,
          tsNode.name.text,
        );
        if (propertySymbol === undefined) {
          return;
        }

        const contextualType = checker.getTypeOfSymbolAtLocation(
          propertySymbol,
          tsNode.name,
        );

        if (contextualType === undefined) {
          return;
        }
        if (
          !isVoidReturningFunctionType(checker, tsNode.name, contextualType)
        ) {
          return;
        }
        if (returnsThenable(checker, tsNode)) {
          context.report({
            messageId: 'voidReturnProperty',
            node: node.value,
          });
        }
        return;
      }
    }

    function checkReturnStatements(node: TSESTree.ReturnStatement): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      if (tsNode.expression === undefined || node.argument === null) {
        return;
      }
      const contextualType = checker.getContextualType(tsNode.expression);
      if (contextualType === undefined) {
        return;
      }
      if (
        !isVoidReturningFunctionType(checker, tsNode.expression, contextualType)
      ) {
        return;
      }
      if (returnsThenable(checker, tsNode.expression)) {
        context.report({
          messageId: 'voidReturnReturnValue',
          node: node.argument,
        });
      }
    }

    function checkJSXAttributes(node: TSESTree.JSXAttribute): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const value = tsNode.initializer;
      if (
        node.value === null ||
        value === undefined ||
        !ts.isJsxExpression(value) ||
        value.expression === undefined
      ) {
        return;
      }
      const contextualType = checker.getContextualType(value);
      if (contextualType === undefined) {
        return;
      }
      if (!isVoidReturningFunctionType(checker, value, contextualType)) {
        return;
      }

      if (returnsThenable(checker, value.expression)) {
        context.report({
          messageId: 'voidReturnAttribute',
          node: node.value,
        });
      }
    }

    return {
      ...(checksConditionals ? conditionalChecks : {}),
      ...(checksVoidReturn ? voidReturnChecks : {}),
    };
  },
});

// Variation on the thenable check which requires all forms of the type (read:
// alternates in a union) to be thenable. Otherwise, you might be trying to
// check if something is defined or undefined and get caught because one of the
// branches is thenable.
function isAlwaysThenable(checker: ts.TypeChecker, node: ts.Node): boolean {
  const type = checker.getTypeAtLocation(node);

  for (const subType of tsutils.unionTypeParts(checker.getApparentType(type))) {
    const thenProp = subType.getProperty('then');

    // If one of the alternates has no then property, it is not thenable in all
    // cases.
    if (thenProp === undefined) {
      return false;
    }

    // We walk through each variation of the then property. Since we know it
    // exists at this point, we just need at least one of the alternates to
    // be of the right form to consider it thenable.
    const thenType = checker.getTypeOfSymbolAtLocation(thenProp, node);
    let hasThenableSignature = false;
    for (const subType of tsutils.unionTypeParts(thenType)) {
      for (const signature of subType.getCallSignatures()) {
        if (
          signature.parameters.length !== 0 &&
          isFunctionParam(checker, signature.parameters[0], node)
        ) {
          hasThenableSignature = true;
          break;
        }
      }

      // We only need to find one variant of the then property that has a
      // function signature for it to be thenable.
      if (hasThenableSignature) {
        break;
      }
    }

    // If no flavors of the then property are thenable, we don't consider the
    // overall type to be thenable
    if (!hasThenableSignature) {
      return false;
    }
  }

  // If all variants are considered thenable (i.e. haven't returned false), we
  // consider the overall type thenable
  return true;
}

function isFunctionParam(
  checker: ts.TypeChecker,
  param: ts.Symbol,
  node: ts.Node,
): boolean {
  const type: ts.Type | undefined = checker.getApparentType(
    checker.getTypeOfSymbolAtLocation(param, node),
  );
  for (const subType of tsutils.unionTypeParts(type)) {
    if (subType.getCallSignatures().length !== 0) {
      return true;
    }
  }
  return false;
}

// Get the positions of parameters which are void functions (and not also
// thenable functions). These are the candidates for the void-return check at
// the current call site.
function voidFunctionParams(
  checker: ts.TypeChecker,
  node: ts.CallExpression | ts.NewExpression,
): Set<number> {
  const voidReturnIndices = new Set<number>();
  const type = checker.getTypeAtLocation(node.expression);

  for (const subType of tsutils.unionTypeParts(type)) {
    // Standard function calls and `new` have two different types of signatures
    const signatures = ts.isCallExpression(node)
      ? subType.getCallSignatures()
      : subType.getConstructSignatures();
    for (const signature of signatures) {
      for (const [index, parameter] of signature.parameters.entries()) {
        const type = checker.getTypeOfSymbolAtLocation(
          parameter,
          node.expression,
        );
        if (isVoidReturningFunctionType(checker, node.expression, type)) {
          voidReturnIndices.add(index);
        }
      }
    }
  }

  return voidReturnIndices;
}

// Returns true if given type is a void-returning function.
function isVoidReturningFunctionType(
  checker: ts.TypeChecker,
  node: ts.Node,
  type: ts.Type,
): boolean {
  let hasVoidReturningFunction = false;
  let hasThenableReturningFunction = false;
  for (const subType of tsutils.unionTypeParts(type)) {
    for (const signature of subType.getCallSignatures()) {
      const returnType = signature.getReturnType();
      if (tsutils.isTypeFlagSet(returnType, ts.TypeFlags.Void)) {
        hasVoidReturningFunction = true;
      } else if (tsutils.isThenableType(checker, node, returnType)) {
        hasThenableReturningFunction = true;
      }
    }
  }
  // If a certain positional argument accepts both thenable and void returns,
  // a promise-returning function is valid
  return hasVoidReturningFunction && !hasThenableReturningFunction;
}

// Returns true if the expression is a function that returns a thenable
function returnsThenable(checker: ts.TypeChecker, node: ts.Node): boolean {
  const type = checker.getApparentType(checker.getTypeAtLocation(node));

  for (const subType of tsutils.unionTypeParts(type)) {
    for (const signature of subType.getCallSignatures()) {
      const returnType = signature.getReturnType();
      if (tsutils.isThenableType(checker, node, returnType)) {
        return true;
      }
    }
  }

  return false;
}
