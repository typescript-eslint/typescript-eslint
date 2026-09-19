import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule, getParserServices } from '../util';

export default createRule({
  name: 'no-object-literal-class-instances',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow object literals where a class instance is expected',
      requiresTypeChecking: true,
    },
    messages: {
      noObjectLiteralClassInstance:
        'This object literal is used where an instance of class `{{type}}` is expected.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isClassType(type: ts.Type) {
      return (
        tsutils.isObjectType(type) &&
        tsutils.isObjectFlagSet(
          tsutils.isTypeReference(type) ? type.target : type,
          ts.ObjectFlags.Class,
        )
      );
    }

    return {
      ObjectExpression(node) {
        const contextualType = checker.getContextualType(
          services.esTreeNodeToTSNodeMap.get(node),
        );
        if (!contextualType) {
          return;
        }

        const classTypes: ts.Type[] = [];
        const otherTypes: ts.Type[] = [];

        for (const constituent of tsutils.unionConstituents(contextualType)) {
          const classType = tsutils
            .intersectionConstituents(constituent)
            .find(isClassType);

          if (classType) {
            classTypes.push(classType);
          } else {
            otherTypes.push(constituent);
          }
        }

        if (classTypes.length === 0) {
          return;
        }

        const literalType = services.getTypeAtLocation(node);
        if (
          otherTypes.some(otherType =>
            checker.isTypeAssignableTo(literalType, otherType),
          )
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'noObjectLiteralClassInstance',
          data: {
            type: checker.typeToString(
              classTypes.find(classType =>
                checker.isTypeAssignableTo(literalType, classType),
              ) ?? classTypes[0],
            ),
          },
        });
      },
    };
  },
});
