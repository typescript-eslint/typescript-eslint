import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  ASTUtils,
} from '@typescript-eslint/utils';
import assert from 'assert';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import * as util from '../util';

type Options = [
  {
    considerOtherOverloads?: boolean;
    considerBaseClass?: boolean;
    considerImplementedInterfaces?: boolean;
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
  | 'ImplMember';

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
        'Value returned in a callback argument where a void callback was expected.',
      asyncFuncInArg:
        'Async callback passed as an argument where a void callback was expected.',
      asyncNoTryCatchFuncInArg:
        'Async callback not wrapped with a try-catch block and passed as an argument where a void callback was expected.',
      genFuncInArg:
        'Generator callback passed as an argument where a void callback was expected.',
      nonVoidFuncInArg:
        'Value-returning callback passed as an argument where a void callback was expected.',

      nonVoidReturnInArgOverload:
        'Value returned in a callback argument where one of the function signatures suggests it should be a void callback.',
      asyncFuncInArgOverload:
        'Async callback passed as an argument where one of the function signatures suggests it should be a void callback.',
      asyncNoTryCatchFuncInArgOverload:
        'Async callback not wrapped with a try-catch block and passed as an argument where one of the function signatures suggests it should be a void callback.',
      genFuncInArgOverload:
        'Generator callback passed as an argument where one of the function signatures suggests it should be a void callback.',
      nonVoidFuncInArgOverload:
        'Value-returning callback passed as an argument where one of the function signatures suggests it should be a void callback.',

      nonVoidReturnInAttr:
        'Value returned in a callback attribute where a void callback was expected.',
      asyncFuncInAttr:
        'Async callback passed as an attribute where a void callback was expected.',
      asyncNoTryCatchFuncInAttr:
        'Async callback not wrapped with a try-catch block and passed as an attribute where a void callback was expected.',
      genFuncInAttr:
        'Generator callback passed as an attribute where a void callback was expected.',
      nonVoidFuncInAttr:
        'Value-returning callback passed as an attribute where a void callback was expected.',

      // Also used for array elements
      nonVoidReturnInVar:
        'Value returned in a context where a void return was expected.',
      asyncFuncInVar:
        'Async function used in a context where a void function is expected.',
      asyncNoTryCatchFuncInVar:
        'Async function not wrapped with a try-catch block and used in a context where a void function is expected.',
      genFuncInVar:
        'Generator function used in a context where a void function is expected.',
      nonVoidFuncInVar:
        'Value-returning function used in a context where a void function is expected.',

      nonVoidReturnInProp:
        'Value returned in an object method which must be a void method.',
      asyncFuncInProp:
        'Async function provided as an object method which must be a void method.',
      asyncNoTryCatchFuncInProp:
        'Async function not wrapped with a try-catch block and provided as an object method which must be a void method.',
      genFuncInProp:
        'Generator function provided as an object method which must be a void method.',
      nonVoidFuncInProp:
        'Value-returning function provided as an object method which must be a void method.',

      nonVoidReturnInReturn:
        'Value returned in a callback returned from a function which must return a void callback',
      asyncFuncInReturn:
        'Async callback returned from a function which must return a void callback.',
      asyncNoTryCatchFuncInReturn:
        'Async callback not wrapped with a try-catch block and returned from a function which must return a void callback.',
      genFuncInReturn:
        'Generator callback returned from a function which must return a void callback.',
      nonVoidFuncInReturn:
        'Value-returning callback returned from a function which must return a void callback.',

      nonVoidReturnInExtMember:
        'Value returned in a method which overrides a void method.',
      asyncFuncInExtMember:
        'Overriding a void method with an async method is forbidden.',
      asyncNoTryCatchFuncInExtMember:
        'Overriding a void method with an async method requires wrapping the body in a try-catch block.',
      genFuncInExtMember:
        'Overriding a void method with a generator method is forbidden.',
      nonVoidFuncInExtMember:
        'Overriding a void method with a value-returning function is forbidden.',

      nonVoidReturnInImplMember:
        'Value returned in a method which implements a void method.',
      asyncFuncInImplMember:
        'Implementing a void method as an async method is forbidden.',
      asyncNoTryCatchFuncInImplMember:
        'Implementing a void method as an async method requires wrapping the body in a try-catch block.',
      genFuncInImplMember:
        'Implementing a void method as a generator method is forbidden.',
      nonVoidFuncInImplMember:
        'Implementing a void method as a value-returning function is forbidden.',

      suggestWrapInAsyncIIFE:
        'Wrap the function body in an immediately-invoked async function expression.',
      suggestWrapInTryCatch: 'Wrap the function body in a try-catch block.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          considerOtherOverloads: { type: 'boolean' },
          considerBaseClass: { type: 'boolean' },
          considerImplementedInterfaces: { type: 'boolean' },
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
      considerOtherOverloads: true,
      considerBaseClass: true,
      considerImplementedInterfaces: true,
      allowReturnPromiseIfTryCatch: true,
      allowReturnUndefined: true,
      allowReturnNull: true,
    },
  ],

  create(context, [options]) {
    const sourceCode = context.sourceCode;
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      'CallExpression, NewExpression': (
        node: TSESTree.CallExpression | TSESTree.NewExpression,
      ): void => {
        checkFunctionCallNode(node);
      },
      JSXExpressionContainer: (node): void => {
        if (node.expression.type !== AST_NODE_TYPES.JSXEmptyExpression) {
          checkExpressionNode(node.expression, 'Attr');
        }
      },
      VariableDeclarator: (node): void => {
        if (node.init != null) {
          checkExpressionNode(node.init, 'Var');
        }
      },
      AssignmentExpression: (node): void => {
        if (['=', '||=', '&&=', '??='].includes(node.operator)) {
          checkExpressionNode(node.right, 'Var');
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
            checkExpressionNode(elemNode, 'Var');
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
      PropertyDefinition: (node): void => {
        checkClassPropertyNode(node);
      },
      MethodDefinition: (node): void => {
        checkClassMethodNode(node);
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
        returnTypes.some(type =>
          tsutils.isTypeFlagSet(type, ts.TypeFlags.Void),
        ) &&
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
    ): boolean {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      assert(ts.isExpression(tsNode));
      const expectedType = checker.getContextualType(tsNode);

      if (expectedType != null && isVoidReturningFunctionType(expectedType)) {
        reportIfNonVoidFunction(node, msgId);
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
      for (const [argIdx, argNode] of callNode.arguments.entries()) {
        if (argNode.type === AST_NODE_TYPES.SpreadElement) {
          continue;
        }

        // Check against the contextual type first
        if (checkExpressionNode(argNode, 'Arg')) {
          continue;
        }

        // Check against the types from all of the call signatures
        if (options.considerOtherOverloads) {
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
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Indexing can return undefined
            .filter(param => param != null)
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
            reportIfNonVoidFunction(argNode, 'ArgOverload');
          }
          continue;
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
          reportIfNonVoidFunction(propNode.value, 'Prop');
        }
        return;
      }

      // Object property is a regular property.
      checkExpressionNode(propNode.value, 'Prop');
    }

    /**
     * Finds errors in a class property.
     *
     * In addition to the regular check against the contextual type,
     * we also check against the base class property (when the class extends another class)
     * and the implemented interfaces (when the class implements an interface).
     *
     * This can produce multiple errors at once.
     */
    function checkClassPropertyNode(
      propNode: TSESTree.PropertyDefinition,
    ): void {
      if (propNode.value == null) {
        return;
      }
      const propTsNode = parserServices.esTreeNodeToTSNodeMap.get(propNode);

      // Check in comparison to the base class property.
      if (options.considerBaseClass) {
        for (const basePropType of util.getBaseTypesOfClassMember(
          checker,
          propTsNode,
          ts.SyntaxKind.ExtendsKeyword,
        )) {
          if (isVoidReturningFunctionType(basePropType)) {
            reportIfNonVoidFunction(propNode.value, 'ExtMember');
          }
        }
      }

      // Check in comparison to the implemented interfaces.
      if (options.considerImplementedInterfaces) {
        for (const basePropType of util.getBaseTypesOfClassMember(
          checker,
          propTsNode,
          ts.SyntaxKind.ImplementsKeyword,
        )) {
          if (isVoidReturningFunctionType(basePropType)) {
            reportIfNonVoidFunction(propNode.value, 'ImplMember');
          }
        }
      }

      // Check in comparison to the contextual type.
      checkExpressionNode(propNode.value, 'Prop');
    }

    /**
     * Finds errors in a class method.
     *
     * We check against the base class method (when the class extends another class)
     * and the implemented interfaces (when the class implements an interface).
     *
     * This can produce multiple errors at once.
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

      // Check in comparison to the base class method.
      if (options.considerBaseClass) {
        for (const baseMethodType of util.getBaseTypesOfClassMember(
          checker,
          methodTsNode,
          ts.SyntaxKind.ExtendsKeyword,
        )) {
          if (isVoidReturningFunctionType(baseMethodType)) {
            reportIfNonVoidFunction(methodNode.value, 'ExtMember');
          }
        }
      }

      // Check in comparison to the implemented interfaces.
      if (options.considerImplementedInterfaces) {
        for (const baseMethodType of util.getBaseTypesOfClassMember(
          checker,
          methodTsNode,
          ts.SyntaxKind.ImplementsKeyword,
        )) {
          if (isVoidReturningFunctionType(baseMethodType)) {
            reportIfNonVoidFunction(methodNode.value, 'ImplMember');
          }
        }
      }
    }

    /**
     * Reports an error if the provided node is not allowed in a void function context.
     */
    function reportIfNonVoidFunction(
      funcNode: TSESTree.Expression,
      msgId: ErrorPlaceId,
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
            fix: fixer => removeGeneratorStarFix(fixer, funcNode),
          });
        }

        // Function body is not empty.
        // Report an error.
        return context.report({
          loc: util.getFunctionHeadLoc(funcNode, sourceCode),
          messageId: `genFuncIn${msgId}`,
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
