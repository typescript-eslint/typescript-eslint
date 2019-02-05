/**
 * @fileoverview Enforces spacing around type annotations.
 * @author Nicholas C. Zakas
 * @author Patricio Trevino
 */

import RuleModule from 'ts-eslint';
import * as util from '../util';
import { TSESTree } from '@typescript-eslint/typescript-estree';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [
  {
    before?: boolean;
    after?: boolean;
    overrides?: {
      colon?: {
        before?: boolean;
        after?: boolean;
      };
      arrow?: {
        before?: boolean;
        after?: boolean;
      };
    };
  }?
];
type MessageIds =
  | 'expectedSpaceAfter'
  | 'expectedSpaceBefore'
  | 'unexpectedSpaceAfter'
  | 'unexpectedSpaceBefore';

const definition = {
  type: 'object',
  properties: {
    before: { type: 'boolean' },
    after: { type: 'boolean' }
  },
  additionalProperties: false
};

const defaultOptions: Options = [
  // technically there is a default, but the overrides mean
  // that if we apply them here, it will break the no override case.
  {}
];

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Require consistent spacing around type annotations',
      extraDescription: [util.tslintRule('typedef-whitespace')],
      category: 'Stylistic Issues',
      url: util.metaDocsUrl('type-annotation-spacing'),
      recommended: 'error'
    },
    fixable: 'whitespace',
    messages: {
      expectedSpaceAfter: "Expected a space after the '{{type}}'.",
      expectedSpaceBefore: "Expected a space before the '{{type}}'.",
      unexpectedSpaceAfter: "Unexpected a space after the '{{type}}'.",
      unexpectedSpaceBefore: "Unexpected a space before the '{{type}}'."
    },
    schema: [
      {
        type: 'object',
        properties: {
          before: { type: 'boolean' },
          after: { type: 'boolean' },
          overrides: {
            type: 'object',
            properties: {
              colon: definition,
              arrow: definition
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const punctuators = [':', '=>'];
    const sourceCode = context.getSourceCode();
    const options = util.applyDefault(defaultOptions, context.options)[0];

    const overrides = options!.overrides || { colon: {}, arrow: {} };

    const colonOptions = Object.assign(
      {},
      { before: false, after: true },
      options,
      overrides.colon
    );
    const arrowOptions = Object.assign(
      {},
      { before: true, after: true },
      options,
      overrides.arrow
    );

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Checks if there's proper spacing around type annotations (no space
     * before colon, one space after).
     */
    function checkTypeAnnotationSpacing(
      typeAnnotation: TSESTree.TypeNode
    ): void {
      const nextToken = typeAnnotation;
      const punctuatorTokenEnd = sourceCode.getTokenBefore(nextToken)!;
      let punctuatorTokenStart = punctuatorTokenEnd;
      let previousToken = sourceCode.getTokenBefore(punctuatorTokenEnd)!;
      let type = punctuatorTokenEnd.value;

      if (punctuators.indexOf(type) === -1) {
        return;
      }

      const before = type === ':' ? colonOptions.before : arrowOptions.before;
      const after = type === ':' ? colonOptions.after : arrowOptions.after;

      if (type === ':' && previousToken.value === '?') {
        // shift the start to the ?
        type = '?:';
        punctuatorTokenStart = previousToken;
        previousToken = sourceCode.getTokenBefore(previousToken)!;

        // handle the +/- modifiers for optional modification operators
        if (previousToken.value === '+' || previousToken.value === '-') {
          type = `${previousToken.value}?:`;
          punctuatorTokenStart = previousToken;
          previousToken = sourceCode.getTokenBefore(previousToken)!;
        }
      }

      const previousDelta =
        punctuatorTokenStart.range[0] - previousToken.range[1];
      const nextDelta = nextToken.range[0] - punctuatorTokenEnd.range[1];

      if (after && nextDelta === 0) {
        context.report({
          node: punctuatorTokenEnd,
          messageId: 'expectedSpaceAfter',
          data: {
            type
          },
          fix(fixer) {
            return fixer.insertTextAfter(punctuatorTokenEnd, ' ');
          }
        });
      } else if (!after && nextDelta > 0) {
        context.report({
          node: punctuatorTokenEnd,
          messageId: 'unexpectedSpaceAfter',
          data: {
            type
          },
          fix(fixer) {
            return fixer.removeRange([
              punctuatorTokenEnd.range[1],
              nextToken.range[0]
            ]);
          }
        });
      }

      if (before && previousDelta === 0) {
        context.report({
          node: punctuatorTokenStart,
          messageId: 'expectedSpaceBefore',
          data: {
            type
          },
          fix(fixer) {
            return fixer.insertTextAfter(previousToken, ' ');
          }
        });
      } else if (!before && previousDelta > 0) {
        context.report({
          node: punctuatorTokenStart,
          messageId: 'unexpectedSpaceBefore',
          data: {
            type
          },
          fix(fixer) {
            return fixer.removeRange([
              previousToken.range[1],
              punctuatorTokenStart.range[0]
            ]);
          }
        });
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      TSMappedType(node: TSESTree.TSMappedType) {
        if (node.typeAnnotation) {
          checkTypeAnnotationSpacing(node.typeAnnotation);
        }
      },
      TSTypeAnnotation(node: TSESTree.TSTypeAnnotation) {
        checkTypeAnnotationSpacing(node.typeAnnotation);
      }
    };
  }
};
export default rule;
export { Options, MessageIds };
