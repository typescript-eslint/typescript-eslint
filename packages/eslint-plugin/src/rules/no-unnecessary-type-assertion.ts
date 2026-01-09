import type { Scope } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import type { ReportFixFunction } from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getContextualType,
  getDeclaration,
  getModifiers,
  getParserServices,
  isNullableType,
  isTypeFlagSet,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export type Options = [
  {
    checkLiteralConstAssertions?: boolean;
    typesToIgnore?: string[];
  },
];
export type MessageIds = 'contextuallyUnnecessary' | 'unnecessaryAssertion';

export default createRule<Options, MessageIds>({
  name: 'no-unnecessary-type-assertion',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow type assertions that do not change the type of an expression',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      contextuallyUnnecessary:
        'This assertion is unnecessary since the receiver accepts the original type of the expression.',
      unnecessaryAssertion:
        'This assertion is unnecessary since it does not change the type of the expression.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkLiteralConstAssertions: {
            type: 'boolean',
            description: 'Whether to check literal const assertions.',
          },
          typesToIgnore: {
            type: 'array',
            description: 'A list of type names to ignore.',
            items: {
              type: 'string',
            },
          },
        },
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();

    /**
     * Returns true if there's a chance the variable has been used before a value has been assigned to it
     */
    function isPossiblyUsedBeforeAssigned(node: TSESTree.Expression): boolean {
      const declaration = getDeclaration(services, node);
      if (!declaration) {
        // don't know what the declaration is for some reason, so just assume the worst
        return true;
      }

      if (
        // non-strict mode doesn't care about used before assigned errors
        tsutils.isStrictCompilerOptionEnabled(
          compilerOptions,
          'strictNullChecks',
        ) &&
        // ignore class properties as they are compile time guarded
        // also ignore function arguments as they can't be used before defined
        ts.isVariableDeclaration(declaration)
      ) {
        // For var declarations, we need to check whether the node
        // is actually in a descendant of its declaration or not. If not,
        // it may be used before defined.

        // eg
        // if (Math.random() < 0.5) {
        //     var x: number  = 2;
        // } else {
        //     x!.toFixed();
        // }
        if (
          ts.isVariableDeclarationList(declaration.parent) &&
          // var
          declaration.parent.flags === ts.NodeFlags.None &&
          // If they are not in the same file it will not exist.
          // This situation must not occur using before defined.
          services.tsNodeToESTreeNodeMap.has(declaration)
        ) {
          const declaratorNode: TSESTree.VariableDeclaration =
            services.tsNodeToESTreeNodeMap.get(declaration);
          const scope = context.sourceCode.getScope(node);
          const declaratorScope = context.sourceCode.getScope(declaratorNode);
          let parentScope: Scope | null = declaratorScope;
          while ((parentScope = parentScope.upper)) {
            if (parentScope === scope) {
              return true;
            }
          }
        }

        if (
          // is it `const x!: number`
          declaration.initializer == null &&
          declaration.exclamationToken == null &&
          declaration.type != null
        ) {
          // check if the defined variable type has changed since assignment
          const declarationType = checker.getTypeFromTypeNode(declaration.type);
          const type = getConstrainedTypeAtLocation(services, node);
          if (
            declarationType === type &&
            // `declare`s are never narrowed, so never skip them
            !(
              ts.isVariableDeclarationList(declaration.parent) &&
              ts.isVariableStatement(declaration.parent.parent) &&
              tsutils.includesModifier(
                getModifiers(declaration.parent.parent),
                ts.SyntaxKind.DeclareKeyword,
              )
            )
          ) {
            // possibly used before assigned, so just skip it
            // better to false negative and skip it, than false positive and fix to compile erroring code
            //
            // no better way to figure this out right now
            // https://github.com/Microsoft/TypeScript/issues/31124
            return true;
          }
        }
      }
      return false;
    }

    function isConstAssertion(node: TSESTree.TypeNode): boolean {
      return (
        node.type === AST_NODE_TYPES.TSTypeReference &&
        node.typeName.type === AST_NODE_TYPES.Identifier &&
        node.typeName.name === 'const'
      );
    }

    function isTemplateLiteralWithExpressions(expression: TSESTree.Expression) {
      return (
        expression.type === AST_NODE_TYPES.TemplateLiteral &&
        expression.expressions.length !== 0
      );
    }

    function isImplicitlyNarrowedLiteralDeclaration({
      expression,
      parent,
    }: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion): boolean {
      /**
       * Even on `const` variable declarations, template literals with expressions can sometimes be widened without a type assertion.
       * @see https://github.com/typescript-eslint/typescript-eslint/issues/8737
       */
      if (isTemplateLiteralWithExpressions(expression)) {
        return false;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const maybeDeclarationNode = parent.parent!;

      return (
        (maybeDeclarationNode.type === AST_NODE_TYPES.VariableDeclaration &&
          maybeDeclarationNode.kind === 'const') ||
        (parent.type === AST_NODE_TYPES.PropertyDefinition && parent.readonly)
      );
    }

    function isTypeUnchanged(
      expression: TSESTree.Expression,
      uncast: ts.Type,
      cast: ts.Type,
    ): boolean {
      if (uncast === cast) {
        return true;
      }

      if (
        isTypeFlagSet(uncast, ts.TypeFlags.Undefined) &&
        isTypeFlagSet(cast, ts.TypeFlags.Undefined) &&
        tsutils.isCompilerOptionEnabled(
          compilerOptions,
          'exactOptionalPropertyTypes',
        )
      ) {
        const uncastParts = tsutils
          .unionConstituents(uncast)
          .filter(part => !isTypeFlagSet(part, ts.TypeFlags.Undefined));

        const castParts = tsutils
          .unionConstituents(cast)
          .filter(part => !isTypeFlagSet(part, ts.TypeFlags.Undefined));

        if (uncastParts.length !== castParts.length) {
          return false;
        }

        const uncastPartsSet = new Set(uncastParts);
        return castParts.every(part => uncastPartsSet.has(part));
      }

      if (isConceptuallyLiteral(expression)) {
        return false;
      }

      if (
        isTypeFlagSet(uncast, ts.TypeFlags.NonPrimitive) &&
        !isTypeFlagSet(cast, ts.TypeFlags.NonPrimitive)
      ) {
        return false;
      }

      if (hasIndexSignature(uncast) && !hasIndexSignature(cast)) {
        return false;
      }

      if (containsAny(uncast) || containsAny(cast)) {
        return false;
      }

      if (containsTypeVariable(cast) && !containsTypeVariable(uncast)) {
        return false;
      }

      if (!hasSameProperties(uncast, cast)) {
        return false;
      }

      const uncastTypeArgs = checker.getTypeArguments(
        uncast as ts.TypeReference,
      );
      const castTypeArgs = checker.getTypeArguments(cast as ts.TypeReference);
      if (uncastTypeArgs.length !== castTypeArgs.length) {
        return false;
      }
      for (let i = 0; i < uncastTypeArgs.length; i++) {
        if (uncastTypeArgs[i] !== castTypeArgs[i]) {
          return false;
        }
      }

      return (
        checker.isTypeAssignableTo(uncast, cast) &&
        checker.isTypeAssignableTo(cast, uncast)
      );
    }

    function hasSameProperties(uncast: ts.Type, cast: ts.Type): boolean {
      const uncastProps = uncast.getProperties();
      const castProps = cast.getProperties();

      if (uncastProps.length !== castProps.length) {
        return false;
      }

      return uncastProps.every(prop => {
        const name = prop.getEscapedName();
        return (
          tsutils.isPropertyReadonlyInType(uncast, name, checker) ===
          tsutils.isPropertyReadonlyInType(cast, name, checker)
        );
      });
    }

    function hasIndexSignature(type: ts.Type): boolean {
      return checker.getIndexInfosOfType(type).length > 0;
    }

    function containsAny(type: ts.Type): boolean {
      if (isTypeFlagSet(type, ts.TypeFlags.Any)) {
        return true;
      }
      const typeArgs = checker.getTypeArguments(type as ts.TypeReference);
      return typeArgs.length > 0 && typeArgs.some(containsAny);
    }

    function hasGenericSignature(type: ts.Type): boolean {
      return type.getProperties().some(prop => {
        const propType = checker.getTypeOfSymbol(prop);
        return checker
          .getSignaturesOfType(propType, ts.SignatureKind.Call)
          .some(sig => (sig.getTypeParameters()?.length ?? 0) > 0);
      });
    }

    function containsTypeVariable(type: ts.Type): boolean {
      if (isTypeFlagSet(type, ts.TypeFlags.TypeVariable | ts.TypeFlags.Index)) {
        return true;
      }

      if (type.isUnionOrIntersection()) {
        return type.types.some(containsTypeVariable);
      }

      return checker
        .getTypeArguments(type as ts.TypeReference)
        .some(containsTypeVariable);
    }

    function isTypeLiteral(type: ts.Type) {
      return type.isLiteral() || tsutils.isBooleanLiteralType(type);
    }

    function getOriginalExpression(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): TSESTree.Expression {
      let current = node.expression;
      while (
        current.type === AST_NODE_TYPES.TSAsExpression ||
        current.type === AST_NODE_TYPES.TSTypeAssertion
      ) {
        current = current.expression;
      }
      return current;
    }

    function isDoubleAssertionUnnecessary(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
      contextualType: ts.Type | undefined,
    ): false | MessageIds {
      const innerExpression = node.expression;
      if (
        innerExpression.type !== AST_NODE_TYPES.TSAsExpression &&
        innerExpression.type !== AST_NODE_TYPES.TSTypeAssertion
      ) {
        return false;
      }

      const originalExpr = getOriginalExpression(node);
      const originalType = services.getTypeAtLocation(originalExpr);
      const castType = services.getTypeAtLocation(node);

      if (
        isTypeUnchanged(innerExpression, originalType, castType) &&
        !isTypeFlagSet(castType, ts.TypeFlags.Any)
      ) {
        return 'unnecessaryAssertion';
      }

      if (contextualType) {
        const intermediateType = services.getTypeAtLocation(innerExpression);
        if (
          (isTypeFlagSet(intermediateType, ts.TypeFlags.Any) ||
            isTypeFlagSet(intermediateType, ts.TypeFlags.Unknown)) &&
          checker.isTypeAssignableTo(originalType, contextualType)
        ) {
          return 'contextuallyUnnecessary';
        }
      }

      return false;
    }

    function isConceptuallyLiteral(node: TSESTree.Node): boolean {
      switch (node.type) {
        case AST_NODE_TYPES.Literal:
        case AST_NODE_TYPES.ArrayExpression:
        case AST_NODE_TYPES.ObjectExpression:
        case AST_NODE_TYPES.TemplateLiteral:
        case AST_NODE_TYPES.ClassExpression:
        case AST_NODE_TYPES.FunctionExpression:
        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.JSXElement:
        case AST_NODE_TYPES.JSXFragment:
          return true;
        default:
          return false;
      }
    }

    function isIIFE(
      expression: TSESTree.Expression,
    ): expression is TSESTree.CallExpression & {
      callee: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression;
    } {
      return (
        expression.type === AST_NODE_TYPES.CallExpression &&
        (expression.callee.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          expression.callee.type === AST_NODE_TYPES.FunctionExpression)
      );
    }

    function shouldSkipContextualTypeFallback(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): boolean {
      const { parent } = node;

      if (
        parent.type === AST_NODE_TYPES.TSAsExpression ||
        parent.type === AST_NODE_TYPES.TSTypeAssertion ||
        parent.type === AST_NODE_TYPES.SpreadElement ||
        parent.type === AST_NODE_TYPES.TSSatisfiesExpression
      ) {
        return true;
      }

      if (node.expression.type === AST_NODE_TYPES.ArrayExpression) {
        return true;
      }

      if (
        parent.type === AST_NODE_TYPES.VariableDeclarator &&
        parent.init === node &&
        (parent.id.type === AST_NODE_TYPES.ObjectPattern ||
          parent.id.type === AST_NODE_TYPES.ArrayPattern)
      ) {
        return true;
      }

      if (parent.type === AST_NODE_TYPES.Property && parent.value === node) {
        const objectExpr = parent.parent;
        if (objectExpr.type === AST_NODE_TYPES.ObjectExpression) {
          const objectTsNode = services.esTreeNodeToTSNodeMap.get(objectExpr);
          const objectContextualType = checker.getContextualType(objectTsNode);
          if (objectContextualType?.isUnion()) {
            return true;
          }

          const objectParent = objectExpr.parent;
          if (objectParent.type === AST_NODE_TYPES.TSSatisfiesExpression) {
            return true;
          }
          if (
            objectParent.type === AST_NODE_TYPES.CallExpression &&
            objectParent.parent.type === AST_NODE_TYPES.TSSatisfiesExpression
          ) {
            return true;
          }
        }
      }

      if (
        parent.type === AST_NODE_TYPES.AssignmentExpression &&
        parent.right === node
      ) {
        let assignmentParent: TSESTree.Node = parent.parent;
        while (assignmentParent.type === AST_NODE_TYPES.ChainExpression) {
          assignmentParent = assignmentParent.parent;
        }
        if (assignmentParent.type !== AST_NODE_TYPES.ExpressionStatement) {
          return true;
        }
      }

      return false;
    }

    function getUncastType(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): ts.Type {
      // Special handling for IIFE: extract the function's return type
      if (isIIFE(node.expression)) {
        const callee = node.expression.callee;
        const functionType = services.getTypeAtLocation(callee);
        const signatures = functionType.getCallSignatures();

        if (signatures.length > 0) {
          const returnType = checker.getReturnTypeOfSignature(signatures[0]);

          // If the function has no explicit return type annotation and returns undefined,
          // treat it as void (TypeScript infers () => {} as () => undefined, but it should be void)
          if (
            callee.returnType == null &&
            isTypeFlagSet(returnType, ts.TypeFlags.Undefined)
          ) {
            return checker.getVoidType();
          }

          return returnType;
        }
      }

      return services.getTypeAtLocation(node.expression);
    }

    return {
      'TSAsExpression, TSTypeAssertion'(
        node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
      ): void {
        if (
          options.typesToIgnore?.includes(
            context.sourceCode.getText(node.typeAnnotation),
          )
        ) {
          return;
        }

        const castType = services.getTypeAtLocation(node);
        const castTypeIsLiteral = isTypeLiteral(castType);
        const typeAnnotationIsConstAssertion = isConstAssertion(
          node.typeAnnotation,
        );

        if (
          !options.checkLiteralConstAssertions &&
          castTypeIsLiteral &&
          typeAnnotationIsConstAssertion
        ) {
          return;
        }

        const uncastType = getUncastType(node);
        const typeIsUnchanged = isTypeUnchanged(
          node.expression,
          uncastType,
          castType,
        );
        const wouldSameTypeBeInferred = castTypeIsLiteral
          ? isImplicitlyNarrowedLiteralDeclaration(node)
          : !typeAnnotationIsConstAssertion;

        const fixFunction: ReportFixFunction = fixer => {
          if (node.type === AST_NODE_TYPES.TSTypeAssertion) {
            const openingAngleBracket = nullThrows(
              context.sourceCode.getTokenBefore(
                node.typeAnnotation,
                token =>
                  token.type === AST_TOKEN_TYPES.Punctuator &&
                  token.value === '<',
              ),
              NullThrowsReasons.MissingToken('<', 'type annotation'),
            );
            const closingAngleBracket = nullThrows(
              context.sourceCode.getTokenAfter(
                node.typeAnnotation,
                token =>
                  token.type === AST_TOKEN_TYPES.Punctuator &&
                  token.value === '>',
              ),
              NullThrowsReasons.MissingToken('>', 'type annotation'),
            );

            // < ( number ) > ( 3 + 5 )
            // ^---remove---^
            return fixer.removeRange([
              openingAngleBracket.range[0],
              closingAngleBracket.range[1],
            ]);
          }
          // `as` is always present in TSAsExpression
          const asToken = nullThrows(
            context.sourceCode.getTokenAfter(
              node.expression,
              token =>
                token.type === AST_TOKEN_TYPES.Identifier &&
                token.value === 'as',
            ),
            NullThrowsReasons.MissingToken('>', 'type annotation'),
          );
          const tokenBeforeAs = nullThrows(
            context.sourceCode.getTokenBefore(asToken, {
              includeComments: true,
            }),
            NullThrowsReasons.MissingToken('comment', 'as'),
          );

          // ( 3 + 5 )  as  number
          //          ^--remove--^
          return fixer.removeRange([tokenBeforeAs.range[1], node.range[1]]);
        };

        if (typeIsUnchanged && wouldSameTypeBeInferred) {
          context.report({
            node,
            messageId: 'unnecessaryAssertion',
            fix: fixFunction,
          });
          return;
        }

        const originalNode = services.esTreeNodeToTSNodeMap.get(node);

        const contextualType = shouldSkipContextualTypeFallback(node)
          ? undefined
          : (getContextualType(checker, originalNode) ??
            checker.getContextualType(originalNode));

        if (
          contextualType &&
          !typeAnnotationIsConstAssertion &&
          !containsAny(uncastType) &&
          !containsAny(contextualType) &&
          !hasGenericSignature(contextualType) &&
          checker.isTypeAssignableTo(uncastType, contextualType)
        ) {
          context.report({
            node,
            messageId: 'contextuallyUnnecessary',
            fix: fixFunction,
          });
          return;
        }

        const doubleAssertionResult = isDoubleAssertionUnnecessary(
          node,
          contextualType,
        );
        if (doubleAssertionResult) {
          const originalExpr = getOriginalExpression(node);
          context.report({
            node,
            messageId: doubleAssertionResult,
            fix(fixer) {
              let text = context.sourceCode.getText(originalExpr);

              if (originalExpr.type === AST_NODE_TYPES.ObjectExpression) {
                text = `(${text})`;
              }

              return fixer.replaceText(node, text);
            },
          });
        }
      },
      TSNonNullExpression(node): void {
        const removeExclamationFix: ReportFixFunction = fixer => {
          const exclamationToken = nullThrows(
            context.sourceCode.getLastToken(node, token => token.value === '!'),
            NullThrowsReasons.MissingToken(
              'exclamation mark',
              'non-null assertion',
            ),
          );

          return fixer.removeRange(exclamationToken.range);
        };

        if (
          node.parent.type === AST_NODE_TYPES.AssignmentExpression &&
          node.parent.operator === '='
        ) {
          if (node.parent.left === node) {
            context.report({
              node,
              messageId: 'contextuallyUnnecessary',
              fix: removeExclamationFix,
            });
          }
          // for all other = assignments we ignore non-null checks
          // this is because non-null assertions can change the type-flow of the code
          // so whilst they might be unnecessary for the assignment - they are necessary
          // for following code
          return;
        }

        const originalNode = services.esTreeNodeToTSNodeMap.get(node);

        const type = getConstrainedTypeAtLocation(services, node.expression);

        if (!isNullableType(type)) {
          if (
            node.expression.type === AST_NODE_TYPES.Identifier &&
            isPossiblyUsedBeforeAssigned(node.expression)
          ) {
            return;
          }

          context.report({
            node,
            messageId: 'unnecessaryAssertion',
            fix: removeExclamationFix,
          });
        } else {
          // we know it's a nullable type
          // so figure out if the variable is used in a place that accepts nullable types

          const contextualType = getContextualType(checker, originalNode);
          if (contextualType) {
            if (
              isTypeFlagSet(type, ts.TypeFlags.Unknown) &&
              !isTypeFlagSet(contextualType, ts.TypeFlags.Unknown)
            ) {
              return;
            }

            // in strict mode you can't assign null to undefined, so we have to make sure that
            // the two types share a nullable type
            const typeIncludesUndefined = isTypeFlagSet(
              type,
              ts.TypeFlags.Undefined,
            );
            const typeIncludesNull = isTypeFlagSet(type, ts.TypeFlags.Null);
            const typeIncludesVoid = isTypeFlagSet(type, ts.TypeFlags.Void);

            const contextualTypeIncludesUndefined = isTypeFlagSet(
              contextualType,
              ts.TypeFlags.Undefined,
            );
            const contextualTypeIncludesNull = isTypeFlagSet(
              contextualType,
              ts.TypeFlags.Null,
            );
            const contextualTypeIncludesVoid = isTypeFlagSet(
              contextualType,
              ts.TypeFlags.Void,
            );

            // make sure that the parent accepts the same types
            // i.e. assigning `string | null | undefined` to `string | undefined` is invalid
            const isValidUndefined = typeIncludesUndefined
              ? contextualTypeIncludesUndefined
              : true;
            const isValidNull = typeIncludesNull
              ? contextualTypeIncludesNull
              : true;
            const isValidVoid = typeIncludesVoid
              ? contextualTypeIncludesVoid
              : true;

            if (isValidUndefined && isValidNull && isValidVoid) {
              context.report({
                node,
                messageId: 'contextuallyUnnecessary',
                fix: removeExclamationFix,
              });
            }
          }
        }
      },
    };
  },
});
