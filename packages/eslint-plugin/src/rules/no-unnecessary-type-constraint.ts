import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import { extname } from 'node:path';
import * as ts from 'typescript';

import type { MakeRequired } from '../util';

import {
  createRule,
  isClosingParenToken,
  nullThrows,
  NullThrowsReasons,
} from '../util';

type TypeParameterWithConstraint = MakeRequired<
  TSESTree.TSTypeParameter,
  'constraint'
>;

export default createRule({
  name: 'no-unnecessary-type-constraint',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unnecessary constraints on generic types',
      recommended: 'recommended',
    },
    hasSuggestions: true,
    messages: {
      removeUnnecessaryConstraint:
        'Remove the unnecessary `{{constraint}}` constraint.',
      unnecessaryConstraint:
        'Constraining the generic type `{{name}}` to `{{constraint}}` does nothing and is unnecessary.',
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    // In theory, we could use the type checker for more advanced constraint types...
    // ...but in practice, these types are rare, and likely not worth requiring type info.
    // https://github.com/typescript-eslint/typescript-eslint/pull/2516#discussion_r495731858
    const unnecessaryConstraints = new Map([
      [AST_NODE_TYPES.TSAnyKeyword, 'any'],
      [AST_NODE_TYPES.TSUnknownKeyword, 'unknown'],
    ]);

    function checkRequiresGenericDeclarationDisambiguation(
      filename: string,
    ): boolean {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
      const pathExt = extname(filename).toLocaleLowerCase() as ts.Extension;
      switch (pathExt) {
        case ts.Extension.Cts:
        case ts.Extension.Mts:
        case ts.Extension.Tsx:
          return true;

        default:
          return false;
      }
    }

    const requiresGenericDeclarationDisambiguation =
      checkRequiresGenericDeclarationDisambiguation(context.filename);

    const checkNode = (
      node: TypeParameterWithConstraint,
      inArrowFunction: boolean,
    ): void => {
      const constraint = unnecessaryConstraints.get(node.constraint.type);
      function shouldAddTrailingComma(): boolean {
        if (!inArrowFunction || !requiresGenericDeclarationDisambiguation) {
          return false;
        }
        // Only <T>() => {} would need trailing comma
        return (
          (node.parent as TSESTree.TSTypeParameterDeclaration).params.length ===
            1 &&
          context.sourceCode.getTokensAfter(node)[0].value !== ',' &&
          !node.default
        );
      }

      if (constraint) {
        context.report({
          node,
          messageId: 'unnecessaryConstraint',
          data: {
            name: node.name.name,
            constraint,
          },
          suggest: [
            {
              messageId: 'removeUnnecessaryConstraint',
              data: {
                constraint,
              },
              fix(fixer): TSESLint.RuleFix | null {
                const { sourceCode } = context;
                // the constraint's range doesn't include any parentheses around it
                let constraintEnd = nullThrows(
                  sourceCode.getLastToken(node.constraint),
                  NullThrowsReasons.MissingToken('token', 'constraint'),
                );
                for (
                  let next = sourceCode.getTokenAfter(constraintEnd);
                  next && isClosingParenToken(next);
                  next = sourceCode.getTokenAfter(next)
                ) {
                  constraintEnd = next;
                }

                const removedRange: TSESTree.Range = [
                  node.name.range[1],
                  constraintEnd.range[1],
                ];
                const comments = sourceCode
                  .getCommentsInside(node)
                  .filter(
                    comment =>
                      comment.range[0] >= removedRange[0] &&
                      comment.range[1] <= removedRange[1],
                  );
                // a line comment would swallow whatever follows it on its line
                const commentsText = comments
                  .map(
                    comment =>
                      ` ${sourceCode.getText(comment)}${comment.type === AST_TOKEN_TYPES.Line ? '\n' : ''}`,
                  )
                  .join('');

                return fixer.replaceTextRange(
                  removedRange,
                  `${commentsText}${shouldAddTrailingComma() ? ',' : ''}`,
                );
              },
            },
          ],
        });
      }
    };

    return {
      ':not(ArrowFunctionExpression) > TSTypeParameterDeclaration > TSTypeParameter[constraint]'(
        node: TypeParameterWithConstraint,
      ): void {
        checkNode(node, false);
      },
      'ArrowFunctionExpression > TSTypeParameterDeclaration > TSTypeParameter[constraint]'(
        node: TypeParameterWithConstraint,
      ): void {
        checkNode(node, true);
      },
    };
  },
});
