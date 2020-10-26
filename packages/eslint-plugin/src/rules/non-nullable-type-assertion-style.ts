import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

export default util.createRule({
  name: 'non-nullable-type-assertion-style',
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Prefers a non-null assertion over explicit type cast when possible',
      recommended: false,
      requiresTypeChecking: true,
      suggestion: true,
    },
    fixable: 'code',
    messages: {
      preferNonNullAssertion:
        'Use a ! assertion to more succintly remove null and undefined from the type.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],

  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const sourceCode = context.getSourceCode();

    const getTypesIfNotLoose = (node: TSESTree.Node): ts.Type[] | undefined => {
      const type = checker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(node),
      );

      if (
        tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)
      ) {
        return undefined;
      }

      return tsutils.unionTypeParts(type);
    };

    const sameTypeWithoutNullish = (
      assertedTypes: ts.Type[],
      originalTypes: ts.Type[],
    ): boolean => {
      const nonNullishOriginalTypes = originalTypes.filter(
        type =>
          type.flags !== ts.TypeFlags.Null &&
          type.flags !== ts.TypeFlags.Undefined,
      );

      for (const assertedType of assertedTypes) {
        if (!nonNullishOriginalTypes.includes(assertedType)) {
          return false;
        }
      }

      for (const originalType of nonNullishOriginalTypes) {
        if (!assertedTypes.includes(originalType)) {
          return false;
        }
      }

      return true;
    };

    return {
      'TSAsExpression, TSTypeAssertion'(
        node: TSESTree.TSTypeAssertion | TSESTree.TSAsExpression,
      ): void {
        const originalTypes = getTypesIfNotLoose(node.expression);
        if (!originalTypes) {
          return;
        }

        const assertedTypes = getTypesIfNotLoose(node.typeAnnotation);
        if (!assertedTypes) {
          return;
        }

        if (sameTypeWithoutNullish(assertedTypes, originalTypes)) {
          context.report({
            fix(fixer) {
              return fixer.replaceText(
                node,
                `${sourceCode.getText(node.expression)}!`,
              );
            },
            messageId: 'preferNonNullAssertion',
            node,
          });
        }
      },
    };
  },
});
