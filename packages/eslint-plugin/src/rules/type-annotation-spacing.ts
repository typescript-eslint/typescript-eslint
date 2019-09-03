import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

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
  }?,
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
    after: { type: 'boolean' },
  },
  additionalProperties: false,
};

export default util.createRule<Options, MessageIds>({
  name: 'type-annotation-spacing',
  meta: {
    type: 'layout',
    docs: {
      description: 'Require consistent spacing around type annotations',
      category: 'Stylistic Issues',
      recommended: 'error',
    },
    fixable: 'whitespace',
    messages: {
      expectedSpaceAfter: "Expected a space after the '{{type}}'.",
      expectedSpaceBefore: "Expected a space before the '{{type}}'.",
      unexpectedSpaceAfter: "Unexpected a space after the '{{type}}'.",
      unexpectedSpaceBefore: "Unexpected a space before the '{{type}}'.",
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
              arrow: definition,
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    // technically there is a default, but the overrides mean
    // that if we apply them here, it will break the no override case.
    {},
  ],
  create(context, [options]) {
    const punctuators = [':', '=>'];
    const sourceCode = context.getSourceCode();

    const overrides = options!.overrides || { colon: {}, arrow: {} };

    const colonOptions = Object.assign(
      {},
      { before: false, after: true },
      options,
      overrides.colon,
    );
    const arrowOptions = Object.assign(
      {},
      { before: true, after: true },
      options,
      overrides.arrow,
    );

    /**
     * Checks if there's proper spacing around type annotations (no space
     * before colon, one space after).
     */
    function checkTypeAnnotationSpacing(
      typeAnnotation: TSESTree.TypeNode,
    ): void {
      const nextToken = typeAnnotation;
      const punctuatorTokenEnd = sourceCode.getTokenBefore(nextToken)!;
      let punctuatorTokenStart = punctuatorTokenEnd;
      let previousToken = sourceCode.getTokenBefore(punctuatorTokenEnd)!;
      let type = punctuatorTokenEnd.value;

      if (!punctuators.includes(type)) {
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
            type,
          },
          fix(fixer) {
            return fixer.insertTextAfter(punctuatorTokenEnd, ' ');
          },
        });
      } else if (!after && nextDelta > 0) {
        context.report({
          node: punctuatorTokenEnd,
          messageId: 'unexpectedSpaceAfter',
          data: {
            type,
          },
          fix(fixer) {
            return fixer.removeRange([
              punctuatorTokenEnd.range[1],
              nextToken.range[0],
            ]);
          },
        });
      }

      if (before && previousDelta === 0) {
        context.report({
          node: punctuatorTokenStart,
          messageId: 'expectedSpaceBefore',
          data: {
            type,
          },
          fix(fixer) {
            return fixer.insertTextAfter(previousToken, ' ');
          },
        });
      } else if (!before && previousDelta > 0) {
        context.report({
          node: punctuatorTokenStart,
          messageId: 'unexpectedSpaceBefore',
          data: {
            type,
          },
          fix(fixer) {
            return fixer.removeRange([
              previousToken.range[1],
              punctuatorTokenStart.range[0],
            ]);
          },
        });
      }
    }

    return {
      TSMappedType(node): void {
        if (node.typeAnnotation) {
          checkTypeAnnotationSpacing(node.typeAnnotation);
        }
      },
      TSTypeAnnotation(node): void {
        checkTypeAnnotationSpacing(node.typeAnnotation);
      },
    };
  },
});
