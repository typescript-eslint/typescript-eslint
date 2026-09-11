import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule, getParserServices } from '../util';

export default createRule({
  name: 'no-generated-empty-object-type',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow type operations that resolve to the "empty object" type',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      noGeneratedEmptyObjectType:
        'This type resolves to `{}`, the empty object type. This was likely not intentional.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isEmptyObjectType(type: ts.Type) {
      return (
        tsutils.isObjectType(type) &&
        !tsutils.isObjectFlagSet(
          type,
          ts.ObjectFlags.Class | ts.ObjectFlags.Interface,
        ) &&
        checker.getPropertiesOfType(type).length === 0 &&
        checker.getIndexInfosOfType(type).length === 0 &&
        type.getCallSignatures().length === 0 &&
        type.getConstructSignatures().length === 0 &&
        // Types still awaiting type arguments, such as `Record<T, unknown>`
        // inside a generic declaration, also have no members yet.
        checker.isTypeAssignableTo(checker.getNumberType(), type)
      );
    }

    function containsEmptyObjectType(type: ts.Type) {
      return (
        isEmptyObjectType(type) ||
        (type.isUnion() && type.types.some(isEmptyObjectType))
      );
    }

    function checkNode(node: TSESTree.Node) {
      if (containsEmptyObjectType(services.getTypeAtLocation(node))) {
        context.report({
          node,
          messageId: 'noGeneratedEmptyObjectType',
        });
      }
    }

    return {
      TSIntersectionType: checkNode,
      TSTypeReference(node) {
        if (
          node.typeArguments &&
          node.parent.type !== AST_NODE_TYPES.TSIntersectionType
        ) {
          checkNode(node);
        }
      },
    };
  },
});
