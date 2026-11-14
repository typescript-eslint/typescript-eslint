import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  forEachReturnStatement,
  getParserServices,
  hasOverloadSignatures,
  isNullableType,
  isPromiseLike,
  isSymbolFromDefaultLibrary,
  isTypeAnyType,
  isTypeNeverType,
  isTypeUnknownType,
} from '../util';

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

type ClassMemberDeclaration =
  | ts.GetAccessorDeclaration
  | ts.MethodDeclaration
  | ts.PropertyDeclaration
  | ts.SetAccessorDeclaration;

/**
 * A type written inside a return type, such as the element type of an array
 * type.
 */
interface TypeComponent {
  /** Reads the same position of a returned type, if the type has one. */
  read: (type: ts.Type) => ts.Type | undefined;
  typeNode: TSESTree.TypeNode;
}

export default createRule({
  name: 'no-misleading-return-type',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow return type annotations containing types not required by returned expressions',
      requiresTypeChecking: true,
    },
    messages: {
      unnecessaryType: 'No returned expression requires this type.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const isNoUncheckedIndexedAccess = tsutils.isCompilerOptionEnabled(
      services.program.getCompilerOptions(),
      'noUncheckedIndexedAccess',
    );

    // Default library interfaces that are also satisfied by types that do not
    // instantiate them: an array is an `ArrayLike`.
    const structuralReaders = new Map([
      ['Array', getArrayElementType],
      ['ArrayLike', getArrayElementType],
      ['PromiseLike', getPromisedType],
      ['ReadonlyArray', getArrayElementType],
    ]);

    function getUnionMembers(type: TSESTree.TypeNode): TSESTree.TypeNode[] {
      return type.type === AST_NODE_TYPES.TSUnionType
        ? type.types.flatMap(getUnionMembers)
        : [type];
    }

    function isAnyOrUnknown(type: ts.Type): boolean {
      return isTypeAnyType(type) || isTypeUnknownType(type);
    }

    /**
     * Splits types into their union constituents. Returns `null` when they
     * show nothing about a value: `any` and `unknown` are compatible with
     * every type, and `never` has no value.
     */
    function getConstituents(types: readonly ts.Type[]): ts.Type[] | null {
      const constituents = types
        .flatMap(type => tsutils.unionConstituents(type))
        .filter(type => !isTypeNeverType(type));

      return constituents.length === 0 || constituents.some(isAnyOrUnknown)
        ? null
        : constituents;
    }

    function isReturnedTypeAssignableTo(
      returnedType: ts.Type,
      type: ts.Type,
    ): boolean {
      // A fresh object literal type is checked for excess properties, which
      // one union constituent can fail when the whole union does not.
      return checker.isTypeAssignableTo(
        tsutils.isObjectType(returnedType) &&
          tsutils.isObjectFlagSet(returnedType, ts.ObjectFlags.ObjectLiteral)
          ? checker.getWidenedType(returnedType)
          : returnedType,
        type,
      );
    }

    /**
     * Whether a member is read through an index signature, as an array element
     * is. TypeScript only adds `undefined` to the type of such a member when
     * `noUncheckedIndexedAccess` is enabled.
     */
    function isUncheckedIndexedAccess(
      node: ts.ElementAccessExpression | ts.PropertyAccessExpression,
    ): boolean {
      const objectType = checker.getTypeAtLocation(node.expression);
      const name = ts.isPropertyAccessExpression(node)
        ? node.name.text
        : ts.isStringLiteralLike(node.argumentExpression) ||
            ts.isNumericLiteral(node.argumentExpression)
          ? node.argumentExpression.text
          : undefined;

      return tsutils
        .unionConstituents(
          checker.getBaseConstraintOfType(objectType) ?? objectType,
        )
        .some(
          type =>
            checker.getIndexInfosOfType(type).length > 0 &&
            // Only a literal key is known to name a declared member.
            (name == null || checker.getPropertyOfType(type, name) == null),
        );
    }

    /**
     * The types of the values that an expression can produce although its type
     * does not include them: a member that is read through an index signature
     * can be `undefined`.
     */
    function getUncheckedTypes(expression: ts.Expression): ts.Type[] {
      if (ts.isParenthesizedExpression(expression)) {
        return getUncheckedTypes(expression.expression);
      }

      if (ts.isConditionalExpression(expression)) {
        return [
          ...getUncheckedTypes(expression.whenTrue),
          ...getUncheckedTypes(expression.whenFalse),
        ];
      }

      if (ts.isBinaryExpression(expression)) {
        const { left, operatorToken, right } = expression;
        switch (operatorToken.kind) {
          // A falsy left operand is the result.
          case ts.SyntaxKind.AmpersandAmpersandToken:
            return [...getUncheckedTypes(left), ...getUncheckedTypes(right)];

          // The right operand replaces a missing left operand. TypeScript
          // leaves its type out when the type of the left operand shows no
          // value to replace.
          case ts.SyntaxKind.BarBarToken:
          case ts.SyntaxKind.QuestionQuestionToken: {
            const leftTypes = getUncheckedTypes(left);

            return [
              ...leftTypes.filter(type => !isNullableType(type)),
              ...(leftTypes.length > 0
                ? tsutils.unionConstituents(checker.getTypeAtLocation(right))
                : []),
              ...getUncheckedTypes(right),
            ];
          }

          default:
            return [];
        }
      }

      if (
        ts.isCallExpression(expression) ||
        ts.isElementAccessExpression(expression) ||
        ts.isPropertyAccessExpression(expression)
      ) {
        const canBeMissing =
          (!ts.isCallExpression(expression) &&
            isUncheckedIndexedAccess(expression)) ||
          // An optional chain is `undefined` when the value before it is
          // missing.
          (ts.isOptionalChain(expression) &&
            getUncheckedTypes(expression.expression).some(isNullableType));

        return canBeMissing ? [checker.getUndefinedType()] : [];
      }

      return [];
    }

    function getReturnedTypes(
      node: FunctionNode,
      typeNode: TSESTree.TypeNode,
    ): ts.Type[] | null {
      const body = services.esTreeNodeToTSNodeMap.get(
        node.body,
      ) as ts.ConciseBody;

      const expressions: ts.Expression[] = [];
      let canCompleteWithoutValue = false;
      if (ts.isBlock(body)) {
        // TypeScript sets this flag when the end of the body is reachable. The
        // function then also returns `undefined`.
        canCompleteWithoutValue = tsutils.isNodeFlagSet(
          body.parent,
          ts.NodeFlags.HasImplicitReturn,
        );
        forEachReturnStatement(body, statement => {
          if (statement.expression == null) {
            canCompleteWithoutValue = true;
          } else {
            expressions.push(statement.expression);
          }
        });
      } else {
        expressions.push(body);
      }

      // A function that never returns a value shows nothing about its type.
      if (expressions.length === 0) {
        return null;
      }

      // An async function awaits a promise before resolving with it.
      const getResolvedType = (type: ts.Type): ts.Type =>
        node.async ? (checker.getAwaitedType(type) ?? type) : type;

      const returnedTypes = expressions.map(expression =>
        checker.getTypeAtLocation(expression),
      );
      if (canCompleteWithoutValue) {
        returnedTypes.push(checker.getUndefinedType());
      }
      if (!isNoUncheckedIndexedAccess) {
        // The function type-checks without these values, so they only count
        // where the return type accepts them.
        const declaredType = getResolvedType(
          services.getTypeAtLocation(typeNode),
        );
        returnedTypes.push(
          ...expressions
            .flatMap(getUncheckedTypes)
            .filter(type =>
              checker.isTypeAssignableTo(getResolvedType(type), declaredType),
            ),
        );
      }

      return getConstituents(returnedTypes.map(getResolvedType));
    }

    function getArrayElementType(type: ts.Type): ts.Type | undefined {
      return checker.isArrayType(type) || checker.isTupleType(type)
        ? checker.getIndexTypeOfType(type, ts.IndexKind.Number)
        : undefined;
    }

    function getPromisedType(type: ts.Type): ts.Type | undefined {
      return isPromiseLike(services.program, type)
        ? checker.getAwaitedType(type)
        : undefined;
    }

    /**
     * An async function is annotated with the global `Promise`, whose type
     * argument describes the awaited returned values.
     */
    function getPromisedTypeNode(
      typeNode: TSESTree.TypeNode,
    ): TSESTree.TypeNode | undefined {
      if (typeNode.type !== AST_NODE_TYPES.TSTypeReference) {
        return undefined;
      }

      const symbol = services.getSymbolAtLocation(typeNode.typeName);

      return symbol?.name === 'Promise' &&
        isSymbolFromDefaultLibrary(services.program, symbol)
        ? typeNode.typeArguments?.params[0]
        : undefined;
    }

    function getTypeArgumentComponents(
      typeNode: TSESTree.TSTypeReference,
    ): TypeComponent[] {
      if (typeNode.typeArguments == null) {
        return [];
      }

      const symbol = services.getSymbolAtLocation(typeNode.typeName);
      const declaredType = services.getTypeAtLocation(typeNode);
      // The type arguments of a class or an interface are the type arguments
      // of the type it is instantiated to. Those of a type alias have no fixed
      // position in the type that the alias produces.
      if (
        symbol == null ||
        !tsutils.isTypeReference(declaredType) ||
        checker.getDeclaredTypeOfSymbol(symbol) !== declaredType.target
      ) {
        return [];
      }

      const { target } = declaredType;
      // A class declared inside a generic function also takes the type
      // parameters of that function.
      const firstIndex = target.outerTypeParameters?.length ?? 0;
      const readStructurally = isSymbolFromDefaultLibrary(
        services.program,
        symbol,
      )
        ? structuralReaders.get(symbol.name)
        : undefined;

      return typeNode.typeArguments.params.map((typeArgument, index) => ({
        read: (type): ts.Type | undefined => {
          // The declared type cannot become narrower and still accept a
          // returned type that it is itself assignable to. That is the case
          // for a type argument that is only used as a method parameter type,
          // which TypeScript compares in both directions.
          if (checker.isTypeAssignableTo(declaredType, type)) {
            return undefined;
          }

          const typeArguments =
            tsutils.isTypeReference(type) && type.target === target
              ? checker.getTypeArguments(type)
              : undefined;

          return (
            typeArguments?.[firstIndex + index] ?? readStructurally?.(type)
          );
        },
        typeNode: typeArgument,
      }));
    }

    function getComponents(
      typeNode: TSESTree.TypeNode | undefined,
    ): TypeComponent[] {
      switch (typeNode?.type) {
        case AST_NODE_TYPES.TSArrayType:
          return [
            { read: getArrayElementType, typeNode: typeNode.elementType },
          ];

        case AST_NODE_TYPES.TSTupleType: {
          const { elementTypes } = typeNode;

          return elementTypes.flatMap((element, index) => {
            const isNamed = element.type === AST_NODE_TYPES.TSNamedTupleMember;
            // An optional element accepts `undefined` whether or not its type
            // says so.
            if (isNamed && element.optional) {
              return [];
            }

            return [
              {
                read: (type): ts.Type | undefined => {
                  // In older TypeScript versions, a tuple type that is read
                  // through a constraint has an extra `this` type argument.
                  const types = tsutils.isTupleTypeReference(type)
                    ? checker
                        .getTypeArguments(type)
                        .slice(0, type.target.typeParameters?.length)
                    : [];

                  return types.length === elementTypes.length
                    ? types[index]
                    : undefined;
                },
                typeNode: isNamed ? element.elementType : element,
              },
            ];
          });
        }

        case AST_NODE_TYPES.TSTypeLiteral:
          return typeNode.members.flatMap(member => {
            // Only a property with a static name is read. An optional property
            // accepts `undefined` whether or not its type says so.
            if (
              member.type !== AST_NODE_TYPES.TSPropertySignature ||
              member.computed ||
              member.optional ||
              member.typeAnnotation == null
            ) {
              return [];
            }

            const name =
              member.key.type === AST_NODE_TYPES.Identifier
                ? member.key.name
                : String(member.key.value);

            return [
              {
                read: (type): ts.Type | undefined => {
                  const property = checker.getPropertyOfType(type, name);

                  return property == null
                    ? undefined
                    : checker.getTypeOfSymbol(property);
                },
                typeNode: member.typeAnnotation.typeAnnotation,
              },
            ];
          });

        case AST_NODE_TYPES.TSTypeOperator:
          return typeNode.operator === 'readonly'
            ? getComponents(typeNode.typeAnnotation)
            : [];

        case AST_NODE_TYPES.TSTypeReference:
          return getTypeArgumentComponents(typeNode);

        default:
          return [];
      }
    }

    function readComponent(
      type: ts.Type,
      read: TypeComponent['read'],
    ): ts.Type | undefined {
      const componentType = read(type);
      if (componentType != null) {
        return componentType;
      }

      // An intersection, a class and an interface are also read through the
      // types they are made from.
      const sourceTypes = type.isIntersection()
        ? type.types
        : type.isClassOrInterface()
          ? checker.getBaseTypes(type)
          : [];

      return sourceTypes
        .map(sourceType => readComponent(sourceType, read))
        .find(sourceComponentType => sourceComponentType != null);
    }

    /**
     * Reads one position of every returned type. Returns `null` when a returned
     * type does not have that position or shows nothing about it.
     */
    function getComponentTypes(
      returnedTypes: readonly ts.Type[],
      read: TypeComponent['read'],
    ): ts.Type[] | null {
      const componentTypes: ts.Type[] = [];
      for (const returnedType of returnedTypes) {
        // A value typed by a type parameter is read through its constraint.
        const constraint =
          checker.getBaseConstraintOfType(returnedType) ?? returnedType;
        for (const type of tsutils.unionConstituents(constraint)) {
          const componentType = readComponent(type, read);
          if (componentType == null) {
            return null;
          }
          componentTypes.push(componentType);
        }
      }

      return getConstituents(componentTypes);
    }

    function checkUnion(
      unionNode: TSESTree.TSUnionType,
      returnedTypes: readonly ts.Type[],
      isAwaited: boolean,
    ): void {
      const members = getUnionMembers(unionNode).map(typeNode => {
        const type = services.getTypeAtLocation(typeNode);

        return {
          // An async function awaits a promise before resolving with it.
          type: isAwaited ? (checker.getAwaitedType(type) ?? type) : type,
          typeNode,
        };
      });
      // `any` and `unknown` accept every returned type. A returned type that
      // is assignable to no single member needs several of them.
      if (
        members.some(member => isAnyOrUnknown(member.type)) ||
        !returnedTypes.every(returnedType =>
          members.some(member =>
            isReturnedTypeAssignableTo(returnedType, member.type),
          ),
        )
      ) {
        return;
      }

      for (const member of members) {
        const widerMembers = members.filter(
          other =>
            other !== member &&
            checker.isTypeAssignableTo(member.type, other.type),
        );
        // Removing `'a'` from `'a' | string` does not narrow the union.
        if (
          widerMembers.some(
            other => !checker.isTypeAssignableTo(other.type, member.type),
          )
        ) {
          continue;
        }

        const acceptedTypes = returnedTypes.filter(returnedType =>
          isReturnedTypeAssignableTo(returnedType, member.type),
        );
        if (acceptedTypes.length === 0) {
          context.report({
            node: member.typeNode,
            messageId: 'unnecessaryType',
          });
        } else if (widerMembers.length === 0) {
          // Narrowing one of two equivalent members would not narrow the union
          // either.
          checkTypeNode(member.typeNode, acceptedTypes);
        }
      }
    }

    /** Whether a union is written at a position of the type that is read. */
    function containsUnion(typeNode: TSESTree.TypeNode): boolean {
      return (
        typeNode.type === AST_NODE_TYPES.TSUnionType ||
        getComponents(typeNode).some(component =>
          containsUnion(component.typeNode),
        )
      );
    }

    /**
     * Reports the union members written in a type that the returned types do
     * not need: every returned type would still be assignable to the type
     * without the member.
     */
    function checkTypeNode(
      typeNode: TSESTree.TypeNode,
      returnedTypes: readonly ts.Type[],
      isAwaited = false,
    ): void {
      if (typeNode.type === AST_NODE_TYPES.TSUnionType) {
        checkUnion(typeNode, returnedTypes, isAwaited);
        return;
      }

      for (const component of getComponents(typeNode)) {
        const componentTypes = getComponentTypes(returnedTypes, component.read);
        if (componentTypes != null) {
          checkTypeNode(component.typeNode, componentTypes);
        }
      }
    }

    function hasBaseClassMember(
      memberNode:
        | TSESTree.AccessorProperty
        | TSESTree.MethodDefinition
        | TSESTree.PropertyDefinition,
    ) {
      // A private name belongs to the class that declares it.
      if (memberNode.key.type === AST_NODE_TYPES.PrivateIdentifier) {
        return false;
      }

      const memberTsNode = services.esTreeNodeToTSNodeMap.get(
        memberNode,
      ) as ClassMemberDeclaration;
      const memberNameNode = memberTsNode.name;

      const classNode = memberTsNode.parent as ts.ClassLikeDeclaration;
      const heritageClauses = classNode.heritageClauses ?? [];
      if (heritageClauses.length === 0) {
        return false;
      }

      const memberSymbol = checker.getSymbolAtLocation(memberNameNode);
      if (memberSymbol == null) {
        return false;
      }
      const isNumericName = tsutils.isNumericPropertyName(memberSymbol.name);

      /** Whether an index signature of a base type applies to the member. */
      function hasApplicableIndexSignature(baseType: ts.Type): boolean {
        return checker.getIndexInfosOfType(baseType).some(({ keyType }) => {
          // A numeric name is a key of a string and of a number index
          // signature, whether it is written as a number or as a string.
          if (
            isNumericName &&
            tsutils.isTypeFlagSet(
              keyType,
              ts.TypeFlags.String | ts.TypeFlags.Number,
            )
          ) {
            return true;
          }

          // Only a computed name is an expression, whose type can be compared
          // with the key type.
          if (ts.isComputedPropertyName(memberNameNode)) {
            return checker.isTypeAssignableTo(
              checker.getTypeAtLocation(memberNameNode.expression),
              keyType,
            );
          }

          // Any other name has no type to compare. A number or a symbol key
          // does not accept it, and a key such as a template literal type is
          // assumed to.
          return !tsutils.isTypeFlagSet(
            keyType,
            ts.TypeFlags.Number | ts.TypeFlags.ESSymbol,
          );
        });
      }

      const isStaticMember = memberNode.static;
      for (const heritageClause of heritageClauses) {
        if (
          isStaticMember &&
          heritageClause.token === ts.SyntaxKind.ImplementsKeyword
        ) {
          continue;
        }

        for (const baseTypeNode of heritageClause.types) {
          const baseType = checker.getTypeAtLocation(
            isStaticMember ? baseTypeNode.expression : baseTypeNode,
          );
          if (
            tsutils.getPropertyOfType(baseType, memberSymbol.escapedName) !=
            null
          ) {
            return true;
          }

          if (!isStaticMember && hasApplicableIndexSignature(baseType)) {
            return true;
          }
        }
      }

      return false;
    }

    function shouldSkipFunction(node: FunctionNode) {
      if (node.generator) {
        return true;
      }

      if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
        return hasOverloadSignatures(node, context);
      }

      if (
        node.parent.type === AST_NODE_TYPES.AccessorProperty ||
        node.parent.type === AST_NODE_TYPES.MethodDefinition ||
        node.parent.type === AST_NODE_TYPES.PropertyDefinition
      ) {
        if (
          node.parent.decorators.length > 0 ||
          node.parent.parent.parent.decorators.length > 0 ||
          node.parent.override ||
          (node.parent.type === AST_NODE_TYPES.MethodDefinition &&
            hasOverloadSignatures(node.parent, context))
        ) {
          return true;
        }

        if (hasBaseClassMember(node.parent)) {
          return true;
        }
      }

      if (
        node.parent.type === AST_NODE_TYPES.Property &&
        services.getContextualType(node.parent.parent) != null
      ) {
        return true;
      }

      return services.getContextualType(node) != null;
    }

    function checkFunction(node: FunctionNode): void {
      const returnType = node.returnType?.typeAnnotation;
      if (returnType == null) {
        return;
      }

      const typeNode = node.async
        ? getPromisedTypeNode(returnType)
        : returnType;
      // Only a union member can be reported.
      if (
        typeNode == null ||
        !containsUnion(typeNode) ||
        shouldSkipFunction(node)
      ) {
        return;
      }

      const returnedTypes = getReturnedTypes(node, typeNode);
      if (returnedTypes != null) {
        checkTypeNode(typeNode, returnedTypes, node.async);
      }
    }

    return {
      'ArrowFunctionExpression:exit': checkFunction,
      'FunctionDeclaration:exit': checkFunction,
      'FunctionExpression:exit': checkFunction,
    };
  },
});
