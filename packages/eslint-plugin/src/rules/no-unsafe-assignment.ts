import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getContextualType,
  getParserServices,
  getThisExpression,
  isTypeAnyArrayType,
  isTypeAnyType,
  isTypeUnknownType,
  isUnsafeAssignment,
  nullThrows,
  NullThrowsReasons,
} from '../util';

const enum ComparisonType {
  None,
  Basic,
  Contextual,
}

export default createRule({
  name: 'no-unsafe-assignment',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow assigning a value with type `any` to variables and properties',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      anyAssignment: 'Unsafe assignment of an {{sender}} value.',
      anyAssignmentThis: [
        'Unsafe assignment of an {{sender}} value. `this` is typed as `any`.',
        'You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.',
      ].join('\n'),
      unsafeArrayPattern:
        'Unsafe array destructuring of an {{sender}} array value.',
      unsafeArrayPatternFromTuple:
        'Unsafe array destructuring of a tuple element with an {{sender}} value.',
      unsafeArraySpread: 'Unsafe spread of an {{sender}} value in an array.',
      unsafeAssignment:
        'Unsafe assignment of type {{sender}} to a variable of type {{receiver}}.',
      unsafeObjectPattern:
        'Unsafe object destructuring of an {{sender}} value.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();
    const isNoImplicitThis = tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'noImplicitThis',
    );

    function checkObjectDestructure(
      receiverNode: TSESTree.ObjectPattern,
      senderType: ts.Type,
      senderNode: ts.Node,
    ): boolean {
      const properties = new Map(
        senderType
          .getProperties()
          .map(property => [
            property.getName(),
            checker.getTypeOfSymbolAtLocation(property, senderNode),
          ]),
      );

      let didReport = false;
      for (const receiverProperty of receiverNode.properties) {
        if (receiverProperty.type === AST_NODE_TYPES.RestElement) continue;

        let key: string;
        if (!receiverProperty.computed) {
          key =
            receiverProperty.key.type === AST_NODE_TYPES.Identifier
              ? receiverProperty.key.name
              : String(receiverProperty.key.value);
        } else if (receiverProperty.key.type === AST_NODE_TYPES.Literal) {
          key = String(receiverProperty.key.value);
        } else if (
          receiverProperty.key.type === AST_NODE_TYPES.TemplateLiteral &&
          receiverProperty.key.quasis.length === 1
        ) {
          key = receiverProperty.key.quasis[0].value.cooked;
        } else {
          continue;
        }

        const senderType = properties.get(key);
        if (!senderType) continue;

        if (isTypeAnyType(senderType)) {
          context.report({
            node: receiverProperty.value,
            messageId: 'unsafeObjectPattern',
            data: createData(senderType),
          });
          didReport = true;
        } else if (
          receiverProperty.value.type === AST_NODE_TYPES.ArrayPattern
        ) {
          didReport = checkArrayDestructure(
            receiverProperty.value,
            senderType,
            senderNode,
          );
        } else if (
          receiverProperty.value.type === AST_NODE_TYPES.ObjectPattern
        ) {
          didReport = checkObjectDestructure(
            receiverProperty.value,
            senderType,
            senderNode,
          );
        }
      }

      return didReport;
    }

    // ... (rest of original unchanged logic remains the same)

    return {
      // ... (handlers stay the same)
    };
  },
});
