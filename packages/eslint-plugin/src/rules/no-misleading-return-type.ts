import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  forEachReturnStatement,
  getParserServices,
  hasOverloadSignatures,
  isTypeAnyType,
  isTypeNeverType,
  isTypeUnknownType,
} from '../util';

const PRIMITIVE_TYPE_FLAGS =
  ts.TypeFlags.Undefined |
  ts.TypeFlags.Null |
  ts.TypeFlags.Void |
  ts.TypeFlags.String |
  ts.TypeFlags.Number |
  ts.TypeFlags.BigInt |
  ts.TypeFlags.Boolean |
  ts.TypeFlags.ESSymbol |
  ts.TypeFlags.Literal |
  ts.TypeFlags.UniqueESSymbol |
  ts.TypeFlags.Enum |
  ts.TypeFlags.EnumLiteral;

const CONCRETE_TYPE_FLAGS = PRIMITIVE_TYPE_FLAGS | ts.TypeFlags.NonPrimitive;

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

type TypeProjection = 'arrayElement' | 'awaited' | 'identity';

type UnionCandidate =
  | {
      kind: 'array' | 'direct';
      returnType: TSESTree.TypeNode;
      types: TSESTree.TypeNode[];
    }
  | {
      kind: 'reference';
      returnType: TSESTree.TypeNode;
      typeArgument: TSESTree.TSUnionType;
      types: TSESTree.TypeNode[];
    };

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
      unnecessaryType:
        'The return type includes `{{type}}`, but no returned expression requires it.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function getUnionMembers(type: TSESTree.TypeNode): TSESTree.TypeNode[] {
      return type.type === AST_NODE_TYPES.TSUnionType
        ? type.types.flatMap(getUnionMembers)
        : [type];
    }

    function hasUnresolvedTemplatePart(types: readonly ts.Type[]): boolean {
      function isUnresolved(type: ts.Type): boolean {
        if (
          tsutils.isTypeFlagSet(type, ts.TypeFlags.Instantiable) ||
          tsutils.isConditionalType(type) ||
          tsutils.isStringMappingType(type)
        ) {
          return true;
        }

        return (
          (type.isUnionOrIntersection() ||
            tsutils.isTemplateLiteralType(type)) &&
          type.types.some(isUnresolved)
        );
      }

      return types.some(isUnresolved);
    }

    function isUnresolvedTypeOperation(type: ts.Type): boolean {
      // Assignability can be false until these types are instantiated, even
      // when a returned type will satisfy them for every valid instantiation.
      return (
        tsutils.isConditionalType(type) ||
        tsutils.isStringMappingType(type) ||
        (tsutils.isTemplateLiteralType(type) &&
          hasUnresolvedTemplatePart(type.types))
      );
    }

    function getWidenedObjectLiteralType(type: ts.Type): ts.Type {
      // Fresh object literal types trigger excess-property checks in
      // isTypeAssignableTo(). Widening removes freshness while preserving the
      // structural type that can satisfy more than one union constituent.
      return tsutils.isObjectType(type) &&
        tsutils.isObjectFlagSet(type, ts.ObjectFlags.ObjectLiteral)
        ? checker.getWidenedType(type)
        : type;
    }

    function getStableBaseConstraint(type: ts.Type): ts.Type | null {
      const seen = new Set<ts.Type>([type]);
      let constraint = type;

      for (;;) {
        const next = checker.getBaseConstraintOfType(constraint);
        if (!next || seen.has(next)) {
          break;
        }
        seen.add(next);
        constraint = next;
      }

      return constraint === type ||
        tsutils.isIntrinsicErrorType(constraint) ||
        isTypeAnyType(constraint) ||
        isTypeUnknownType(constraint) ||
        isUnresolvedTypeOperation(constraint)
        ? null
        : constraint;
    }

    function isConcreteType(type: ts.Type): boolean {
      return tsutils.isTypeFlagSet(type, CONCRETE_TYPE_FLAGS);
    }

    function isPrimitiveType(type: ts.Type): boolean {
      return tsutils
        .unionConstituents(type)
        .every(type => tsutils.isTypeFlagSet(type, PRIMITIVE_TYPE_FLAGS));
    }

    function isImplicitReturnType(type: ts.Type): boolean {
      return tsutils.isTypeFlagSet(
        type,
        ts.TypeFlags.Undefined | ts.TypeFlags.Void,
      );
    }

    function mayRepresentImplicitReturn(
      type: ts.Type,
      constraint: ts.Type | null,
    ): boolean {
      if (tsutils.unionConstituents(type).some(isImplicitReturnType)) {
        return true;
      }

      return (
        constraint != null &&
        tsutils.unionConstituents(constraint).some(isImplicitReturnType)
      );
    }

    function enumLiteralsHaveSameValue(left: ts.Type, right: ts.Type): boolean {
      // Distinct enum member types can represent the same runtime value.
      if (
        !tsutils.isTypeFlagSet(left, ts.TypeFlags.EnumLiteral) ||
        !tsutils.isTypeFlagSet(right, ts.TypeFlags.EnumLiteral) ||
        !left.isLiteral() ||
        !right.isLiteral()
      ) {
        return false;
      }

      return (
        (typeof left.value === 'number' || typeof left.value === 'string') &&
        left.value === right.value
      );
    }

    function typesHaveAssignableRelation(
      left: ts.Type,
      right: ts.Type,
    ): boolean {
      return (
        checker.isTypeAssignableTo(getWidenedObjectLiteralType(left), right) ||
        checker.isTypeAssignableTo(right, left) ||
        enumLiteralsHaveSameValue(left, right)
      );
    }

    function canProveNoOverlap(left: ts.Type, right: ts.Type): boolean {
      const comparableLeft =
        isConcreteType(left) || tsutils.isTypeFlagSet(left, ts.TypeFlags.Object)
          ? left
          : (getStableBaseConstraint(left) ?? left);
      if (
        typesHaveAssignableRelation(left, right) ||
        (comparableLeft !== left &&
          typesHaveAssignableRelation(comparableLeft, right))
      ) {
        return false;
      }

      return (
        isConcreteType(comparableLeft) ||
        // Non-assignable structural object types can still overlap. An object
        // type is disjoint only when the other side is entirely primitive.
        (isPrimitiveType(right) &&
          tsutils.isTypeFlagSet(comparableLeft, ts.TypeFlags.Object))
      );
    }

    function getReturnedTypes(
      node: FunctionNode,
      projection: TypeProjection,
    ): ts.Type[] | null {
      const body = services.esTreeNodeToTSNodeMap.get(
        node.body,
      ) as ts.ConciseBody;

      const returnExpressions: ts.Expression[] = [];
      if (ts.isBlock(body)) {
        forEachReturnStatement(body, statement => {
          if (statement.expression) {
            returnExpressions.push(statement.expression);
          }
        });
      } else {
        returnExpressions.push(body);
      }

      const returnedTypes: ts.Type[] = [];
      for (const expression of returnExpressions) {
        const type = checker.getTypeAtLocation(expression);
        const returnedType = getProjectedType(type, projection);
        if (
          !returnedType ||
          tsutils.isIntrinsicErrorType(returnedType) ||
          isTypeAnyType(returnedType) ||
          isTypeUnknownType(returnedType)
        ) {
          return null;
        }
        returnedTypes.push(returnedType);
      }

      return returnedTypes;
    }

    function getUnionCandidate(node: FunctionNode): UnionCandidate | null {
      const returnType = node.returnType?.typeAnnotation;
      if (!returnType) {
        return null;
      }

      if (returnType.type === AST_NODE_TYPES.TSUnionType) {
        return {
          kind: 'direct',
          returnType,
          types: getUnionMembers(returnType),
        };
      }

      const operatedType =
        returnType.type === AST_NODE_TYPES.TSTypeOperator &&
        returnType.operator === 'readonly'
          ? returnType.typeAnnotation
          : null;
      const operatedArrayType =
        operatedType?.type === AST_NODE_TYPES.TSArrayType ? operatedType : null;
      const arrayType =
        returnType.type === AST_NODE_TYPES.TSArrayType
          ? returnType
          : operatedArrayType;
      if (arrayType?.elementType.type === AST_NODE_TYPES.TSUnionType) {
        return {
          kind: 'array',
          returnType,
          types: getUnionMembers(arrayType.elementType),
        };
      }

      if (
        returnType.type !== AST_NODE_TYPES.TSTypeReference ||
        returnType.typeArguments?.params.length !== 1 ||
        returnType.typeArguments.params[0].type !== AST_NODE_TYPES.TSUnionType
      ) {
        return null;
      }

      const typeArgument = returnType.typeArguments.params[0];
      return {
        kind: 'reference',
        returnType,
        typeArgument,
        types: getUnionMembers(typeArgument),
      };
    }

    function getProjection(
      candidate: UnionCandidate,
      returnType: ts.Type,
    ): TypeProjection | null {
      if (candidate.kind === 'direct') {
        return 'identity';
      }
      if (candidate.kind === 'array') {
        return 'arrayElement';
      }

      if (checker.isArrayLikeType(returnType)) {
        return 'arrayElement';
      }

      const tsReturnType = services.esTreeNodeToTSNodeMap.get(
        candidate.returnType,
      );
      if (tsutils.isThenableType(checker, tsReturnType, returnType)) {
        return 'awaited';
      }

      return null;
    }

    function getProjectedType(
      type: ts.Type,
      projection: TypeProjection,
    ): ts.Type | null {
      if (projection === 'identity') {
        return type;
      }
      if (projection === 'awaited') {
        return checker.getAwaitedType(type) ?? null;
      }
      const arrayType = checker.isArrayLikeType(type)
        ? type
        : getStableBaseConstraint(type);
      if (!arrayType || !checker.isArrayLikeType(arrayType)) {
        return null;
      }

      return checker.getIndexTypeOfType(arrayType, ts.IndexKind.Number) ?? null;
    }

    function getProjectedTypeArgument(
      type: ts.Type,
      projection: TypeProjection,
    ): ts.Type | null {
      return projection === 'awaited'
        ? (checker.getAwaitedType(type) ?? null)
        : type;
    }

    function getEffectiveReturnType(
      candidate: UnionCandidate,
      projection: TypeProjection,
      returnType: ts.Type,
    ): ts.Type | null {
      const projectedReturnType = getProjectedType(returnType, projection);
      if (
        !projectedReturnType ||
        tsutils.isIntrinsicErrorType(projectedReturnType)
      ) {
        return null;
      }
      if (candidate.kind !== 'reference') {
        return projectedReturnType;
      }

      const projectedTypeArgument = getProjectedTypeArgument(
        services.getTypeAtLocation(candidate.typeArgument),
        projection,
      );

      if (
        !projectedTypeArgument ||
        tsutils.isIntrinsicErrorType(projectedTypeArgument) ||
        !checker.isTypeAssignableTo(
          projectedReturnType,
          projectedTypeArgument,
        ) ||
        !checker.isTypeAssignableTo(projectedTypeArgument, projectedReturnType)
      ) {
        return null;
      }

      return projectedReturnType;
    }

    function hasBaseClassMember(
      memberNode: TSESTree.MethodDefinition | TSESTree.PropertyDefinition,
    ): boolean {
      const memberTsNode = services.esTreeNodeToTSNodeMap.get(memberNode);
      const memberName = memberTsNode.name;
      if (memberName == null) {
        return false;
      }
      const memberNameNode: ts.PropertyName = memberName;

      const classNode = memberTsNode.parent as ts.ClassLikeDeclaration;
      const heritageClauses = classNode.heritageClauses ?? [];
      if (heritageClauses.length === 0) {
        return false;
      }

      const memberSymbol = checker.getSymbolAtLocation(memberNameNode);
      if (memberSymbol == null) {
        return false;
      }
      const memberSymbolEscapedName = memberSymbol.escapedName;
      const memberSymbolName = memberSymbol.name;

      let memberNameType: ts.Type | null = null;
      let memberNameTypeResolved = false;
      function getMemberNameType(): ts.Type | null {
        if (memberNameTypeResolved) {
          return memberNameType;
        }
        memberNameTypeResolved = true;

        if (
          ts.isIdentifier(memberNameNode) ||
          ts.isStringLiteralLike(memberNameNode)
        ) {
          memberNameType =
            typeof checker.getStringLiteralType === 'function'
              ? checker.getStringLiteralType(memberNameNode.text)
              : null;
          return memberNameType;
        }

        if (ts.isNumericLiteral(memberNameNode)) {
          memberNameType =
            typeof checker.getNumberLiteralType === 'function'
              ? checker.getNumberLiteralType(Number(memberNameNode.text))
              : null;
          return memberNameType;
        }

        if (ts.isComputedPropertyName(memberNameNode)) {
          memberNameType = checker.getTypeAtLocation(memberNameNode.expression);
          return memberNameType;
        }

        return memberNameType;
      }

      function hasMatchingIndexSignature(
        baseType: ts.Type,
        nameType: ts.Type | null,
      ): boolean {
        const indexInfos = checker.getIndexInfosOfType(baseType);
        if (
          nameType &&
          indexInfos.some(indexInfo =>
            checker.isTypeAssignableTo(nameType, indexInfo.keyType),
          )
        ) {
          return true;
        }

        const isNumericName = tsutils.isNumericPropertyName(memberSymbolName);
        if (
          isNumericName &&
          (checker.getIndexInfoOfType(baseType, ts.IndexKind.Number) != null ||
            checker.getIndexInfoOfType(baseType, ts.IndexKind.String) != null)
        ) {
          return true;
        }

        if (
          nameType ||
          (!ts.isIdentifier(memberNameNode) &&
            !ts.isStringLiteralLike(memberNameNode) &&
            !ts.isNumericLiteral(memberNameNode))
        ) {
          return false;
        }

        // Literal-type factories are unavailable in older supported TypeScript
        // versions. In that case, conservatively match string-like index keys.
        return indexInfos.some(indexInfo =>
          tsutils
            .unionConstituents(indexInfo.keyType)
            .some(
              keyType =>
                tsutils.isTypeFlagSet(keyType, ts.TypeFlags.String) ||
                tsutils.isTemplateLiteralType(keyType) ||
                (isNumericName &&
                  tsutils.isTypeFlagSet(keyType, ts.TypeFlags.Number)),
            ),
        );
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
          if (checker.getPropertyOfType(baseType, memberSymbolName)) {
            return true;
          }

          const nameType = getMemberNameType();
          if (
            nameType &&
            tsutils.isTypeFlagSet(nameType, ts.TypeFlags.UniqueESSymbol) &&
            checker
              .getPropertiesOfType(baseType)
              .some(
                baseMember =>
                  baseMember.escapedName === memberSymbolEscapedName,
              )
          ) {
            return true;
          }

          if (
            !isStaticMember &&
            hasMatchingIndexSignature(baseType, nameType)
          ) {
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

        return hasBaseClassMember(node.parent);
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
      const candidate = getUnionCandidate(node);
      if (!candidate || shouldSkipFunction(node)) {
        return;
      }

      const returnType = services.getTypeAtLocation(candidate.returnType);
      const projection = getProjection(candidate, returnType);
      if (!projection) {
        return;
      }

      const effectiveReturnType = getEffectiveReturnType(
        candidate,
        projection,
        returnType,
      );
      if (
        !effectiveReturnType ||
        isTypeAnyType(effectiveReturnType) ||
        isTypeUnknownType(effectiveReturnType)
      ) {
        return;
      }

      const returnedTypes = getReturnedTypes(node, projection);

      if (!returnedTypes || returnedTypes.length === 0) {
        return;
      }

      const returnedTypeParts = returnedTypes.flatMap(type =>
        tsutils.unionConstituents(type).filter(type => !isTypeNeverType(type)),
      );
      if (returnedTypeParts.length === 0) {
        return;
      }
      const effectiveReturnTypeParts =
        tsutils.unionConstituents(effectiveReturnType);
      const effectiveReturnTypePartSet = new Set(effectiveReturnTypeParts);

      const resolvedCandidates: {
        constraint: ts.Type | null;
        type: ts.Type;
        typeNode: TSESTree.TypeNode;
      }[] = [];
      for (const typeNode of candidate.types) {
        const typeAtNode = services.getTypeAtLocation(typeNode);
        const type = getProjectedTypeArgument(typeAtNode, projection);
        if (
          !type ||
          tsutils.isIntrinsicErrorType(type) ||
          isTypeAnyType(type) ||
          isTypeUnknownType(type) ||
          isTypeNeverType(type)
        ) {
          continue;
        }

        const constraint = tsutils
          .unionConstituents(type)
          .some(type => tsutils.isTypeFlagSet(type, ts.TypeFlags.Instantiable))
          ? getStableBaseConstraint(type)
          : null;
        if (mayRepresentImplicitReturn(type, constraint)) {
          continue;
        }

        resolvedCandidates.push({ type, constraint, typeNode });
      }
      const analyzedCandidates = resolvedCandidates.map(
        ({ type, constraint, typeNode }) => {
          const unresolved = isUnresolvedTypeOperation(type);
          const mayBeReturned = returnedTypeParts.some(returnedType => {
            if (typesHaveAssignableRelation(returnedType, type)) {
              return true;
            }

            return (
              unresolved &&
              (!constraint || !canProveNoOverlap(returnedType, constraint))
            );
          });

          return { type, mayBeReturned, typeNode };
        },
      );
      const returnedCandidateTypes = analyzedCandidates
        .filter(candidate => candidate.mayBeReturned)
        .map(candidate => candidate.type);
      const hasBooleanCandidate = analyzedCandidates.some(({ type }) =>
        tsutils.isTypeFlagSet(type, ts.TypeFlags.Boolean),
      );

      for (const { type, mayBeReturned, typeNode } of analyzedCandidates) {
        if (
          mayBeReturned ||
          returnedCandidateTypes.some(returnedCandidateType =>
            checker.isTypeAssignableTo(type, returnedCandidateType),
          )
        ) {
          continue;
        }

        const isNormalizedAway =
          (tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLiteral) &&
            hasBooleanCandidate) ||
          (!effectiveReturnTypePartSet.has(type) &&
            effectiveReturnTypeParts.some(
              effectiveType =>
                checker.isTypeAssignableTo(type, effectiveType) &&
                !checker.isTypeAssignableTo(effectiveType, type),
            ));
        if (isNormalizedAway) {
          continue;
        }

        context.report({
          node: typeNode,
          messageId: 'unnecessaryType',
          data: { type: context.sourceCode.getText(typeNode) },
        });
      }
    }

    return {
      'ArrowFunctionExpression:exit': checkFunction,
      'FunctionDeclaration:exit': checkFunction,
      'FunctionExpression:exit': checkFunction,
    };
  },
});
