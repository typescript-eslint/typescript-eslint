import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    allowReturnAny?: boolean;
    allowReturnPromiseIfTryCatch?: boolean;
  },
];

type ErrorPlaceId =
  | 'Arg'
  | 'Attr'
  | 'ExtMember'
  | 'ImplMember'
  | 'Other'
  | 'Return'
  | 'Var';

type MessageId =
  | `asyncFuncIn${ErrorPlaceId}`
  | `nonVoidFuncIn${ErrorPlaceId}`
  | `nonVoidReturnIn${ErrorPlaceId}`;

export default util.createRule<Options, MessageId>({
  name: 'strict-void-return',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow passing a value-returning function in a position accepting a void function',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    hasSuggestions: false,
    messages: {
      asyncFuncInArg:
        'Async callback passed as an argument to `{{funcName}}`, which expects a void callback.',
      asyncFuncInAttr:
        'Async event handler `{{attrName}}` passed as a prop to `{{elemName}}`, which expects a void event handler.',
      asyncFuncInExtMember:
        'Async function provided as `{{memberName}}` method of `{{className}}`, whose base class `{{baseName}}` declares it as a void method.',
      asyncFuncInImplMember:
        'Async function provided as `{{memberName}}` method of `{{className}}`, whose interface `{{baseName}}` declares it as a void method.',
      asyncFuncInOther:
        'Async function used in a context where a void function is expected.',
      asyncFuncInReturn:
        'Async callback returned from a function, which must return a void callback.',
      asyncFuncInVar:
        'Async function assigned to `{{varName}}`, which is declared as a void function.',

      nonVoidFuncInArg:
        'Value-returning callback passed as an argument to `{{funcName}}`, which expects a void callback.',
      nonVoidFuncInAttr:
        'Value-returning event handler `{{attrName}}` passed as a prop to `{{elemName}}`, which expects a void event handler.',
      nonVoidFuncInExtMember:
        'Value-returning function provided as `{{memberName}}` method of `{{className}}`, whose base class `{{baseName}}` declares it as a void method.',
      nonVoidFuncInImplMember:
        'Value-returning function provided as `{{memberName}}` method of `{{className}}`, whose interface `{{baseName}}` declares it as a void method.',
      nonVoidFuncInOther:
        'Value-returning function used in a context where a void function is expected.',
      nonVoidFuncInReturn:
        'Value-returning callback returned from a function, which must return a void callback.',
      nonVoidFuncInVar:
        'Value-returning function assigned to `{{varName}}`, which is declared as a void function.',

      nonVoidReturnInArg:
        'Value returned in a callback argument to `{{funcName}}`, which expects a void callback.',
      nonVoidReturnInAttr:
        'Value returned in `{{attrName}}` event handler prop of `{{elemName}}`, which expects a void event handler.',
      nonVoidReturnInExtMember:
        'Value returned in `{{memberName}}` method of `{{className}}`, whose base class `{{baseName}}` declares it as a void method.',
      nonVoidReturnInImplMember:
        'Value returned in `{{memberName}}` method of `{{className}}`, whose interface `{{baseName}}` declares it as a void method.',
      nonVoidReturnInOther:
        'Value returned in a context where a void return is expected.',
      nonVoidReturnInReturn:
        'Value returned in a callback returned from a function, which must return a void callback.',
      nonVoidReturnInVar:
        'Value returned in `{{varName}}`, which is declared as a void function.',
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
          allowReturnPromiseIfTryCatch: {
            type: 'boolean',
            description:
              'Whether to allow functions returning a promise if the function is na async function expression whose whole body is wrapped in a try-catch block. This offers an alternative to an async IIFE for handling errors in async callbacks.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowReturnAny: false,
      allowReturnPromiseIfTryCatch: true,
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
            checkExpressionNode(elemNode, 'Other');
          }
        }
      },
      ArrowFunctionExpression: (node): void => {
        if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
          checkExpressionNode(node.body, 'Return');
        }
      },
      AssignmentExpression: (node): void => {
        if (['=', '||=', '&&=', '??='].includes(node.operator)) {
          const varName = util.getNameFromExpression(sourceCode, node.left);
          if (varName != null) {
            checkExpressionNode(node.right, 'Var', { varName });
          } else {
            checkExpressionNode(node.right, 'Other');
          }
        }
      },
      'CallExpression, NewExpression': checkFunctionCallNode,
      JSXAttribute: (node): void => {
        if (
          node.value?.type === AST_NODE_TYPES.JSXExpressionContainer &&
          node.value.expression.type !== AST_NODE_TYPES.JSXEmptyExpression
        ) {
          const attrName = sourceCode.getText(node.name);
          const elemName = sourceCode.getText(node.parent.name);
          checkExpressionNode(node.value.expression, 'Attr', {
            attrName,
            elemName,
          });
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
          checkExpressionNode(node.argument, 'Return');
        }
      },
      VariableDeclarator: (node): void => {
        if (node.init != null) {
          const varName = util.getNameFromExpression(sourceCode, node.id);
          if (varName != null) {
            checkExpressionNode(node.init, 'Var', { varName });
          } else {
            checkExpressionNode(node.init, 'Other');
          }
        }
      },
    };

    /** Checks whether the type is a void-returning function type. */
    function isVoidReturningFunctionType(type: ts.Type): boolean {
      const returnTypes = tsutils
        .getCallSignaturesOfType(type)
        .flatMap(signature =>
          tsutils.unionTypeParts(signature.getReturnType()),
        );
      return (
        // At least one return type is void
        returnTypes.some(type =>
          tsutils.isTypeFlagSet(type, ts.TypeFlags.Void),
        ) &&
        // The rest are nullish or any
        returnTypes.every(type =>
          tsutils.isTypeFlagSet(
            type,
            ts.TypeFlags.VoidLike |
              ts.TypeFlags.Undefined |
              ts.TypeFlags.Null |
              ts.TypeFlags.Any |
              ts.TypeFlags.Never,
          ),
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
    function checkExpressionNode(
      node: TSESTree.Expression,
      msgId: ErrorPlaceId,
      data?: Record<string, string>,
    ): boolean {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(
        node,
      ) as ts.Expression;
      const expectedType = checker.getContextualType(tsNode);

      if (expectedType != null && isVoidReturningFunctionType(expectedType)) {
        reportIfNonVoidFunction(node, msgId, data);
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
      const funcName =
        util.getNameFromExpression(sourceCode, callNode.callee) ?? 'function';

      const callTsNode = parserServices.esTreeNodeToTSNodeMap.get(callNode);

      const funcType = checker.getTypeAtLocation(callTsNode.expression);
      const funcSignatures = tsutils
        .unionTypeParts(funcType)
        .flatMap(type =>
          ts.isCallExpression(callTsNode)
            ? type.getCallSignatures()
            : type.getConstructSignatures(),
        );

      for (const [argIdx, argNode] of callNode.arguments.entries()) {
        if (argNode.type === AST_NODE_TYPES.SpreadElement) {
          continue;
        }

        // Check against the contextual type first
        if (checkExpressionNode(argNode, 'Arg', { funcName })) {
          continue;
        }

        // Check against the types from all of the call signatures
        const argExpectedReturnTypes = funcSignatures
          .map(s => s.parameters[argIdx])
          .filter(Boolean)
          .map(param =>
            checker.getTypeOfSymbolAtLocation(param, callTsNode.expression),
          )
          .flatMap(paramType => tsutils.unionTypeParts(paramType))
          .flatMap(paramType => paramType.getCallSignatures())
          .map(paramSignature => paramSignature.getReturnType());
        if (
          // At least one return type is void
          argExpectedReturnTypes.some(type =>
            tsutils.isTypeFlagSet(type, ts.TypeFlags.Void),
          ) &&
          // The rest are nullish or any
          argExpectedReturnTypes.every(type =>
            tsutils.isTypeFlagSet(
              type,
              ts.TypeFlags.VoidLike |
                ts.TypeFlags.Undefined |
                ts.TypeFlags.Null |
                ts.TypeFlags.Any |
                ts.TypeFlags.Never,
            ),
          )
        ) {
          // We treat this argument as void even though it might be technically any.
          reportIfNonVoidFunction(argNode, 'Arg', { funcName });
        }
      }
    }

    /**
     * Finds errors in an object property.
     *
     * Object properties require different logic
     * when the property is a method shorthand.
     */
    function checkObjectPropertyNode(
      propNode: TSESTree.MethodDefinition | TSESTree.Property,
    ): void {
      if (
        propNode.value.type === AST_NODE_TYPES.AssignmentPattern ||
        propNode.value.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression
      ) {
        return;
      }
      const propName = sourceCode.getText(propNode.key);
      const propTsNode = parserServices.esTreeNodeToTSNodeMap.get(propNode);

      if (propTsNode.kind === ts.SyntaxKind.MethodDeclaration) {
        // Object property is a method shorthand.

        if (propTsNode.name.kind === ts.SyntaxKind.ComputedPropertyName) {
          // Don't check object methods with computed name.
          return;
        }
        const objTsNode = propTsNode.parent as ts.ObjectLiteralExpression;
        const objType = checker.getContextualType(objTsNode);
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
          reportIfNonVoidFunction(propNode.value, 'Var', { varName: propName });
        }
        return;
      }

      // Object property is a regular property.
      checkExpressionNode(propNode.value, 'Var', { varName: propName });
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
      const memberName = sourceCode.getText(propNode.key);
      const className = propNode.parent.parent.id?.name ?? 'class';

      // Check in comparison to the base types.
      for (const {
        baseMemberType,
        baseType,
        heritageToken,
      } of util.getBaseTypesOfClassMember(parserServices, propNode)) {
        const baseName = baseType.getSymbol()?.name ?? 'base';
        if (isVoidReturningFunctionType(baseMemberType)) {
          const msgId: ErrorPlaceId =
            heritageToken === ts.SyntaxKind.ExtendsKeyword
              ? 'ExtMember'
              : 'ImplMember';
          reportIfNonVoidFunction(propNode.value, msgId, {
            baseName,
            className,
            memberName,
          });
          return; // Report at most one error.
        }
      }

      // Check in comparison to the contextual type.
      checkExpressionNode(propNode.value, 'Var', { varName: memberName });
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
      if (methodNode.kind !== 'method') {
        return;
      }
      const memberName = sourceCode.getText(methodNode.key);
      const className = methodNode.parent.parent.id?.name ?? 'class';

      // Check in comparison to the base types.
      for (const {
        baseMemberType,
        baseType,
        heritageToken,
      } of util.getBaseTypesOfClassMember(parserServices, methodNode)) {
        const baseName = baseType.getSymbol()?.name ?? 'base';
        if (isVoidReturningFunctionType(baseMemberType)) {
          const msgId: ErrorPlaceId =
            heritageToken === ts.SyntaxKind.ExtendsKeyword
              ? 'ExtMember'
              : 'ImplMember';
          reportIfNonVoidFunction(methodNode.value, msgId, {
            baseName,
            className,
            memberName,
          });
          return; // Report at most one error.
        }
      }
    }

    /**
     * Reports an error if the provided node is not allowed in a void function context.
     */
    function reportIfNonVoidFunction(
      funcNode: TSESTree.Expression,
      msgId: ErrorPlaceId,
      data?: Record<string, string>,
    ): void {
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
          .flatMap(returnType => tsutils.unionTypeParts(returnType))
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
          messageId: `nonVoidFuncIn${msgId}`,
          data,
        });
      }

      // The provided function is a function literal.

      if (funcNode.generator) {
        // The provided function is a generator function.
        // Generator functions are not allowed.
        return context.report({
          loc: util.getFunctionHeadLoc(funcNode, sourceCode),
          messageId: `nonVoidFuncIn${msgId}`,
          data,
        });
      }

      if (funcNode.async) {
        // The provided function is an async function.

        if (!options.allowReturnPromiseIfTryCatch) {
          // Async functions aren't allowed.
          // TODO: Suggest wrapping its body in an async IIFE.
          return context.report({
            loc: util.getFunctionHeadLoc(funcNode, sourceCode),
            messageId: `asyncFuncIn${msgId}`,
            data,
          });
        }

        // Async functions are allowed if they are wrapped in a try-catch block.

        if (
          funcNode.body.type !== AST_NODE_TYPES.BlockStatement ||
          funcNode.body.body.length !== 1 ||
          funcNode.body.body[0].type !== AST_NODE_TYPES.TryStatement ||
          funcNode.body.body[0].handler == null
        ) {
          // Function is not wrapped in a try-catch block.
          // TODO: Suggest wrapping it in a try-catch block in addition to async IIFE.
          return context.report({
            loc: util.getFunctionHeadLoc(funcNode, sourceCode),
            messageId: `asyncFuncIn${msgId}`,
            data,
          });
        }
      }

      // At this point the function is either a regular function,
      // or async with block body wrapped in try-catch (if allowed).

      if (funcNode.body.type !== AST_NODE_TYPES.BlockStatement) {
        // The provided function is an arrow function shorthand without braces.
        // TODO: Fix it by removing the body or adding a void operator or braces.
        return context.report({
          node: funcNode.body,
          messageId: `nonVoidReturnIn${msgId}`,
          data,
        });
      }

      // The function is a regular or arrow function with a block body.
      // Possibly async and wrapped in try-catch if allowed.

      // Check return type annotation.
      if (funcNode.returnType != null) {
        // The provided function has an explicit return type annotation.
        const typeAnnotationNode = funcNode.returnType.typeAnnotation;
        if (
          !(
            typeAnnotationNode.type === AST_NODE_TYPES.TSVoidKeyword ||
            (funcNode.async &&
              typeAnnotationNode.type === AST_NODE_TYPES.TSTypeReference &&
              typeAnnotationNode.typeName.type === AST_NODE_TYPES.Identifier &&
              typeAnnotationNode.typeName.name === 'Promise' &&
              typeAnnotationNode.typeArguments?.params[0].type ===
                AST_NODE_TYPES.TSVoidKeyword)
          )
        ) {
          // The explicit return type is not `void` or `Promise<void>`.
          // TODO: Fix it by changing the return type to `void` or `Promise<void>`.
          return context.report({
            node: typeAnnotationNode,
            messageId: `nonVoidFuncIn${msgId}`,
            data,
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
        // TODO: Fix it by discarding the return value.
        const returnKeyword = util.nullThrows(
          sourceCode.getFirstToken(statement, {
            filter: token => token.value === 'return',
          }),
          util.NullThrowsReasons.MissingToken('return keyword', statement.type),
        );
        context.report({
          node: returnKeyword,
          messageId: `nonVoidReturnIn${msgId}`,
          data,
        });
      }

      // No invalid returns found. The function is allowed.
    }
  },
});
