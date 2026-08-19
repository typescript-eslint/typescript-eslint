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
      requiresTypeChecking: true,
    },
    messages: {
      noGeneratedEmptyObjectType: [
        'This type resolves to `{}`, which allows any non-nullish value, including literals like `0` and `""`.',
        '- If you want a type meaning "any object", you probably want `object` instead.',
        '- If you want a type meaning "any value", you probably want `unknown` instead.',
      ].join('\n'),
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isEmptyObjectType(type: ts.Type): boolean {
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

    return {
      TSTypeReference(node): void {
        if (
          !node.typeArguments ||
          node.parent.type === AST_NODE_TYPES.TSIntersectionType
        ) {
          return;
        }

        if (isEmptyObjectType(services.getTypeAtLocation(node))) {
          context.report({
            node,
            messageId: 'noGeneratedEmptyObjectType',
          });
        }
      },
    };
  },
});
