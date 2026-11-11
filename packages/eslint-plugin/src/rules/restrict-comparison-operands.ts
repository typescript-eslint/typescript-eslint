import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  matchesTypeOrBaseType,
} from '../util';

export type Options = [];
export type MessageIds = 'invalidOperand';

function isComparablePrimitiveOrAny(type: ts.Type): boolean {
  return tsutils.isTypeFlagSet(
    type,
    ts.TypeFlags.NumberLike |
      ts.TypeFlags.BigIntLike |
      ts.TypeFlags.StringLike |
      ts.TypeFlags.BooleanLike |
      ts.TypeFlags.Any,
  );
}

function isComparablePrimitive(type: ts.Type): boolean {
  return tsutils.isTypeFlagSet(
    type,
    ts.TypeFlags.NumberLike |
      ts.TypeFlags.BigIntLike |
      ts.TypeFlags.StringLike |
      ts.TypeFlags.BooleanLike,
  );
}

function isIgnoredOperand(type: ts.Type): boolean {
  return (
    isComparablePrimitiveOrAny(type) ||
    tsutils.isTypeFlagSet(
      type,
      ts.TypeFlags.Unknown |
        ts.TypeFlags.Never |
        ts.TypeFlags.Null |
        ts.TypeFlags.Undefined |
        ts.TypeFlags.Void |
        ts.TypeFlags.ESSymbolLike,
    )
  );
}

export default createRule<Options, MessageIds>({
  name: 'restrict-comparison-operands',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow comparing object types that lack a primitive coercion method',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      invalidOperand:
        "Invalid operand for a '{{operator}}' operation. Operands must each be a primitive or an object that coerces to a primitive. Got `{{type}}`.",
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isClassOrSubclass(type: ts.Type): boolean {
      return matchesTypeOrBaseType(
        services,
        candidate => {
          if (!tsutils.isObjectType(candidate)) {
            return false;
          }
          const target = tsutils.isTypeReference(candidate)
            ? candidate.target
            : candidate;
          return tsutils.isObjectFlagSet(target, ts.ObjectFlags.Class);
        },
        type,
      );
    }

    function isSupertypeOfNumber(type: ts.Type): boolean {
      const isFreshObjectLiteral =
        tsutils.isObjectType(type) &&
        tsutils.isObjectFlagSet(type, ts.ObjectFlags.ObjectLiteral);

      return (
        !isFreshObjectLiteral &&
        !isClassOrSubclass(type) &&
        checker.isTypeAssignableTo(checker.getNumberType(), type)
      );
    }

    function isComparablePrimitiveReturn(returnType: ts.Type): boolean {
      if (tsutils.isTypeFlagSet(returnType, ts.TypeFlags.Never)) {
        return false;
      }

      return tsutils
        .unionConstituents(returnType)
        .every(
          part =>
            isComparablePrimitiveOrAny(part) ||
            (part.isIntersection() && part.types.some(isComparablePrimitive)),
        );
    }

    function acceptsNumberHint(paramType: ts.Type): boolean {
      return (
        checker.isTypeAssignableTo(checker.getStringType(), paramType) ||
        tsutils
          .unionConstituents(paramType)
          .some(part => part.isStringLiteral() && part.value === 'number')
      );
    }

    function isCallableReturningPrimitive(
      callableType: ts.Type,
      matchSignature: (
        signatures: readonly ts.Signature[],
      ) => ts.Signature | undefined,
    ): boolean {
      return tsutils.unionConstituents(callableType).every(part => {
        if (tsutils.isTypeFlagSet(part, ts.TypeFlags.Any)) {
          return true;
        }
        if (part.isIntersection()) {
          return part.types.some(member =>
            isCallableReturningPrimitive(member, matchSignature),
          );
        }
        const signatures = checker.getSignaturesOfType(
          part,
          ts.SignatureKind.Call,
        );
        const signature = matchSignature(signatures);
        return (
          signature != null &&
          isComparablePrimitiveReturn(
            checker.getReturnTypeOfSignature(signature),
          )
        );
      });
    }

    function getPropertyTypeOrUndefined(
      symbol: ts.Symbol | undefined,
      tsNode: ts.Node,
    ): ts.Type {
      return symbol
        ? checker.getTypeOfSymbolAtLocation(symbol, tsNode)
        : checker.getUndefinedType();
    }

    function isNullishPropertyType(propertyType: ts.Type): boolean {
      return tsutils
        .unionConstituents(propertyType)
        .some(part =>
          tsutils.isTypeFlagSet(
            part,
            ts.TypeFlags.Undefined | ts.TypeFlags.Null,
          ),
        );
    }

    function hasComparableCoercion(type: ts.Type, tsNode: ts.Node): boolean {
      const toPrimitiveType = getPropertyTypeOrUndefined(
        tsutils.getWellKnownSymbolPropertyOfType(type, 'toPrimitive', checker),
        tsNode,
      );
      const definedToPrimitive = checker.getNonNullableType(toPrimitiveType);

      if (
        !tsutils.isTypeFlagSet(definedToPrimitive, ts.TypeFlags.Never) &&
        !isCallableReturningPrimitive(definedToPrimitive, signatures =>
          signatures.find(
            sig =>
              sig.parameters.length === 0 ||
              acceptsNumberHint(
                checker.getTypeOfSymbolAtLocation(sig.parameters[0], tsNode),
              ),
          ),
        )
      ) {
        return false;
      }

      if (!isNullishPropertyType(toPrimitiveType)) {
        return true;
      }

      const valueOfType = getPropertyTypeOrUndefined(
        checker.getPropertyOfType(type, 'valueOf'),
        tsNode,
      );

      return isCallableReturningPrimitive(
        valueOfType,
        signatures =>
          signatures.find(sig => sig.parameters.length === 0) ?? signatures[0],
      );
    }

    function isValidOperandType(type: ts.Type, tsNode: ts.Node): boolean {
      if (isIgnoredOperand(type)) {
        return true;
      }

      if (tsutils.isTypeFlagSet(type, ts.TypeFlags.Instantiable)) {
        const constraint = checker.getBaseConstraintOfType(type);
        return !constraint || isValidOperandType(constraint, tsNode);
      }

      if (type.isUnion()) {
        return type.types.every(part => isValidOperandType(part, tsNode));
      }

      if (type.isIntersection()) {
        return (
          type.types.some(
            part =>
              !tsutils.isObjectType(part) && isValidOperandType(part, tsNode),
          ) ||
          isSupertypeOfNumber(type) ||
          hasComparableCoercion(type, tsNode)
        );
      }

      return isSupertypeOfNumber(type) || hasComparableCoercion(type, tsNode);
    }

    return {
      BinaryExpression(node): void {
        if (
          node.operator !== '<' &&
          node.operator !== '<=' &&
          node.operator !== '>' &&
          node.operator !== '>='
        ) {
          return;
        }

        for (const operand of [node.left, node.right]) {
          const operandType = services.getTypeAtLocation(operand);
          const tsNode = services.esTreeNodeToTSNodeMap.get(operand);
          if (!isValidOperandType(operandType, tsNode)) {
            const displayType = getConstrainedTypeAtLocation(services, operand);
            context.report({
              node: operand,
              messageId: 'invalidOperand',
              data: {
                type: checker.typeToString(displayType),
                operator: node.operator,
              },
            });
          }
        }
      },
    };
  },
});
