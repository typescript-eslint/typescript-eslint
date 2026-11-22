import type { Scope } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import type {
  ReportFixFunction,
  RuleFix,
  SourceCode,
} from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import { isTokenOnSameLine } from '@typescript-eslint/utils/ast-utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getContextualType,
  getDeclaration,
  getModifiers,
  getOperatorPrecedenceForNode,
  getParserServices,
  isNullableType,
  isParenthesized,
  isPropertyReadonlyInType,
  isStartOfArrowFunctionBodyNeedingParentheses,
  isStartOfExpressionStatementNeedingParentheses,
  isTypeFlagSet,
  isTypeLiteralType,
  nullThrows,
  NullThrowsReasons,
} from '../util';
import { getParentFunctionNode } from '../util/getParentFunctionNode';

export type Options = [
  {
    checkLiteralConstAssertions?: boolean;
    typesToIgnore?: string[];
  },
];
export type MessageIds =
  | 'contextuallyInferredTypeArguments'
  | 'contextuallyUnnecessary'
  | 'unnecessaryAssertion';

const MAX_TYPE_CONTAINS_DEPTH = 50;

/**
 * Whether a type has a type variable among its union or intersection
 * constituents, as in `T`, `T | undefined`, `T[K] | null`, or
 * `(T & string) | undefined`.
 */
function hasTypeVariableConstituent(type: ts.Type): boolean {
  return tsutils
    .unionConstituents(type)
    .some(part =>
      tsutils
        .intersectionConstituents(part)
        .some(member => isTypeFlagSet(member, ts.TypeFlags.Instantiable)),
    );
}

/**
 * Whether an expression whose first token is `firstToken`, placed at `node`'s
 * position, would start an `export default` and so be parsed as a function or
 * class declaration: a leading `function`, `class`, or `async function`.
 */
function isStartOfExportDefaultNeedingParentheses(
  node: TSESTree.Node,
  firstToken: TSESTree.Token,
  sourceCode: Readonly<SourceCode>,
): boolean {
  if (!startsDeclaration(firstToken, sourceCode)) {
    return false;
  }

  let current = node;
  while (!isParenthesized(current, sourceCode)) {
    const { parent } = current;
    if (parent == null) {
      return false;
    }
    if (parent.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
      return true;
    }
    if (parent.range[0] !== current.range[0]) {
      return false;
    }
    current = parent;
  }
  return false;
}

function startsDeclaration(
  firstToken: TSESTree.Token,
  sourceCode: Readonly<SourceCode>,
): boolean {
  if (firstToken.value === 'class' || firstToken.value === 'function') {
    return true;
  }
  if (firstToken.value !== 'async') {
    return false;
  }
  const nextToken = sourceCode.getTokenAfter(firstToken);
  // `async` followed by a line break is an identifier, not a modifier.
  return (
    nextToken?.value === 'function' && isTokenOnSameLine(firstToken, nextToken)
  );
}

function isConstAssertion(node: TSESTree.TypeNode): boolean {
  return (
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === 'const'
  );
}

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
      contextuallyInferredTypeArguments:
        'The type arguments for this generic call may be inferred from the assertion. Specify them explicitly instead.',
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
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
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
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
      expression: TSESTree.Expression,
      uncast: ts.Type,
      cast: ts.Type,
    ): boolean {
      if (uncast === cast) {
        return true;
      }

      if (
        node.typeAnnotation.type === AST_NODE_TYPES.TSIntersectionType &&
        containsTypeVariable(cast)
      ) {
        return false;
      }

      if (
        isTypeFlagSet(uncast, ts.TypeFlags.Undefined) &&
        isTypeFlagSet(cast, ts.TypeFlags.Undefined) &&
        tsutils.isCompilerOptionEnabled(
          compilerOptions,
          'exactOptionalPropertyTypes',
        )
      ) {
        return areUnionPartsEquivalentIgnoringUndefined(uncast, cast);
      }

      if (
        (isTypeFlagSet(uncast, ts.TypeFlags.NonPrimitive) &&
          !isTypeFlagSet(cast, ts.TypeFlags.NonPrimitive)) ||
        hasIndexSignature(uncast) !== hasIndexSignature(cast) ||
        isNumberToEnumAssertion(uncast, cast) ||
        containsAny(uncast) ||
        containsAny(cast) ||
        (containsTypeVariable(cast) && !containsTypeVariable(uncast))
      ) {
        return false;
      }

      if (
        isConceptuallyLiteral(expression) &&
        (expression.type !== AST_NODE_TYPES.ObjectExpression ||
          expression.properties.length === 0 ||
          cast
            .getProperties()
            .some(p => isTypeLiteral(checker.getTypeOfSymbol(p))))
      ) {
        return false;
      }

      if (cast.isIntersection() && !uncast.isIntersection()) {
        const castParts = cast.types;
        const otherPart = castParts.find(part => part !== uncast);
        if (
          tsutils.isTypeParameter(uncast) &&
          castParts.length === 2 &&
          castParts.some(part => part === uncast) &&
          otherPart != null &&
          isEmptyObjectType(otherPart) &&
          !containsTypeVariable(otherPart)
        ) {
          const constraint = checker.getBaseConstraintOfType(uncast);
          if (constraint && !isNullableType(constraint)) {
            return true;
          }
        }
        return false;
      }

      if (
        !hasSameProperties(uncast, cast) ||
        !haveSameTypeArguments(uncast, cast)
      ) {
        return false;
      }

      return areMutuallyAssignable(uncast, cast);
    }

    function isTypeLiteral(type: ts.Type): boolean {
      return isTypeLiteralType(type) || tsutils.isBooleanLiteralType(type);
    }

    function hasIndexSignature(type: ts.Type): boolean {
      return tsutils
        .unionConstituents(type)
        .some(part => checker.getIndexInfosOfType(part).length > 0);
    }

    // `number` and a numeric enum are assignable to each other, so they count
    // as mutually assignable even though the assertion changes the type:
    // `values[+key as Color]` compiles where `values[+key]` does not.
    function isNumberToEnumAssertion(uncast: ts.Type, cast: ts.Type): boolean {
      return (
        (hasEnumConstituent(cast) && hasPlainNumberConstituent(uncast)) ||
        (hasEnumConstituent(uncast) && hasPlainNumberConstituent(cast))
      );
    }

    function hasEnumConstituent(type: ts.Type): boolean {
      return tsutils
        .unionConstituents(type)
        .some(part => isTypeFlagSet(part, ts.TypeFlags.EnumLike));
    }

    function hasPlainNumberConstituent(type: ts.Type): boolean {
      return tsutils
        .unionConstituents(type)
        .some(
          part =>
            isTypeFlagSet(part, ts.TypeFlags.NumberLike) &&
            !isTypeFlagSet(part, ts.TypeFlags.EnumLike),
        );
    }

    function getTypeArguments(type: ts.Type): readonly ts.Type[] {
      return (
        type.aliasTypeArguments ??
        (tsutils.isTypeReference(type) ? checker.getTypeArguments(type) : [])
      );
    }

    // Recursive generic types instantiate new types forever, so give up past a fixed depth (#12705).
    function typeContains(
      type: ts.Type,
      predicate: (type: ts.Type) => boolean,
      seen = new Set<ts.Type>(),
      depth = 0,
    ): boolean {
      if (seen.has(type) || depth > MAX_TYPE_CONTAINS_DEPTH) {
        return false;
      }
      seen.add(type);
      if (predicate(type)) {
        return true;
      }
      if (type.isUnionOrIntersection()) {
        return type.types.some(t =>
          typeContains(t, predicate, seen, depth + 1),
        );
      }
      const nestedTypes = [
        ...getTypeArguments(type),
        ...type
          .getCallSignatures()
          .flatMap(sig => [
            sig.getReturnType(),
            ...sig.getParameters().map(p => checker.getTypeOfSymbol(p)),
          ]),
      ];
      return nestedTypes.some(t => typeContains(t, predicate, seen, depth + 1));
    }

    function containsAny(type: ts.Type): boolean {
      return typeContains(type, t => isTypeFlagSet(t, ts.TypeFlags.Any));
    }

    function containsTypeVariable(type: ts.Type): boolean {
      return typeContains(type, t =>
        isTypeFlagSet(t, ts.TypeFlags.TypeVariable | ts.TypeFlags.Index),
      );
    }

    function hasPhantomTypeArguments(type: ts.Type): boolean {
      return isEmptyObjectType(type) && getTypeArguments(type).length > 0;
    }

    function hasTypeParams(sig: ts.Signature): boolean {
      return (sig.getTypeParameters()?.length ?? 0) > 0;
    }

    function genericsMismatch(uncast: ts.Type, contextual: ts.Type): boolean {
      return contextual.getProperties().some(prop => {
        const contextualSigs = checker.getSignaturesOfType(
          checker.getTypeOfSymbol(prop),
          ts.SignatureKind.Call,
        );
        if (!contextualSigs.some(hasTypeParams)) {
          return false;
        }
        const uncastProp = uncast.getProperty(prop.getEscapedName() as string);
        if (!uncastProp) {
          return true;
        }
        return !checker
          .getSignaturesOfType(
            checker.getTypeOfSymbol(uncastProp),
            ts.SignatureKind.Call,
          )
          .some(hasTypeParams);
      });
    }

    function hasSameProperties(uncast: ts.Type, cast: ts.Type): boolean {
      const uncastProps = uncast.getProperties();
      const castProps = cast.getProperties();
      if (uncastProps.length !== castProps.length) {
        return false;
      }
      const castPropsByName = new Map(
        castProps.map(p => [p.getEscapedName(), p]),
      );
      return uncastProps.every(prop => {
        const castProp = castPropsByName.get(prop.getEscapedName());
        return (
          castProp != null &&
          isPropertyReadonlyInType(uncast, prop, checker) ===
            isPropertyReadonlyInType(cast, castProp, checker)
        );
      });
    }

    function haveSameTypeArguments(uncast: ts.Type, cast: ts.Type): boolean {
      const uncastArgs = getTypeArguments(uncast);
      const castArgs = getTypeArguments(cast);
      return (
        uncastArgs.length === castArgs.length &&
        uncastArgs.every((arg, i) => arg === castArgs[i])
      );
    }

    function areMutuallyAssignable(a: ts.Type, b: ts.Type): boolean {
      return (
        checker.isTypeAssignableTo(a, b) && checker.isTypeAssignableTo(b, a)
      );
    }

    function areUnionPartsEquivalentIgnoringUndefined(
      uncast: ts.Type,
      cast: ts.Type,
    ): boolean {
      const filterUndefined = (part: ts.Type): boolean =>
        !isTypeFlagSet(part, ts.TypeFlags.Undefined);
      const uncastParts = tsutils
        .unionConstituents(uncast)
        .filter(filterUndefined);
      const castParts = tsutils.unionConstituents(cast).filter(filterUndefined);
      if (uncastParts.length !== castParts.length) {
        return false;
      }
      const uncastPartsSet = new Set(uncastParts);
      return castParts.every(part => uncastPartsSet.has(part));
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
        isTypeUnchanged(node, innerExpression, originalType, castType) &&
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

    const CONCEPTUALLY_LITERAL_TYPES = new Set([
      AST_NODE_TYPES.Literal,
      AST_NODE_TYPES.ArrayExpression,
      AST_NODE_TYPES.ObjectExpression,
      AST_NODE_TYPES.TemplateLiteral,
      AST_NODE_TYPES.ClassExpression,
      AST_NODE_TYPES.FunctionExpression,
      AST_NODE_TYPES.ArrowFunctionExpression,
      AST_NODE_TYPES.JSXElement,
      AST_NODE_TYPES.JSXFragment,
    ]);

    function isConceptuallyLiteral(node: TSESTree.Node): boolean {
      return CONCEPTUALLY_LITERAL_TYPES.has(node.type);
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

    function isEmptyObjectType(type: ts.Type): boolean {
      return (
        isTypeFlagSet(type, ts.TypeFlags.NonPrimitive) ||
        (type.getProperties().length === 0 &&
          !type.getCallSignatures().length &&
          !type.getConstructSignatures().length &&
          !type.getStringIndexType() &&
          !type.getNumberIndexType())
      );
    }

    function hasGenericCallSignature(type: ts.Type): boolean {
      return type.getCallSignatures().some(hasTypeParams);
    }

    /**
     * Whether a call infers its type arguments from its arguments: it has no
     * explicit type arguments and its callee has a generic signature. A JSX
     * element is a call of its tag, with its attributes and children as the
     * props argument, and TypeScript resolves the tag's call signatures or,
     * for a class component, its construct signatures.
     */
    function isCallInferringTypeArguments(
      node:
        | TSESTree.CallExpression
        | TSESTree.JSXOpeningElement
        | TSESTree.NewExpression
        | TSESTree.TaggedTemplateExpression,
    ): boolean {
      if (node.typeArguments != null) {
        return false;
      }
      if (node.type === AST_NODE_TYPES.JSXOpeningElement) {
        const tagType = services.getTypeAtLocation(node.name);
        return [
          ...tagType.getCallSignatures(),
          ...tagType.getConstructSignatures(),
        ].some(hasTypeParams);
      }
      // An optional callee (`foo?.(...)`, with `foo` possibly undefined)
      // types as `<function> | undefined`, and a union exposes no signatures.
      const calleeType = services
        .getTypeAtLocation(
          node.type === AST_NODE_TYPES.TaggedTemplateExpression
            ? node.tag
            : node.callee,
        )
        .getNonNullableType();
      return (
        node.type === AST_NODE_TYPES.NewExpression
          ? calleeType.getConstructSignatures()
          : calleeType.getCallSignatures()
      ).some(hasTypeParams);
    }

    /**
     * Whether an expression is an argument, a tagged template's substitution,
     * or a JSX attribute's or child's value, of a call that infers its type
     * arguments from it. Its contextual type then comes from the inferred
     * signature, so changing the expression's type can change what's
     * inferred, and so the call's type.
     */
    function isArgumentToCallInferringTypeArguments(
      node: TSESTree.Node,
    ): boolean {
      const { parent } = node;
      switch (parent?.type) {
        case AST_NODE_TYPES.CallExpression:
        case AST_NODE_TYPES.NewExpression:
          return (
            parent.arguments.includes(
              node as TSESTree.CallExpressionArgument,
            ) && isCallInferringTypeArguments(parent)
          );
        case AST_NODE_TYPES.JSXExpressionContainer:
          switch (parent.parent.type) {
            case AST_NODE_TYPES.JSXAttribute:
              return isCallInferringTypeArguments(parent.parent.parent);
            case AST_NODE_TYPES.JSXElement:
              return isCallInferringTypeArguments(parent.parent.openingElement);
            default:
              return false;
          }
        case AST_NODE_TYPES.TemplateLiteral:
          return (
            parent.parent.type === AST_NODE_TYPES.TaggedTemplateExpression &&
            isCallInferringTypeArguments(parent.parent)
          );
        default:
          return false;
      }
    }

    /**
     * Whether an expression's value goes only into a declared type, such as an
     * annotated variable, an argument to a non-generic call, or the return of
     * a function with a declared return type, so its own type doesn't flow on
     * into the type of another expression or declaration. Positions whose type
     * flows out aren't declared, even when they have a contextual type: the
     * operand of `satisfies`, the left operand of `??` (`a! ?? b` is typed as
     * `a!`, without `b`), an argument to a generic call or JSX element that
     * infers its type arguments, and the return of a function without a
     * declared return type.
     *
     * A variable declared with a union type is still a declared destination,
     * even though TypeScript narrows the variable to the part of its union
     * that its initializer's type can be assigned to, so removing a `!` can
     * widen the variable's narrowed type, as it can for a concrete type such
     * as `string | undefined`.
     */
    function isInDeclaredDestination(node: TSESTree.Node): boolean {
      const parent = nullThrows(node.parent, NullThrowsReasons.MissingParent);
      switch (parent.type) {
        // These pass their operand's type on to their own position.
        case AST_NODE_TYPES.ArrayExpression:
        case AST_NODE_TYPES.ChainExpression:
          return isInDeclaredDestination(parent);
        case AST_NODE_TYPES.LogicalExpression:
          // `??` uses its right operand only when the left one may be
          // nullish, so the left one's type decides whether the right one's
          // type is part of the result. (The left of `&&` has no contextual
          // type, so it's never checked against one.)
          return (
            (parent.right === node || parent.operator !== '??') &&
            isInDeclaredDestination(parent)
          );
        case AST_NODE_TYPES.ConditionalExpression:
          return parent.test !== node && isInDeclaredDestination(parent);
        case AST_NODE_TYPES.SequenceExpression:
          return (
            parent.expressions.at(-1) === node &&
            isInDeclaredDestination(parent)
          );
        case AST_NODE_TYPES.Property:
          return (
            parent.value === node &&
            parent.parent.type === AST_NODE_TYPES.ObjectExpression &&
            isInDeclaredDestination(parent.parent)
          );
        case AST_NODE_TYPES.SpreadElement:
          return (
            (parent.parent.type === AST_NODE_TYPES.ArrayExpression ||
              parent.parent.type === AST_NODE_TYPES.ObjectExpression) &&
            isInDeclaredDestination(parent.parent)
          );
        case AST_NODE_TYPES.TSAsExpression:
        case AST_NODE_TYPES.TSTypeAssertion:
          // `as const` keeps its operand's type; other assertions replace it.
          return (
            !isConstAssertion(parent.typeAnnotation) ||
            isInDeclaredDestination(parent)
          );

        case AST_NODE_TYPES.ArrowFunctionExpression:
          return parent.body === node && isReturnTypeDeclared(parent);
        case AST_NODE_TYPES.ReturnStatement:
        case AST_NODE_TYPES.YieldExpression: {
          const functionNode = getParentFunctionNode(parent);
          return functionNode != null && isReturnTypeDeclared(functionNode);
        }

        case AST_NODE_TYPES.CallExpression:
        case AST_NODE_TYPES.NewExpression:
          return (
            parent.arguments.includes(
              node as TSESTree.CallExpressionArgument,
            ) && !isArgumentToCallInferringTypeArguments(node)
          );
        case AST_NODE_TYPES.JSXExpressionContainer:
        case AST_NODE_TYPES.TemplateLiteral:
          return !isArgumentToCallInferringTypeArguments(node);
        case AST_NODE_TYPES.AccessorProperty:
        case AST_NODE_TYPES.PropertyDefinition:
          return parent.value === node && parent.typeAnnotation != null;
        case AST_NODE_TYPES.AssignmentPattern:
          return parent.right === node && parent.left.typeAnnotation != null;
        case AST_NODE_TYPES.VariableDeclarator:
          return parent.init === node && parent.id.typeAnnotation != null;
        default:
          return false;
      }
    }

    /**
     * Whether a function's return type is declared, either by its own annotation
     * or by a declared type the function itself goes into.
     */
    function isReturnTypeDeclared(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): boolean {
      return (
        node.returnType != null ||
        (node.type !== AST_NODE_TYPES.FunctionDeclaration &&
          isInDeclaredDestination(node))
      );
    }

    function getInnermostCall(
      expression: TSESTree.Expression,
    ): TSESTree.CallExpression | undefined {
      switch (expression.type) {
        case AST_NODE_TYPES.AwaitExpression:
          return getInnermostCall(expression.argument);
        case AST_NODE_TYPES.CallExpression:
          return expression;
        case AST_NODE_TYPES.ChainExpression:
        case AST_NODE_TYPES.TSNonNullExpression:
          return getInnermostCall(expression.expression);
        case AST_NODE_TYPES.SequenceExpression:
          return getInnermostCall(
            nullThrows(
              expression.expressions.at(-1),
              'Expected SequenceExpression to have at least one expression',
            ),
          );
        default:
          return undefined;
      }
    }

    function isGenericCallWithInferredTypeArguments(
      expression: TSESTree.Expression,
    ): boolean {
      const call = getInnermostCall(expression);
      return (
        call != null &&
        call.typeArguments == null &&
        hasGenericCallSignature(services.getTypeAtLocation(call.callee))
      );
    }

    function isArgumentToOverloadedFunction(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): boolean {
      const { parent } = node;
      if (
        (parent.type !== AST_NODE_TYPES.CallExpression &&
          parent.type !== AST_NODE_TYPES.NewExpression) ||
        !parent.arguments.includes(node)
      ) {
        return false;
      }
      // An optional-chained callee (`foo?.bar(...)`) types as `<method> | undefined`,
      // and a union exposes no call signatures — strip the nullability first.
      const calleeType = services
        .getTypeAtLocation(parent.callee)
        .getNonNullableType();
      const signatures = calleeType.getCallSignatures();
      if (signatures.length <= 1) {
        return false;
      }

      const argIndex = parent.arguments.indexOf(node);
      const paramTypes = signatures.map(sig => {
        const params = sig.getParameters();
        if (argIndex >= params.length) {
          return undefined;
        }
        const param = params[argIndex];
        let paramType = checker.getTypeOfSymbol(param);
        if (
          param.valueDeclaration &&
          ts.isParameter(param.valueDeclaration) &&
          param.valueDeclaration.dotDotDotToken
        ) {
          const typeArgs = getTypeArguments(paramType);
          if (typeArgs.length > 0) {
            paramType = typeArgs[0];
          }
        }
        return paramType;
      });

      if (paramTypes.some(type => type == null)) {
        return true;
      }

      const definedParamTypes = paramTypes as ts.Type[];
      const firstParamType = definedParamTypes[0];
      if (definedParamTypes.every(type => type === firstParamType)) {
        return false;
      }

      const uncastType = services.getTypeAtLocation(node.expression);
      return !definedParamTypes.every(type =>
        checker.isTypeAssignableTo(uncastType, type),
      );
    }

    function isInDestructuringDeclaration(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): boolean {
      const { parent } = node;
      return (
        parent.type === AST_NODE_TYPES.VariableDeclarator &&
        parent.init === node &&
        (parent.id.type === AST_NODE_TYPES.ObjectPattern ||
          parent.id.type === AST_NODE_TYPES.ArrayPattern)
      );
    }

    function isPropertyInProblematicContext(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): boolean {
      const { parent } = node;
      if (parent.type !== AST_NODE_TYPES.Property || parent.value !== node) {
        return false;
      }
      const objectExpr = parent.parent;
      if (objectExpr.type !== AST_NODE_TYPES.ObjectExpression) {
        return false;
      }
      const objectTsNode = services.esTreeNodeToTSNodeMap.get(objectExpr);
      if (checker.getContextualType(objectTsNode)?.isUnion()) {
        const nodeTsNode = services.esTreeNodeToTSNodeMap.get(node);
        const propContextualType = checker.getContextualType(nodeTsNode);
        if (propContextualType == null) {
          return true;
        }
        const nonNullableContextualType =
          checker.getNonNullableType(propContextualType);
        if (nonNullableContextualType.isUnion()) {
          return true;
        }
        const uncastType = services.getTypeAtLocation(node.expression);
        return !checker.isTypeAssignableTo(
          uncastType,
          nonNullableContextualType,
        );
      }
      const objectParent = objectExpr.parent;
      return (
        objectParent.type === AST_NODE_TYPES.TSSatisfiesExpression ||
        (objectParent.type === AST_NODE_TYPES.CallExpression &&
          objectParent.parent.type === AST_NODE_TYPES.TSSatisfiesExpression)
      );
    }

    function isAssignmentInNonStatementContext(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): boolean {
      const { parent } = node;
      if (
        parent.type !== AST_NODE_TYPES.AssignmentExpression ||
        parent.right !== node
      ) {
        return false;
      }
      const assignmentParent = parent.parent;
      return assignmentParent.type !== AST_NODE_TYPES.ExpressionStatement;
    }

    function isRightHandSideOfLogicalAssignment(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): boolean {
      const { parent } = node;
      return (
        parent.type === AST_NODE_TYPES.AssignmentExpression &&
        parent.right === node &&
        (parent.operator === '&&=' ||
          parent.operator === '||=' ||
          parent.operator === '??=')
      );
    }

    function isInGenericContext(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): boolean {
      let seenFunction = false;
      for (
        let current: TSESTree.Node | undefined = node.parent;
        current;
        current = current.parent
      ) {
        if (current.type === AST_NODE_TYPES.FunctionDeclaration) {
          return false;
        }
        if (
          current.type === AST_NODE_TYPES.FunctionExpression ||
          current.type === AST_NODE_TYPES.ArrowFunctionExpression
        ) {
          if (current.body.type === AST_NODE_TYPES.BlockStatement) {
            return false;
          }
          if (seenFunction) {
            return false;
          }
          seenFunction = true;
        }
        if (
          current.type === AST_NODE_TYPES.CallExpression ||
          current.type === AST_NODE_TYPES.NewExpression
        ) {
          if (current.typeArguments != null) {
            continue;
          }
          if (
            current.type === AST_NODE_TYPES.CallExpression &&
            current.callee.type === AST_NODE_TYPES.MemberExpression &&
            current.arguments.includes(node)
          ) {
            continue;
          }
          const calleeType = checker.getTypeAtLocation(
            services.esTreeNodeToTSNodeMap.get(current.callee),
          );
          if (hasGenericCallSignature(calleeType)) {
            return true;
          }
        }
      }
      return false;
    }

    function hasPhantomTypeArgumentMismatch(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
      uncastType: ts.Type,
      contextualType: ts.Type,
    ): boolean {
      return (
        isInGenericContext(node) &&
        (hasPhantomTypeArguments(uncastType) ||
          hasPhantomTypeArguments(contextualType)) &&
        !haveSameTypeArguments(uncastType, contextualType)
      );
    }

    const SKIP_PARENT_TYPES = new Set([
      AST_NODE_TYPES.TSAsExpression,
      AST_NODE_TYPES.TSTypeAssertion,
      AST_NODE_TYPES.SpreadElement,
      AST_NODE_TYPES.TSSatisfiesExpression,
    ]);

    function shouldSkipContextualTypeFallback(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
      castIsAny: boolean,
    ): boolean {
      if (castIsAny) {
        return (
          node.parent.type === AST_NODE_TYPES.LogicalExpression ||
          isInGenericContext(node)
        );
      }

      /**
       * Interpolated template literals can be widened to `string` while contextual
       * typing still accepts them, so the assertion may be required.
       * @see https://github.com/typescript-eslint/typescript-eslint/issues/12276
       */
      if (isTemplateLiteralWithExpressions(node.expression)) {
        return true;
      }

      if (
        SKIP_PARENT_TYPES.has(node.parent.type) ||
        node.expression.type === AST_NODE_TYPES.ArrayExpression ||
        isInDestructuringDeclaration(node) ||
        isPropertyInProblematicContext(node) ||
        isAssignmentInNonStatementContext(node) ||
        isRightHandSideOfLogicalAssignment(node) ||
        isArgumentToOverloadedFunction(node)
      ) {
        return true;
      }

      if (isInGenericContext(node)) {
        const originalExpr = getOriginalExpression(node);
        return (
          !isConceptuallyLiteral(originalExpr) &&
          node.parent.type !== AST_NODE_TYPES.Property
        );
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

    function createAssertionFixer(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): ReportFixFunction {
      return fixer => {
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
          // Removing the angle brackets leaves the asserted operand at the
          // assertion's position, so its first token leads whatever the
          // assertion led. A leading `{`/`function`/`class` at the start of an
          // expression statement is parsed as a block / function or class
          // declaration, and a leading `{` at the start of a concise arrow body
          // is parsed as a block body. In those positions the operand must be
          // wrapped in parentheses to stay an expression.
          const firstOperandToken = nullThrows(
            context.sourceCode.getTokenAfter(closingAngleBracket),
            NullThrowsReasons.MissingToken('operand', 'type assertion'),
          );
          const needsParens =
            isStartOfExpressionStatementNeedingParentheses(
              node,
              firstOperandToken,
              context.sourceCode,
            ) ||
            isStartOfArrowFunctionBodyNeedingParentheses(
              node,
              firstOperandToken,
              context.sourceCode,
            ) ||
            isStartOfExportDefaultNeedingParentheses(
              node,
              firstOperandToken,
              context.sourceCode,
            );

          const fixes: RuleFix[] = [];
          if (needsParens) {
            fixes.push(fixer.insertTextBefore(node, '('));
          }
          fixes.push(
            fixer.removeRange([
              openingAngleBracket.range[0],
              closingAngleBracket.range[1],
            ]),
          );
          if (needsParens) {
            fixes.push(fixer.insertTextAfter(node, ')'));
          }
          return fixes;
        }
        const asToken = nullThrows(
          context.sourceCode.getTokenAfter(
            node.expression,
            token =>
              token.type === AST_TOKEN_TYPES.Identifier && token.value === 'as',
          ),
          NullThrowsReasons.MissingToken('>', 'type annotation'),
        );
        const tokenBeforeAs = nullThrows(
          context.sourceCode.getTokenBefore(asToken, {
            includeComments: true,
          }),
          NullThrowsReasons.MissingToken('comment', 'as'),
        );
        return fixer.removeRange([tokenBeforeAs.range[1], node.range[1]]);
      };
    }

    function reportDoubleAssertionIfUnnecessary(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
      contextualType: ts.Type | undefined,
    ): void {
      const doubleAssertionResult = isDoubleAssertionUnnecessary(
        node,
        contextualType,
      );
      if (doubleAssertionResult) {
        context.report({
          node,
          messageId: doubleAssertionResult,
          fix(fixer) {
            const originalExpr = getOriginalExpression(node);
            // Only the original expression's text is kept, so comments
            // elsewhere in the assertions would be dropped.
            if (
              context.sourceCode
                .getCommentsInside(node)
                .some(
                  comment =>
                    comment.range[1] <= originalExpr.range[0] ||
                    comment.range[0] >= originalExpr.range[1],
                )
            ) {
              return null;
            }

            // The original expression takes the assertion's position, so its
            // first token leads whatever the assertion led.
            const firstToken = nullThrows(
              context.sourceCode.getFirstToken(originalExpr),
              NullThrowsReasons.MissingToken('first token', 'expression'),
            );
            let text = context.sourceCode.getText(originalExpr);
            if (
              !isParenthesized(node, context.sourceCode) &&
              (getOperatorPrecedenceForNode(originalExpr) <
                getOperatorPrecedenceForNode(node) ||
                isStartOfExpressionStatementNeedingParentheses(
                  node,
                  firstToken,
                  context.sourceCode,
                ) ||
                isStartOfArrowFunctionBodyNeedingParentheses(
                  node,
                  firstToken,
                  context.sourceCode,
                ) ||
                isStartOfExportDefaultNeedingParentheses(
                  node,
                  firstToken,
                  context.sourceCode,
                ))
            ) {
              text = `(${text})`;
            }
            return fixer.replaceText(node, text);
          },
        });
      }
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
          node,
          node.expression,
          uncastType,
          castType,
        );
        const wouldSameTypeBeInferred = castTypeIsLiteral
          ? isImplicitlyNarrowedLiteralDeclaration(node)
          : !typeAnnotationIsConstAssertion;

        if (typeIsUnchanged && wouldSameTypeBeInferred) {
          if (isGenericCallWithInferredTypeArguments(node.expression)) {
            context.report({
              node,
              messageId: 'contextuallyInferredTypeArguments',
            });
          } else {
            context.report({
              node,
              messageId: 'unnecessaryAssertion',
              fix: createAssertionFixer(node),
            });
          }
          return;
        }

        const originalNode = services.esTreeNodeToTSNodeMap.get(node);

        const castIsAny =
          isTypeFlagSet(castType, ts.TypeFlags.Any) &&
          !SKIP_PARENT_TYPES.has(node.parent.type);

        const contextualType = shouldSkipContextualTypeFallback(node, castIsAny)
          ? undefined
          : checker.getContextualType(originalNode);

        if (contextualType) {
          const contextualTypeIsAny = isTypeFlagSet(
            contextualType,
            ts.TypeFlags.Any,
          );

          const isCallArgument =
            (node.parent.type === AST_NODE_TYPES.CallExpression ||
              node.parent.type === AST_NODE_TYPES.NewExpression) &&
            node.parent.arguments.includes(node);

          const anyInvolvedInContextualCheck = contextualTypeIsAny
            ? isCallArgument && !containsAny(castType)
            : !containsAny(contextualType);

          const isNullishLiteralToUnion =
            castType.isUnion() &&
            ((node.expression.type === AST_NODE_TYPES.Literal &&
              node.expression.value == null) ||
              (node.expression.type === AST_NODE_TYPES.Identifier &&
                node.expression.name === 'undefined'));

          const isContextuallyUnnecessary =
            !typeAnnotationIsConstAssertion &&
            !containsAny(uncastType) &&
            anyInvolvedInContextualCheck &&
            !hasPhantomTypeArgumentMismatch(node, uncastType, contextualType) &&
            (castIsAny || !genericsMismatch(uncastType, contextualType)) &&
            (contextualTypeIsAny ||
              checker.isTypeAssignableTo(uncastType, contextualType)) &&
            !isNullishLiteralToUnion;

          if (isContextuallyUnnecessary) {
            context.report({
              node,
              messageId: 'contextuallyUnnecessary',
              fix: createAssertionFixer(node),
            });
            return;
          }
        }

        reportDoubleAssertionIfUnnecessary(node, contextualType);
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

        const constrainedType = getConstrainedTypeAtLocation(
          services,
          node.expression,
        );
        const actualType = services.getTypeAtLocation(node.expression);

        // Check both the constrained type and the actual type.
        // If either is nullable, we should not report the assertion as unnecessary.
        // This handles cases like generic constraints with `any` where the
        // constrained type is `any` (nullable) but the actual type might be
        // a type parameter that TypeScript treats nominally.
        // See: https://github.com/typescript-eslint/typescript-eslint/issues/11559
        const actualTypeIsNullable = isNullableType(actualType);
        // A type that may be `null` or `undefined` only through a type
        // variable, such as an unconstrained `T`, `T | string`, or `T[K]`, has
        // no nullish flags, but the `!` still changes it (to `NonNullable<T>`).
        // Without `strictNullChecks`, the `!` never changes the type.
        const isNullishTypeVariable =
          !actualTypeIsNullable &&
          !isNullableType(constrainedType) &&
          checker.getNonNullableType(actualType) !== actualType;
        const constrainedTypeIsNullable =
          isNullishTypeVariable || isNullableType(constrainedType);

        if (!constrainedTypeIsNullable && !actualTypeIsNullable) {
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

          // If the constrained type differs from the actual type (e.g., when dealing
          // with unresolved generic type parameters), we should not report the assertion
          // as contextually unnecessary. TypeScript may still require the assertion
          // even if the constraint is nullable (like `any`).
          // See: https://github.com/typescript-eslint/typescript-eslint/issues/11559
          // A nullish type variable has a constraint that isn't nullable, and
          // is checked below against the receiver's type as written.
          if (!isNullishTypeVariable && constrainedType !== actualType) {
            return;
          }

          // The shared helper leaves out positions such as `return` and arrow
          // bodies. For a type variable, those positions also make the `!`
          // unnecessary when their type accepts it, but only if they're
          // declared: elsewhere, such as under `satisfies` or in an inferred
          // return, the `!` also changes the type that flows out.
          // For an argument to a generic call, the contextual type comes from
          // the signature inferred with the `!`, so it can't show the `!` is
          // unnecessary for a type variable.
          const contextualType =
            isNullishTypeVariable &&
            isArgumentToCallInferringTypeArguments(node)
              ? undefined
              : (getContextualType(checker, originalNode) ??
                (isNullishTypeVariable && isInDeclaredDestination(node)
                  ? checker.getContextualType(originalNode)
                  : undefined));
          if (contextualType) {
            // Nullish flags say nothing about a type variable in the type,
            // as in `T | undefined`, so the receiver must accept the whole
            // type without the `!`.
            if (
              isNullishTypeVariable || hasTypeVariableConstituent(actualType)
                ? !checker.isTypeAssignableTo(actualType, contextualType)
                : isTypeFlagSet(constrainedType, ts.TypeFlags.Unknown) &&
                  !isTypeFlagSet(contextualType, ts.TypeFlags.Unknown)
            ) {
              return;
            }

            // in strict mode you can't assign null to undefined, so we have to make sure that
            // the two types share a nullable type
            const typeIncludesUndefined = isTypeFlagSet(
              constrainedType,
              ts.TypeFlags.Undefined,
            );
            const typeIncludesNull = isTypeFlagSet(
              constrainedType,
              ts.TypeFlags.Null,
            );
            const typeIncludesVoid = isTypeFlagSet(
              constrainedType,
              ts.TypeFlags.Void,
            );

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
