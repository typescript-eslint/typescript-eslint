import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    allowReturnAny?: boolean;
  },
];

type MessageId = `asyncFunc` | `nonVoidFunc` | `nonVoidReturn`;

export default util.createRule<Options, MessageId>({
  name: 'strict-void-return',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow passing a value-returning function in a position accepting a void function',
      requiresTypeChecking: true,
    },
    messages: {
      asyncFunc:
        'Async function used in a context where a void function is expected.',
      nonVoidFunc:
        'Value-returning function used in a context where a void function is expected.',
      nonVoidReturn:
        'Value returned in a context where a void return is expected.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowReturnAny: {
            type: 'boolean',
            description:
              'Whether to allow functions returning `any` to be used in place expecting a `void` function.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowReturnAny: false,
    },
  ],

  create(context, [options]) {
    const sourceCode = context.sourceCode;
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      ArrayExpression: (node): void => {
        for (const elemNode of node.elements) {
          if (
            elemNode != null &&
            elemNode.type !== AST_NODE_TYPES.SpreadElement
          ) {
            checkExpressionNode(elemNode);
          }
        }
      },
      ArrowFunctionExpression: (node): void => {
        if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
          checkExpressionNode(node.body);
        }
      },
      AssignmentExpression: (node): void => {
        checkExpressionNode(node.right); // should ignore operators like `+=` or `-=` automatically
      },
      'CallExpression, NewExpression': checkFunctionCallNode,
      JSXAttribute: (node): void => {
        if (
          node.value?.type === AST_NODE_TYPES.JSXExpressionContainer &&
          node.value.expression.type !== AST_NODE_TYPES.JSXEmptyExpression
        ) {
          checkExpressionNode(node.value.expression);
        }
      },
      MethodDefinition: checkClassMethodNode,
      ObjectExpression: (node): void => {
        for (const propNode of node.properties) {
          if (propNode.type !== AST_NODE_TYPES.SpreadElement) {
            checkObjectPropertyNode(propNode);
          }
        }
      },
      PropertyDefinition: checkClassPropertyNode,
      ReturnStatement: (node): void => {
        if (node.argument != null) {
          checkExpressionNode(node.argument);
        }
      },
      VariableDeclarator: (node): void => {
        if (node.init != null) {
          checkExpressionNode(node.init);
        }
      },
    };

    function isVoidReturningFunctionType(type: ts.Type): boolean {
      const returnTypes = tsutils
        .getCallSignaturesOfType(type)
        .flatMap(signature =>
          tsutils.unionConstituents(signature.getReturnType()),
        );
      return (
        returnTypes.length > 0 &&
        returnTypes.every(type =>
          tsutils.isTypeFlagSet(type, ts.TypeFlags.Void),
        )
      );
    }

    /**
     * Finds errors in any expression node.
     *
     * Compares the type of the node against the contextual (expected) type.
     *
     * @returns `true` if the expected type was void function.
     */
    function checkExpressionNode(node: TSESTree.Expression): boolean {
      const expectedType = parserServices.getContextualType(node);

      if (expectedType != null && isVoidReturningFunctionType(expectedType)) {
        reportIfNonVoidFunction(node);
        return true;
      }

      return false;
    }

    /**
     * Finds errors in function calls.
     *
     * When checking arguments, we also manually figure out the argument types
     * by iterating over all the function signatures.
     * Thanks to this, we can find arguments like `(() => void) | (() => any)`
     * and treat them as void too.
     * This is done to also support checking functions like `addEventListener`
     * which have overloads where one callback returns any.
     *
     * Implementation mostly based on no-misused-promises,
     * which does this to find `(() => void) | (() => NotThenable)`
     * and report them too.
     */
    function checkFunctionCallNode(
      callNode: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      const callTsNode = parserServices.esTreeNodeToTSNodeMap.get(callNode);

      const funcType = checker.getTypeAtLocation(callTsNode.expression);
      const funcSignatures = tsutils
        .unionConstituents(funcType)
        .flatMap(type =>
          ts.isCallExpression(callTsNode)
            ? type.getCallSignatures()
            : type.getConstructSignatures(),
        );

      for (const [argIdx, argNode] of callNode.arguments.entries()) {
        if (argNode.type === AST_NODE_TYPES.SpreadElement) {
          continue;
        }

        // Collect the types from all of the call signatures
        const argExpectedReturnTypes = funcSignatures
          .map(s => s.parameters[argIdx])
          .filter(Boolean)
          .map(param =>
            checker.getTypeOfSymbolAtLocation(param, callTsNode.expression),
          )
          .flatMap(paramType => tsutils.unionConstituents(paramType))
          .flatMap(paramType => paramType.getCallSignatures())
          .map(paramSignature => paramSignature.getReturnType());

        const hasSingleSignature = funcSignatures.length === 1;

        const allSignaturesReturnVoid = argExpectedReturnTypes.every(
          type =>
            isVoid(type) ||
            // Treat as void even though it might be technically any.
            isNullishOrAny(type) ||
            // `getTypeOfSymbolAtLocation` returns unresolved type parameters
            // (e.g. `T`), even for overloads that match the call.
            //
            // Since we can't tell whether a generic overload currently matches,
            // we treat TypeParameters similar to void.
            tsutils.isTypeParameter(type),
        );

        if (
          // Check against the contextual type first, but only when there is a
          // single signature or when all signatures are void, because
          // `getContextualType` resolves to the first overload's return type
          // even though there may be another one that matches the call.
          (hasSingleSignature || allSignaturesReturnVoid) &&
          checkExpressionNode(argNode)
        ) {
          continue;
        }

        if (
          // At least one return type is void
          argExpectedReturnTypes.some(isVoid) &&
          // The rest are nullish or any
          argExpectedReturnTypes.every(isNullishOrAny)
        ) {
          // We treat this argument as void even though it might be technically any.
          reportIfNonVoidFunction(argNode);
        }
      }
    }

    function isNullishOrAny(type: ts.Type): boolean {
      return tsutils.isTypeFlagSet(
        type,
        ts.TypeFlags.VoidLike |
          ts.TypeFlags.Undefined |
          ts.TypeFlags.Null |
          ts.TypeFlags.Any |
          ts.TypeFlags.Never,
      );
    }

    function isVoid(type: ts.Type): boolean {
      return tsutils.isTypeFlagSet(type, ts.TypeFlags.Void);
    }

    /**
     * Finds errors in an object property.
     *
     * Object properties require different logic
     * when the property is a method shorthand.
     */
    function checkObjectPropertyNode(propNode: TSESTree.Property): void {
      const valueNode = propNode.value as TSESTree.Expression;
      const propTsNode = parserServices.esTreeNodeToTSNodeMap.get(propNode);

      if (propTsNode.kind === ts.SyntaxKind.MethodDeclaration) {
        // Object property is a method shorthand.

        if (propTsNode.name.kind === ts.SyntaxKind.ComputedPropertyName) {
          // Don't check object methods with computed name.
          return;
        }
        const objType = parserServices.getContextualType(propNode.parent);
        if (objType == null) {
          // Expected object type is unknown.
          return;
        }
        const propSymbol = checker.getPropertyOfType(
          objType,
          propTsNode.name.text,
        );
        if (propSymbol == null) {
          // Expected object type is known, but it doesn't have this method.
          return;
        }
        const propExpectedType = checker.getTypeOfSymbolAtLocation(
          propSymbol,
          propTsNode,
        );
        if (isVoidReturningFunctionType(propExpectedType)) {
          reportIfNonVoidFunction(valueNode);
        }
        return;
      }

      // Object property is a regular property.
      checkExpressionNode(valueNode);
    }

    /**
     * Finds errors in a class property.
     *
     * In addition to the regular check against the contextual type,
     * we also check against the base class property (when the class extends another class)
     * and the implemented interfaces (when the class implements an interface).
     */
    function checkClassPropertyNode(
      propNode: TSESTree.PropertyDefinition,
    ): void {
      if (propNode.value == null) {
        return;
      }

      // Check in comparison to the base types.
      for (const { baseMemberType } of util.getBaseTypesOfClassMember(
        parserServices,
        propNode,
      )) {
        if (isVoidReturningFunctionType(baseMemberType)) {
          reportIfNonVoidFunction(propNode.value);
          return; // Report at most one error.
        }
      }

      // Check in comparison to the contextual type.
      checkExpressionNode(propNode.value);
    }

    /**
     * Finds errors in a class method.
     *
     * We check against the base class method (when the class extends another class)
     * and the implemented interfaces (when the class implements an interface).
     */
    function checkClassMethodNode(methodNode: TSESTree.MethodDefinition): void {
      if (
        methodNode.value.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression
      ) {
        return;
      }

      // Check in comparison to the base types.
      for (const { baseMemberType } of util.getBaseTypesOfClassMember(
        parserServices,
        methodNode,
      )) {
        if (isVoidReturningFunctionType(baseMemberType)) {
          reportIfNonVoidFunction(methodNode.value);
          return; // Report at most one error.
        }
      }
    }

    /**
     * Reports an error if the provided node is not allowed in a void function context.
     */
    function reportIfNonVoidFunction(funcNode: TSESTree.Expression): void {
      const allowedReturnType =
        ts.TypeFlags.Void |
        ts.TypeFlags.Never |
        ts.TypeFlags.Undefined |
        (options.allowReturnAny ? ts.TypeFlags.Any : 0);

      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(funcNode);
      const actualType = checker.getApparentType(
        checker.getTypeAtLocation(tsNode),
      );

      if (
        tsutils
          .getCallSignaturesOfType(actualType)
          .map(signature => signature.getReturnType())
          .flatMap(returnType => tsutils.unionConstituents(returnType))
          .every(type => tsutils.isTypeFlagSet(type, allowedReturnType))
      ) {
        // The function is already void.
        return;
      }

      if (
        funcNode.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
        funcNode.type !== AST_NODE_TYPES.FunctionExpression
      ) {
        // The provided function is not a function literal.
        // Report a generic error.
        return context.report({
          node: funcNode,
          messageId: `nonVoidFunc`,
        });
      }

      // The provided function is a function literal.

      if (funcNode.generator) {
        // The provided function is a generator function.
        // Generator functions are not allowed.
        return context.report({
          loc: util.getFunctionHeadLoc(funcNode, sourceCode),
          messageId: `nonVoidFunc`,
        });
      }

      if (funcNode.async) {
        // The provided function is an async function.
        // Async functions aren't allowed.
        return context.report({
          loc: util.getFunctionHeadLoc(funcNode, sourceCode),
          messageId: `asyncFunc`,
        });
      }

      if (funcNode.body.type !== AST_NODE_TYPES.BlockStatement) {
        // The provided function is an arrow function shorthand without braces.
        return context.report({
          node: funcNode.body,
          messageId: `nonVoidReturn`,
        });
      }

      // The function is a regular or arrow function with a block body.

      // Check return type annotation.
      if (funcNode.returnType != null) {
        // The provided function has an explicit return type annotation.
        const typeAnnotationNode = funcNode.returnType.typeAnnotation;
        if (typeAnnotationNode.type !== AST_NODE_TYPES.TSVoidKeyword) {
          // The explicit return type is not `void`.
          return context.report({
            node: typeAnnotationNode,
            messageId: `nonVoidFunc`,
          });
        }
      }

      // Iterate over all function's return statements.
      for (const statement of util.walkStatements(funcNode.body.body)) {
        if (
          statement.type !== AST_NODE_TYPES.ReturnStatement ||
          statement.argument == null
        ) {
          // We only care about return statements with a value.
          continue;
        }

        const returnType = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(statement.argument),
        );
        if (tsutils.isTypeFlagSet(returnType, allowedReturnType)) {
          // Only visit return statements with invalid type.
          continue;
        }

        // This return statement causes the non-void return type.
        const returnKeyword = util.nullThrows(
          sourceCode.getFirstToken(statement, {
            filter: token => token.value === 'return',
          }),
          util.NullThrowsReasons.MissingToken('return keyword', statement.type),
        );
        context.report({
          node: returnKeyword,
          messageId: `nonVoidReturn`,
        });
      }

      // No invalid returns found. The function is allowed.
    }
  },
});
