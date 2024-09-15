import assert from 'node:assert';

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  ASTUtils,
} from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    allowReturnPromiseIfTryCatch?: boolean;
    allowReturnUndefined?: boolean;
    allowReturnNull?: boolean;
    allowReturnAny?: boolean;
  },
];

type ErrorPlaceId =
  | 'Arg'
  | 'ArgOverload'
  | 'Attr'
  | 'Var'
  | 'Prop'
  | 'Return'
  | 'ExtMember'
  | 'ImplMember'
  | 'Other';

type ErrorMessageId =
  | `nonVoidReturnIn${ErrorPlaceId}`
  | `asyncFuncIn${ErrorPlaceId}`
  | `asyncNoTryCatchFuncIn${ErrorPlaceId}`
  | `genFuncIn${ErrorPlaceId}`
  | `nonVoidFuncIn${ErrorPlaceId}`;

type SuggestionMessageId = 'suggestWrapInAsyncIIFE' | 'suggestWrapInTryCatch';

type MessageId = ErrorMessageId | SuggestionMessageId;

export default util.createRule<Options, MessageId>({
  name: 'strict-void-return',
  meta: {
    type: 'problem',
    fixable: 'code',
    hasSuggestions: true,
    docs: {
      description:
        'Disallow passing a value-returning function in a position accepting a void function',
      requiresTypeChecking: true,
    },
    messages: {
      nonVoidReturnInArg:
        'Value returned in a callback argument to `{{funcName}}`, which expects a void callback.',
      asyncFuncInArg:
        'Async callback passed as an argument to `{{funcName}}`, which expects a void callback.',
      asyncNoTryCatchFuncInArg:
        'Async callback not wrapped with a try-catch block and passed as an argument to `{{funcName}}`, which expects a void callback.',
      genFuncInArg:
        'Generator callback passed as an argument to `{{funcName}}`, which expects a void callback.',
      nonVoidFuncInArg:
        'Value-returning callback passed as an argument to `{{funcName}}`, which expects a void callback.',

      nonVoidReturnInArgOverload:
        'Value returned in a callback argument to `{{funcName}}`, whose other overload expects a void callback.',
      asyncFuncInArgOverload:
        'Async callback passed as an argument to `{{funcName}}`, whose other overload expects a void callback.',
      asyncNoTryCatchFuncInArgOverload:
        'Async callback not wrapped with a try-catch block and passed as an argument to `{{funcName}}`, whose other overload expects a void callback.',
      genFuncInArgOverload:
        'Generator callback passed as an argument to `{{funcName}}`, whose other overload expects a void callback.',
      nonVoidFuncInArgOverload:
        'Value-returning callback passed as an argument to `{{funcName}}`, whose other overload expects a void callback.',

      nonVoidReturnInAttr:
        'Value returned in `{{attrName}}` event handler prop of `{{elemName}}`, which expects a void `{{attrName}}` event handler.',
      asyncFuncInAttr:
        'Async event handler `{{attrName}}` passed as a prop to `{{elemName}}`, which expects a void `{{attrName}}` event handler.',
      asyncNoTryCatchFuncInAttr:
        'Async event handler `{{attrName}}` not wrapped with a try-catch block and passed as a prop to `{{elemName}}`, which expects a void `{{attrName}}` event handler.',
      genFuncInAttr:
        'Generator event handler `{{attrName}}` passed as a prop to `{{elemName}}`, which expects a void `{{attrName}}` event handler.',
      nonVoidFuncInAttr:
        'Value-returning event handler `{{attrName}}` passed as a prop to `{{elemName}}`, which expects a void `{{attrName}}` event handler.',

      nonVoidReturnInVar:
        'Value returned in `{{varName}}` function variable, which expects a void function.',
      asyncFuncInVar:
        'Async function assigned to `{{varName}}` variable, which expects a void function.',
      asyncNoTryCatchFuncInVar:
        'Async function not wrapped with a try-catch block and assigned to `{{varName}}` variable, which expects a void function.',
      genFuncInVar:
        'Generator function assigned to `{{varName}}` variable, which expects a void function.',
      nonVoidFuncInVar:
        'Value-returning function assigned to `{{varName}}` variable, which expects a void function.',

      nonVoidReturnInProp:
        'Value returned in `{{propName}}` method of an object, which expects a void `{{propName}}` method.',
      asyncFuncInProp:
        'Async function passed as `{{propName}}` method of an object, which expects a void `{{propName}}` method.',
      asyncNoTryCatchFuncInProp:
        'Async function not wrapped with a try-catch block and passed as `{{propName}}` method of an object, which expects a void `{{propName}}` method.',
      genFuncInProp:
        'Generator function passed as `{{propName}}` method of an object, which expects a void `{{propName}}` method.',
      nonVoidFuncInProp:
        'Value-returning function passed as `{{propName}}` method of an object, which expects a void `{{propName}}` method.',

      nonVoidReturnInReturn:
        'Value returned in a callback returned from a function, which must return a void callback',
      asyncFuncInReturn:
        'Async callback returned from a function, which must return a void callback.',
      asyncNoTryCatchFuncInReturn:
        'Async callback not wrapped with a try-catch block and returned from a function, which must return a void callback.',
      genFuncInReturn:
        'Generator callback returned from a function, which must return a void callback.',
      nonVoidFuncInReturn:
        'Value-returning callback returned from a function, which must return a void callback.',

      nonVoidReturnInExtMember:
        'Value returned in `{{memberName}}` method of `{{className}}`, whose base class `{{baseName}}` declares it as a void method.',
      asyncFuncInExtMember:
        'Async function provided as `{{memberName}}` method of `{{className}}`, whose base class `{{baseName}}` declares it as a void method.',
      asyncNoTryCatchFuncInExtMember:
        'Async function not wrapped with a try-catch block and provided as `{{memberName}}` method of `{{className}}`, whose base class `{{baseName}}` declares it as a void method.',
      genFuncInExtMember:
        'Generator function provided as `{{memberName}}` method of `{{className}}`, whose base class `{{baseName}}` declares it as a void method.',
      nonVoidFuncInExtMember:
        'Value-returning function provided as `{{memberName}}` method of `{{className}}`, whose base class `{{baseName}}` declares it as a void method.',

      nonVoidReturnInImplMember:
        'Value returned in `{{memberName}}` method of `{{className}}`, whose interface `{{baseName}}` declares it as a void method.',
      asyncFuncInImplMember:
        'Async function provided as `{{memberName}}` method of `{{className}}`, whose interface `{{baseName}}` declares it as a void method.',
      asyncNoTryCatchFuncInImplMember:
        'Async function not wrapped with a try-catch block and provided as `{{memberName}}` method of `{{className}}`, whose interface `{{baseName}}` declares it as a void method.',
      genFuncInImplMember:
        'Generator function provided as `{{memberName}}` method of `{{className}}`, whose interface `{{baseName}}` declares it as a void method.',
      nonVoidFuncInImplMember:
        'Value-returning function provided as `{{memberName}}` method of `{{className}}`, whose interface `{{baseName}}` declares it as a void method.',

      nonVoidReturnInOther:
        'Value returned in a context where a void return was expected.',
      asyncFuncInOther:
        'Async function used in a context where a void function was expected.',
      asyncNoTryCatchFuncInOther:
        'Async function not wrapped with a try-catch block and used in a context where a void function was expected.',
      genFuncInOther:
        'Generator function used in a context where a void function was expected.',
      nonVoidFuncInOther:
        'Value-returning function used in a context where a void function was expected.',

      suggestWrapInAsyncIIFE:
        'Wrap the function body in an immediately-invoked async function expression.',
      suggestWrapInTryCatch: 'Wrap the function body in a try-catch block.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowReturnPromiseIfTryCatch: { type: 'boolean' },
          allowReturnUndefined: { type: 'boolean' },
          allowReturnNull: { type: 'boolean' },
          allowReturnAny: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowReturnPromiseIfTryCatch: true,
      allowReturnUndefined: true,
      allowReturnNull: false,
    },
  ],

  create(context, [options]) {
    const sourceCode = context.sourceCode;
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
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
      ObjectExpression: (node): void => {
        for (const propNode of node.properties) {
          if (propNode.type !== AST_NODE_TYPES.SpreadElement) {
            checkObjectPropertyNode(propNode);
          }
        }
      },
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
      ReturnStatement: (node): void => {
        if (node.argument != null) {
          checkExpressionNode(node.argument, 'Return');
        }
      },
      PropertyDefinition: checkClassPropertyNode,
      MethodDefinition: checkClassMethodNode,
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
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      assert(ts.isExpression(tsNode));
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
      for (const [argIdx, argNode] of callNode.arguments.entries()) {
        if (argNode.type === AST_NODE_TYPES.SpreadElement) {
          continue;
        }

        // Check against the contextual type first
        if (checkExpressionNode(argNode, 'Arg', { funcName })) {
          continue;
        }

        // Check against the types from all of the call signatures
        const funcType = checker.getTypeAtLocation(callTsNode.expression);
        const funcSignatures = tsutils
          .unionTypeParts(funcType)
          .flatMap(type =>
            ts.isCallExpression(callTsNode)
              ? type.getCallSignatures()
              : type.getConstructSignatures(),
          );
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
          reportIfNonVoidFunction(argNode, 'ArgOverload', { funcName });
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
      propNode: TSESTree.Property | TSESTree.MethodDefinition,
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
        const objTsNode = propTsNode.parent;
        assert(ts.isObjectLiteralExpression(objTsNode));
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
          reportIfNonVoidFunction(propNode.value, 'Prop', { propName });
        }
        return;
      }

      // Object property is a regular property.
      checkExpressionNode(propNode.value, 'Prop', { propName });
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
      const propTsNode = parserServices.esTreeNodeToTSNodeMap.get(propNode);
      const memberName = sourceCode.getText(propNode.key);
      const className = propNode.parent.parent.id?.name ?? 'class';

      // Check in comparison to the base types.
      for (const {
        baseType,
        baseMemberType,
        heritageToken,
      } of util.getBaseTypesOfClassMember(checker, propTsNode)) {
        const baseName = baseType.getSymbol()?.name ?? 'base';
        if (isVoidReturningFunctionType(baseMemberType)) {
          const msgId: ErrorPlaceId =
            heritageToken === ts.SyntaxKind.ExtendsKeyword
              ? 'ExtMember'
              : 'ImplMember';
          reportIfNonVoidFunction(propNode.value, msgId, {
            memberName,
            className,
            baseName,
          });
          return; // Report at most one error.
        }
      }

      // Check in comparison to the contextual type.
      checkExpressionNode(propNode.value, 'Prop', { propName: memberName });
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
      const methodTsNode = parserServices.esTreeNodeToTSNodeMap.get(methodNode);
      if (
        methodTsNode.kind === ts.SyntaxKind.Constructor ||
        methodTsNode.kind === ts.SyntaxKind.GetAccessor ||
        methodTsNode.kind === ts.SyntaxKind.SetAccessor
      ) {
        return;
      }
      const memberName = sourceCode.getText(methodNode.key);
      const className = methodNode.parent.parent.id?.name ?? 'class';

      // Check in comparison to the base types.
      for (const {
        baseType,
        baseMemberType,
        heritageToken,
      } of util.getBaseTypesOfClassMember(checker, methodTsNode)) {
        const baseName = baseType.getSymbol()?.name ?? 'base';
        if (isVoidReturningFunctionType(baseMemberType)) {
          const msgId: ErrorPlaceId =
            heritageToken === ts.SyntaxKind.ExtendsKeyword
              ? 'ExtMember'
              : 'ImplMember';
          reportIfNonVoidFunction(methodNode.value, msgId, {
            memberName,
            className,
            baseName,
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
        (options.allowReturnUndefined ? ts.TypeFlags.Undefined : 0) |
        (options.allowReturnNull ? ts.TypeFlags.Null : 0) |
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

        assert(funcNode.type === AST_NODE_TYPES.FunctionExpression);
        if (funcNode.body.body.length === 0) {
          // Function body is empty.
          // Fix it by removing the generator star.
          return context.report({
            loc: util.getFunctionHeadLoc(funcNode, sourceCode),
            messageId: `genFuncIn${msgId}`,
            data,
            fix: fixer => removeGeneratorStarFix(fixer, funcNode),
          });
        }

        // Function body is not empty.
        // Report an error.
        return context.report({
          loc: util.getFunctionHeadLoc(funcNode, sourceCode),
          messageId: `genFuncIn${msgId}`,
          data,
        });
      }

      if (funcNode.async) {
        // The provided function is an async function.

        if (
          funcNode.body.type === AST_NODE_TYPES.BlockStatement
            ? funcNode.body.body.length === 0
            : !ASTUtils.hasSideEffect(funcNode.body, sourceCode)
        ) {
          // This async function is empty or has no side effects.
          // Fix it by removing the body and the async keyword.
          return context.report({
            loc: util.getFunctionHeadLoc(funcNode, sourceCode),
            messageId: `asyncFuncIn${msgId}`,
            data,
            fix: fixer => removeFuncBodyFix(fixer, funcNode),
          });
        }

        if (funcNode.body.type !== AST_NODE_TYPES.BlockStatement) {
          // This async function is an arrow function shorthand without braces.
          // It's not worth suggesting wrapping a single expression in a try-catch/IIFE.
          // Fix it by adding a void operator or braces.
          assert(funcNode.type === AST_NODE_TYPES.ArrowFunctionExpression);
          return context.report({
            loc: util.getFunctionHeadLoc(funcNode, sourceCode),
            messageId: `asyncFuncIn${msgId}`,
            data,
            fix: fixer =>
              options.allowReturnUndefined
                ? addVoidToArrowFix(fixer, funcNode)
                : addBracesToArrowFix(fixer, funcNode),
          });
        }

        // This async function has a block body.

        if (!options.allowReturnPromiseIfTryCatch) {
          // Async functions aren't allowed.
          // Suggest wrapping its body in an async IIFE.
          return context.report({
            loc: util.getFunctionHeadLoc(funcNode, sourceCode),
            messageId: `asyncFuncIn${msgId}`,
            data,
            suggest: [
              {
                messageId: 'suggestWrapInAsyncIIFE',
                fix: fixer => wrapFuncInAsyncIIFEFix(fixer, funcNode),
              },
            ],
          });
        }

        // Async functions are allowed if they are wrapped in a try-catch block.

        if (
          funcNode.body.body.length > 1 ||
          funcNode.body.body[0].type !== AST_NODE_TYPES.TryStatement ||
          funcNode.body.body[0].handler == null
        ) {
          // Function is not wrapped in a try-catch block.
          // Suggest wrapping it in a try-catch block in addition to async IIFE.
          return context.report({
            loc: util.getFunctionHeadLoc(funcNode, sourceCode),
            messageId: `asyncNoTryCatchFuncIn${msgId}`,
            data,
            suggest: [
              {
                messageId: 'suggestWrapInTryCatch',
                fix: fixer => wrapFuncInTryCatchFix(fixer, funcNode),
              },
              {
                messageId: 'suggestWrapInAsyncIIFE',
                fix: fixer => wrapFuncInAsyncIIFEFix(fixer, funcNode),
              },
            ],
          });
        }
      }

      // At this point the function is either a regular function,
      // or async with block body wrapped in try-catch (if allowed).

      if (funcNode.body.type !== AST_NODE_TYPES.BlockStatement) {
        // The provided function is an arrow function shorthand without braces.
        assert(funcNode.type === AST_NODE_TYPES.ArrowFunctionExpression);
        // Fix it by removing the body or adding a void operator or braces.
        return context.report({
          node: funcNode.body,
          messageId: `nonVoidReturnIn${msgId}`,
          data,
          fix: fixer =>
            !ASTUtils.hasSideEffect(funcNode.body, sourceCode)
              ? removeFuncBodyFix(fixer, funcNode)
              : options.allowReturnUndefined
                ? addVoidToArrowFix(fixer, funcNode)
                : addBracesToArrowFix(fixer, funcNode),
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
          // Fix it by changing the return type to `void` or `Promise<void>`.
          return context.report({
            node: typeAnnotationNode,
            messageId: `nonVoidFuncIn${msgId}`,
            data,
            fix: fixer =>
              fixer.replaceText(
                typeAnnotationNode,
                funcNode.async ? 'Promise<void>' : 'void',
              ),
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
        // Fix it by discarding the return value.
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
          fix: fixer =>
            util.discardReturnValueFix(
              fixer,
              sourceCode,
              statement,
              options.allowReturnUndefined,
            ),
        });
      }

      // No invalid returns found. The function is allowed.
    }

    function removeGeneratorStarFix(
      fixer: TSESLint.RuleFixer,
      funcNode: TSESTree.FunctionExpression,
    ): TSESLint.RuleFix {
      const funcHeadNode =
        funcNode.parent.type === AST_NODE_TYPES.Property ||
        funcNode.parent.type === AST_NODE_TYPES.MethodDefinition
          ? funcNode.parent
          : funcNode;
      const starToken = util.nullThrows(
        sourceCode.getFirstToken(funcHeadNode, {
          filter: token => token.value === '*',
        }),
        util.NullThrowsReasons.MissingToken('generator star', funcNode.type),
      );
      const beforeStarToken = util.nullThrows(
        sourceCode.getTokenBefore(starToken),
        util.NullThrowsReasons.MissingToken(
          'token before generator star',
          funcNode.type,
        ),
      );
      const afterStarToken = util.nullThrows(
        sourceCode.getTokenAfter(starToken),
        util.NullThrowsReasons.MissingToken(
          'token after generator star',
          funcNode.type,
        ),
      );
      if (
        sourceCode.isSpaceBetween(beforeStarToken, starToken) ||
        sourceCode.isSpaceBetween(starToken, afterStarToken) ||
        afterStarToken.type === AST_TOKEN_TYPES.Punctuator
      ) {
        // There is space between tokens or other token is a punctuator.
        // No space necessary after removing the star.
        return fixer.remove(starToken);
      }
      // Replace with space.
      return fixer.replaceText(starToken, ' ');
    }

    function removeAsyncKeywordFix(
      fixer: TSESLint.RuleFixer,
      funcNode: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression,
    ): TSESLint.RuleFix {
      const funcHeadNode =
        funcNode.parent.type === AST_NODE_TYPES.Property ||
        funcNode.parent.type === AST_NODE_TYPES.MethodDefinition
          ? funcNode.parent
          : funcNode;
      const asyncToken = util.nullThrows(
        sourceCode.getFirstToken(funcHeadNode, {
          filter: token => token.value === 'async',
        }),
        util.NullThrowsReasons.MissingToken('async keyword', funcNode.type),
      );
      const afterAsyncToken = util.nullThrows(
        sourceCode.getTokenAfter(asyncToken),
        util.NullThrowsReasons.MissingToken(
          'token after async keyword',
          funcNode.type,
        ),
      );
      return fixer.removeRange([asyncToken.range[0], afterAsyncToken.range[0]]);
    }

    function* removeFuncBodyFix(
      fixer: TSESLint.RuleFixer,
      funcNode: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression,
    ): Generator<TSESLint.RuleFix> {
      // Remove async keyword
      if (funcNode.async) {
        yield removeAsyncKeywordFix(fixer, funcNode);
      }
      // Replace return type with void
      if (funcNode.returnType != null) {
        yield fixer.replaceText(funcNode.returnType.typeAnnotation, 'void');
      }
      // Replace body with empty block
      const bodyRange = util.getRangeWithParens(funcNode.body, sourceCode);
      yield fixer.replaceTextRange(bodyRange, '{}');
    }

    function* wrapFuncInTryCatchFix(
      fixer: TSESLint.RuleFixer,
      funcNode: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression,
    ): Generator<TSESLint.RuleFix> {
      // Replace return type with Promise<void>
      if (funcNode.returnType != null) {
        assert(funcNode.async);
        yield fixer.replaceText(
          funcNode.returnType.typeAnnotation,
          'Promise<void>',
        );
      }
      // Wrap body in try-catch
      assert(funcNode.body.type === AST_NODE_TYPES.BlockStatement);
      const bodyRange = util.getRangeWithParens(funcNode.body, sourceCode);
      yield fixer.insertTextBeforeRange(bodyRange, '{ try ');
      yield fixer.insertTextAfterRange(bodyRange, ' catch {} }');
    }

    function* wrapFuncInAsyncIIFEFix(
      fixer: TSESLint.RuleFixer,
      funcNode: TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression,
    ): Generator<TSESLint.RuleFix> {
      // Remove async keyword
      yield removeAsyncKeywordFix(fixer, funcNode);
      // Replace return type with void
      if (funcNode.returnType != null) {
        yield fixer.replaceText(funcNode.returnType.typeAnnotation, 'void');
      }
      // Wrap body in async IIFE
      const bodyRange = util.getRangeWithParens(funcNode.body, sourceCode);
      if (
        funcNode.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        options.allowReturnUndefined
      ) {
        yield fixer.insertTextBeforeRange(bodyRange, 'void (async () => ');
        yield fixer.insertTextAfterRange(bodyRange, ')()');
      } else {
        yield fixer.insertTextBeforeRange(bodyRange, '{ (async () => ');
        yield fixer.insertTextAfterRange(bodyRange, ')(); }');
      }
    }

    function* addVoidToArrowFix(
      fixer: TSESLint.RuleFixer,
      funcNode: TSESTree.ArrowFunctionExpression,
    ): Generator<TSESLint.RuleFix> {
      // Remove async keyword
      if (funcNode.async) {
        yield removeAsyncKeywordFix(fixer, funcNode);
      }
      // Replace return type with void
      if (funcNode.returnType != null) {
        yield fixer.replaceText(funcNode.returnType.typeAnnotation, 'void');
      }
      // Add void operator
      yield util.getWrappingFixer({
        node: funcNode.body,
        sourceCode,
        wrap: code => `void ${code}`,
      })(fixer);
    }

    function* addBracesToArrowFix(
      fixer: TSESLint.RuleFixer,
      funcNode: TSESTree.ArrowFunctionExpression,
    ): Generator<TSESLint.RuleFix> {
      // Remove async keyword
      if (funcNode.async) {
        yield removeAsyncKeywordFix(fixer, funcNode);
      }
      // Replace return type with void
      if (funcNode.returnType != null) {
        yield fixer.replaceText(funcNode.returnType.typeAnnotation, 'void');
      }
      // Add braces
      yield util.addBracesToArrowFix(fixer, sourceCode, funcNode);
    }
  },
});
