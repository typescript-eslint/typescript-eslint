import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  findFirstResult,
  getConstrainedTypeAtLocation,
  getParserServices,
  getStaticMemberAccessValue,
  getTypeOfPropertyOfName,
  hasOverloadSignatures,
  isNullableType,
  isPromiseLike,
  isSymbolFromDefaultLibrary,
  isTypeAnyType,
  isTypeNeverType,
  isTypeUnknownType,
  walkStatements,
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

/** A type written inside a return type, such as the element type of `T[]`. */
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

    // Interfaces that a type can satisfy without being an instance of them:
    // an array is also an `ArrayLike`.
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

    // Returns `null` when the types tell nothing about the returned values, as
    // `any`, `unknown` and `never` do.
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
      // TypeScript rejects an object literal with excess properties, but the
      // object is still a value of the type.
      return checker.isTypeAssignableTo(
        tsutils.isObjectType(returnedType) &&
          tsutils.isObjectFlagSet(returnedType, ts.ObjectFlags.ObjectLiteral)
          ? checker.getWidenedType(returnedType)
          : returnedType,
        type,
      );
    }

    /**
     * Whether a type declares a property of an object type, or any property
     * through an index signature.
     */
    function declaresPropertyOf(type: ts.Type, objectType: ts.Type): boolean {
      const names = objectType
        .getProperties()
        .map(property => property.escapedName);

      return tsutils
        .unionConstituents(type)
        .some(
          part =>
            checker.getIndexInfosOfType(part).length > 0 ||
            names.some(name => tsutils.getPropertyOfType(part, name) != null),
        );
    }

    // An async function awaits a returned promise before resolving with it.
    function getResolvedType(type: ts.Type, isAsync: boolean): ts.Type {
      return isAsync ? (checker.getAwaitedType(type) ?? type) : type;
    }

    /**
     * Whether a member is read through an index signature, like `values[0]`.
     * Its type only includes `undefined` under `noUncheckedIndexedAccess`.
     */
    function isUncheckedIndexedAccess(
      node: TSESTree.MemberExpression,
    ): boolean {
      const name = getStaticMemberAccessValue(node, context);

      return tsutils
        .unionConstituents(getConstrainedTypeAtLocation(services, node.object))
        .some(
          type =>
            checker.getIndexInfosOfType(type).length > 0 &&
            // A known name can belong to a declared member instead.
            (typeof name !== 'string' ||
              checker.getPropertyOfType(type, name) == null),
        );
    }

    // `values[0]?.name.length` ends at `?.` when `values[0]` is missing.
    function canShortCircuit(
      node: TSESTree.CallExpression | TSESTree.MemberExpression,
    ): boolean {
      const previous =
        node.type === AST_NODE_TYPES.CallExpression ? node.callee : node.object;

      if (node.optional) {
        return getUncheckedTypes(previous).some(isNullableType);
      }

      return (
        (previous.type === AST_NODE_TYPES.CallExpression ||
          previous.type === AST_NODE_TYPES.MemberExpression) &&
        canShortCircuit(previous)
      );
    }

    /**
     * The types of the values that an expression can produce although its type
     * does not include them: `values[0]` can be `undefined`.
     */
    function getUncheckedTypes(node: TSESTree.Expression): ts.Type[] {
      switch (node.type) {
        case AST_NODE_TYPES.CallExpression:
        case AST_NODE_TYPES.MemberExpression: {
          const canBeMissing =
            (node.type === AST_NODE_TYPES.MemberExpression &&
              isUncheckedIndexedAccess(node)) ||
            canShortCircuit(node);

          return canBeMissing ? [checker.getUndefinedType()] : [];
        }

        case AST_NODE_TYPES.AwaitExpression:
          return getUncheckedTypes(node.argument);

        case AST_NODE_TYPES.ChainExpression:
          return getUncheckedTypes(node.expression);

        case AST_NODE_TYPES.ConditionalExpression:
          return [
            ...getUncheckedTypes(node.consequent),
            ...getUncheckedTypes(node.alternate),
          ];

        case AST_NODE_TYPES.LogicalExpression: {
          const leftTypes = getUncheckedTypes(node.left);
          const rightTypes = getUncheckedTypes(node.right);
          // A missing left operand of `&&` is the result.
          if (node.operator === '&&') {
            return [...leftTypes, ...rightTypes];
          }

          // `??` and `||` use the right operand when the left one is missing.
          // TypeScript ignores its type if the left type is never missing.
          return [
            ...leftTypes.filter(type => !isNullableType(type)),
            ...(leftTypes.length > 0
              ? tsutils.unionConstituents(
                  services.getTypeAtLocation(node.right),
                )
              : []),
            ...rightTypes,
          ];
        }

        default:
          return [];
      }
    }

    function getReturnedTypes(
      node: FunctionNode,
      typeNode: TSESTree.TypeNode,
    ): ts.Type[] | null {
      const expressions: TSESTree.Expression[] = [];
      let canCompleteWithoutValue = false;
      if (node.body.type === AST_NODE_TYPES.BlockStatement) {
        // This flag is set when the end of the body is reachable according to
        // the syntax alone. The function then also returns `undefined`.
        canCompleteWithoutValue = tsutils.isNodeFlagSet(
          services.esTreeNodeToTSNodeMap.get(node),
          ts.NodeFlags.HasImplicitReturn,
        );
        for (const statement of walkStatements(node.body.body)) {
          if (statement.type !== AST_NODE_TYPES.ReturnStatement) {
            continue;
          }

          if (statement.argument == null) {
            canCompleteWithoutValue = true;
          } else {
            expressions.push(statement.argument);
          }
        }
      } else {
        expressions.push(node.body);
      }

      // A function that never returns a value shows nothing about its type.
      if (expressions.length === 0) {
        return null;
      }

      const returnedTypes = expressions.map(expression =>
        services.getTypeAtLocation(expression),
      );
      if (canCompleteWithoutValue) {
        returnedTypes.push(checker.getUndefinedType());
      }
      if (!isNoUncheckedIndexedAccess) {
        // The function type-checks without these values, so they only count
        // where the return type accepts them.
        const declaredType = getResolvedType(
          services.getTypeAtLocation(typeNode),
          node.async,
        );
        returnedTypes.push(
          ...expressions
            .flatMap(getUncheckedTypes)
            .filter(type =>
              checker.isTypeAssignableTo(
                getResolvedType(type, node.async),
                declaredType,
              ),
            ),
        );
      }

      return getConstituents(
        returnedTypes.map(type => getResolvedType(type, node.async)),
      );
    }

    function getArrayElementType(type: ts.Type): ts.Type | undefined {
      return checker.isArrayType(type) || checker.isTupleType(type)
        ? type.getNumberIndexType()
        : undefined;
    }

    function getPromisedType(type: ts.Type): ts.Type | undefined {
      return isPromiseLike(services.program, type)
        ? checker.getAwaitedType(type)
        : undefined;
    }

    // The return type of an async function is the global `Promise`.
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
      // The type arguments of a type alias have no fixed position in the type
      // that the alias produces, so only classes and interfaces are read.
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
          // A type argument that is only used as a method parameter type is
          // compared in both directions, so the two types are assignable to
          // each other. Removing a member would not narrow the declared type.
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
            // `undefined` is always allowed for an optional element.
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
            // `undefined` is always allowed for an optional property.
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
                read: (type): ts.Type | undefined =>
                  getTypeOfPropertyOfName(checker, type, name),
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

      const sourceTypes = type.isIntersection()
        ? type.types
        : type.isClassOrInterface()
          ? checker.getBaseTypes(type)
          : [];

      return findFirstResult(sourceTypes, sourceType =>
        readComponent(sourceType, read),
      );
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
      const members = getUnionMembers(unionNode).map(typeNode => ({
        type: getResolvedType(services.getTypeAtLocation(typeNode), isAwaited),
        typeNode,
      }));
      // TypeScript can accept an object through several members together: each
      // property of an object literal has to be declared by one of them, and
      // `{ kind: 'a' | 'b' }` is assignable to `{ kind: 'a' } | { kind: 'b' }`.
      const sharedTypes = returnedTypes.filter(
        returnedType =>
          !members.some(member =>
            checker.isTypeAssignableTo(returnedType, member.type),
          ),
      );
      const unionType = getResolvedType(
        services.getTypeAtLocation(unionNode),
        isAwaited,
      );
      // No member can be removed when one of them is `any` or `unknown`, or
      // when a returned type needs several of them for another reason.
      if (
        members.some(member => isAnyOrUnknown(member.type)) ||
        !sharedTypes.every(
          type =>
            tsutils.isObjectType(type) &&
            checker.isTypeAssignableTo(type, unionType),
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

        const acceptedTypes = returnedTypes.filter(
          returnedType =>
            isReturnedTypeAssignableTo(returnedType, member.type) ||
            // An object that TypeScript accepts through several members needs
            // each member that declares one of its properties.
            (sharedTypes.includes(returnedType) &&
              declaresPropertyOf(member.type, returnedType)),
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

    function containsUnion(typeNode: TSESTree.TypeNode): boolean {
      return (
        typeNode.type === AST_NODE_TYPES.TSUnionType ||
        getComponents(typeNode).some(component =>
          containsUnion(component.typeNode),
        )
      );
    }

    /**
     * Reports the union members written in a type that could be removed with
     * every returned type still assignable to it.
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
    ): boolean {
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

      function hasApplicableIndexSignature(baseType: ts.Type): boolean {
        return checker.getIndexInfosOfType(baseType).some(({ keyType }) => {
          // `0` and `'0'` are keys of a string and of a number index signature.
          if (
            isNumericName &&
            tsutils.isTypeFlagSet(
              keyType,
              ts.TypeFlags.String | ts.TypeFlags.Number,
            )
          ) {
            return true;
          }

          if (ts.isComputedPropertyName(memberNameNode)) {
            return checker.isTypeAssignableTo(
              checker.getTypeAtLocation(memberNameNode.expression),
              keyType,
            );
          }

          // A name that is not computed has no type to compare. It cannot
          // match a number or a symbol key, and it is assumed to match any
          // other key, such as a template literal type.
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

    function shouldSkipFunction(node: FunctionNode): boolean {
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
      ArrowFunctionExpression: checkFunction,
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
    };
  },
});
