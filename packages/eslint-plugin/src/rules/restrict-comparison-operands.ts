import type { TSESTree } from '@typescript-eslint/utils';

import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getTypeName,
  isSymbolFromDefaultLibrary,
} from '../util';

export type MessageIds = 'unorderedOperand';

export default createRule<[], MessageIds>({
  name: 'restrict-comparison-operands',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow relational comparisons of objects that do not convert to a primitive value',
      requiresTypeChecking: true,
    },
    messages: {
      unorderedOperand:
        "Values of type `{{type}}` have no meaningful order. Comparing them with '{{operator}}' compares their string form instead.",
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    // Comparing an object first calls its [Symbol.toPrimitive] or valueOf. Only the valueOf inherited from the
    // Object interface returns the object itself, after which the comparison falls back to its string form.
    function hasPrimitiveConversion(type: ts.Type): boolean {
      if (
        tsutils.getWellKnownSymbolPropertyOfType(type, 'toPrimitive', checker)
      ) {
        return true;
      }

      const valueOf = checker.getPropertyOfType(type, 'valueOf');
      const declarations = valueOf?.getDeclarations();
      if (!declarations?.length) {
        return true;
      }

      return declarations.some(
        declaration =>
          !(
            ts.isInterfaceDeclaration(declaration.parent) &&
            declaration.parent.name.text === 'Object'
          ),
      );
    }

    // `{}` and `Object` also describe primitives, so comparing them can be correct
    function isEmptyOrObjectInterface(type: ts.Type): boolean {
      if (
        type.getProperties().length === 0 &&
        type.getCallSignatures().length === 0 &&
        type.getConstructSignatures().length === 0 &&
        checker.getIndexInfosOfType(type).length === 0
      ) {
        return true;
      }

      const symbol = type.getSymbol();
      return (
        symbol?.name === 'Object' &&
        isSymbolFromDefaultLibrary(services.program, symbol)
      );
    }

    function isUnorderedObject(type: ts.Type): boolean {
      if (type.isIntersection()) {
        return (
          type.types.every(tsutils.isObjectType) &&
          !hasPrimitiveConversion(type)
        );
      }

      return (
        tsutils.isObjectType(type) &&
        !isEmptyOrObjectInterface(type) &&
        !hasPrimitiveConversion(type)
      );
    }

    function isUnorderedOperand(type: ts.Type): boolean {
      const parts = tsutils
        .unionConstituents(type)
        .filter(
          part =>
            !tsutils.isTypeFlagSet(
              part,
              ts.TypeFlags.Null | ts.TypeFlags.Undefined,
            ),
        );
      return parts.length > 0 && parts.every(isUnorderedObject);
    }

    function checkOperand(
      node: TSESTree.Expression | TSESTree.PrivateIdentifier,
      operator: string,
    ): void {
      const type = getConstrainedTypeAtLocation(services, node);
      if (isUnorderedOperand(type)) {
        context.report({
          node,
          messageId: 'unorderedOperand',
          data: { type: getTypeName(checker, type), operator },
        });
      }
    }

    return {
      'BinaryExpression[operator=/^[<>]=?$/]'(
        node: TSESTree.BinaryExpression,
      ): void {
        checkOperand(node.left, node.operator);
        checkOperand(node.right, node.operator);
      },
    };
  },
});
