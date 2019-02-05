/**
 * @fileoverview Rule to warn if a type assertion does not change the type of an expression
 * @author Benjamin Lichtman
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as tsutils from 'tsutils';
import ts from 'typescript';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [
  {
    typesToIgnore?: string[];
  }
];
type MessageIds = 'unnecessaryAssertion';

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    docs: {
      description:
        'Warns if a type assertion does not change the type of an expression',
      category: 'Best Practices',
      recommended: false,
      extraDescription: [util.tslintRule('no-unnecessary-type-assertion')],
      url: util.metaDocsUrl('no-unnecessary-type-assertion')
    },
    fixable: 'code',
    messages: {
      unnecessaryAssertion:
        'This assertion is unnecessary since it does not change the type of the expression.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          typesToIgnore: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
    ],
    type: 'suggestion'
  },

  create(context) {
    const parserServices = util.getParserServices(context);

    /**
     * Sometimes tuple types don't have ObjectFlags.Tuple set, like when they're being matched against an inferred type.
     * So, in addition, check if there are integer properties 0..n and no other numeric keys
     * @param type type
     * @returns true if type could be a tuple type
     */
    function couldBeTupleType(type: ts.ObjectType): boolean {
      const properties = type.getProperties();

      if (properties.length === 0) {
        return false;
      }
      let i = 0;

      for (; i < properties.length; ++i) {
        const name = properties[i].name;

        if (String(i) !== name) {
          if (i === 0) {
            // if there are no integer properties, this is not a tuple
            return false;
          }
          break;
        }
      }
      for (; i < properties.length; ++i) {
        if (String(+properties[i].name) === properties[i].name) {
          return false; // if there are any other numeric properties, this is not a tuple
        }
      }
      return true;
    }

    /**
     * @param node node being linted
     * @param checker TypeScript typechecker
     */
    function checkNonNullAssertion(
      node: TSESTree.Node,
      checker: ts.TypeChecker
    ): void {
      /**
       * Corresponding TSNode is guaranteed to be in map
       */
      const originalNode = parserServices.esTreeNodeToTSNodeMap.get<
        ts.NonNullExpression
      >(node);
      const type = checker.getTypeAtLocation(originalNode.expression);

      if (type === checker.getNonNullableType(type)) {
        context.report({
          node,
          messageId: 'unnecessaryAssertion',
          fix(fixer) {
            return fixer.removeRange([
              originalNode.expression.end,
              originalNode.end
            ]);
          }
        });
      }
    }

    /**
     * @param node node being linted
     * @param checker TypeScript typechecker
     */
    function verifyCast(node: TSESTree.Node, checker: ts.TypeChecker): void {
      const originalNode = parserServices.esTreeNodeToTSNodeMap.get<
        ts.AssertionExpression
      >(node);
      const options = context.options[0];

      if (
        options &&
        options.typesToIgnore &&
        options.typesToIgnore.indexOf(originalNode.type.getText()) !== -1
      ) {
        return;
      }
      const castType = checker.getTypeAtLocation(originalNode);

      if (
        tsutils.isTypeFlagSet(castType, ts.TypeFlags.Literal) ||
        (tsutils.isObjectType(castType) &&
          (tsutils.isObjectFlagSet(castType, ts.ObjectFlags.Tuple) ||
            couldBeTupleType(castType)))
      ) {
        // It's not always safe to remove a cast to a literal type or tuple
        // type, as those types are sometimes widened without the cast.
        return;
      }

      const uncastType = checker.getTypeAtLocation(originalNode.expression);

      if (uncastType === castType) {
        context.report({
          node,
          messageId: 'unnecessaryAssertion',
          fix(fixer) {
            return originalNode.kind === ts.SyntaxKind.TypeAssertionExpression
              ? fixer.removeRange([
                  originalNode.getStart(),
                  originalNode.expression.getStart()
                ])
              : fixer.removeRange([
                  originalNode.expression.end,
                  originalNode.end
                ]);
          }
        });
      }
    }

    const checker = parserServices.program.getTypeChecker();

    return {
      TSNonNullExpression(node: TSESTree.TSNonNullExpression) {
        checkNonNullAssertion(node, checker);
      },
      TSTypeAssertion(node: TSESTree.TSTypeAssertion) {
        verifyCast(node, checker);
      },
      TSAsExpression(node: TSESTree.TSAsExpression) {
        verifyCast(node, checker);
      }
    };
  }
};
export default rule;
export { Options, MessageIds };
