import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  isTypeFlagSet,
  isUndefinedIdentifier,
} from '../util';

type MessageId = 'noUnnecessaryTemplateExpression';

const evenNumOfBackslashesRegExp = /(?<!(?:[^\\]|^)(?:\\\\)*\\)/;

// '\\$' <- false
// '\\\\$' <- true
// '\\\\\\$' <- false
function endsWithUnescapedDollarSign(str: string): boolean {
  return new RegExp(`${String(evenNumOfBackslashesRegExp.source)}\\$$`).test(
    str,
  );
}

export default createRule<[], MessageId>({
  name: 'no-unnecessary-template-expression',
  meta: {
    fixable: 'code',
    type: 'suggestion',
    docs: {
      description: 'Disallow unnecessary template expressions',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      noUnnecessaryTemplateExpression:
        'Template literal expression is unnecessary and can be simplified.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);

    function isUnderlyingTypeString(
      expression: TSESTree.Expression,
    ): expression is TSESTree.StringLiteral | TSESTree.Identifier {
      const type = getConstrainedTypeAtLocation(services, expression);

      const isString = (t: ts.Type): boolean => {
        return isTypeFlagSet(t, ts.TypeFlags.StringLike);
      };

      if (type.isUnion()) {
        return type.types.every(isString);
      }

      if (type.isIntersection()) {
        return type.types.some(isString);
      }

      return isString(type);
    }

    function isLiteral(
      expression: TSESTree.Expression,
    ): expression is TSESTree.Literal {
      return expression.type === AST_NODE_TYPES.Literal;
    }

    function isTemplateLiteral(
      expression: TSESTree.Expression,
    ): expression is TSESTree.TemplateLiteral {
      return expression.type === AST_NODE_TYPES.TemplateLiteral;
    }

    function isInfinityIdentifier(expression: TSESTree.Expression): boolean {
      return (
        expression.type === AST_NODE_TYPES.Identifier &&
        expression.name === 'Infinity'
      );
    }

    function isNaNIdentifier(expression: TSESTree.Expression): boolean {
      return (
        expression.type === AST_NODE_TYPES.Identifier &&
        expression.name === 'NaN'
      );
    }

    return {
      TemplateLiteral(node: TSESTree.TemplateLiteral): void {
        if (node.parent.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          return;
        }

        const hasSingleStringVariable =
          node.quasis.length === 2 &&
          node.quasis[0].value.raw === '' &&
          node.quasis[1].value.raw === '' &&
          node.expressions.length === 1 &&
          isUnderlyingTypeString(node.expressions[0]);

        if (hasSingleStringVariable) {
          context.report({
            node: node.expressions[0],
            messageId: 'noUnnecessaryTemplateExpression',
            fix(fixer): TSESLint.RuleFix[] {
              const [prevQuasi, nextQuasi] = node.quasis;

              // Remove the quasis and backticks.
              return [
                fixer.removeRange([
                  prevQuasi.range[1] - 3,
                  node.expressions[0].range[0],
                ]),

                fixer.removeRange([
                  node.expressions[0].range[1],
                  nextQuasi.range[0] + 2,
                ]),
              ];
            },
          });

          return;
        }

        const fixableExpressions = node.expressions
          .filter(
            expression =>
              isLiteral(expression) ||
              isTemplateLiteral(expression) ||
              isUndefinedIdentifier(expression) ||
              isInfinityIdentifier(expression) ||
              isNaNIdentifier(expression),
          )
          .reverse();

        let nextCharacterIsOpeningCurlyBrace = false;

        for (const expression of fixableExpressions) {
          const fixers: ((fixer: TSESLint.RuleFixer) => TSESLint.RuleFix[])[] =
            [];
          const index = node.expressions.indexOf(expression);
          const prevQuasi = node.quasis[index];
          const nextQuasi = node.quasis[index + 1];

          if (nextQuasi.value.raw.length !== 0) {
            nextCharacterIsOpeningCurlyBrace =
              nextQuasi.value.raw.startsWith('{');
          }

          if (isLiteral(expression)) {
            let escapedValue = (
              typeof expression.value === 'string'
                ? // The value is already a string, so we're removing quotes:
                  // "'va`lue'" -> "va`lue"
                  expression.raw.slice(1, -1)
                : // The value may be one of number | bigint | boolean | RegExp | null.
                  // In regular expressions, we escape every backslash
                  String(expression.value).replace(/\\/g, '\\\\')
            )
              // The string or RegExp may contain ` or ${.
              // We want both of these to be escaped in the final template expression.
              //
              // A pair of backslashes means "escaped backslash", so backslashes
              // from this pair won't escape ` or ${. Therefore, to escape these
              // sequences in the resulting template expression, we need to escape
              // all sequences that are preceded by an even number of backslashes.
              //
              // This RegExp does the following transformations:
              // \` -> \`
              // \\` -> \\\`
              // \${ -> \${
              // \\${ -> \\\${
              .replace(
                new RegExp(
                  `${String(evenNumOfBackslashesRegExp.source)}(\`|\\\${)`,
                  'g',
                ),
                '\\$1',
              );

            // `...${'...$'}{...`
            //           ^^^^
            if (
              nextCharacterIsOpeningCurlyBrace &&
              endsWithUnescapedDollarSign(escapedValue)
            ) {
              escapedValue = escapedValue.replaceAll(/\$$/g, '\\$');
            }

            if (escapedValue.length !== 0) {
              nextCharacterIsOpeningCurlyBrace = escapedValue.startsWith('{');
            }

            fixers.push(fixer => [fixer.replaceText(expression, escapedValue)]);
          } else if (isTemplateLiteral(expression)) {
            // Since we iterate from the last expression to the first,
            // a subsequent expression can tell the current expression
            // that it starts with {.
            //
            // `... ${`... $`}${'{...'} ...`
            //             ^     ^ subsequent expression starts with {
            //             current expression ends with a dollar sign,
            //             so '$' + '{' === '${' (bad news for us).
            //             Let's escape the dollar sign at the end.
            if (
              nextCharacterIsOpeningCurlyBrace &&
              endsWithUnescapedDollarSign(
                expression.quasis[expression.quasis.length - 1].value.raw,
              )
            ) {
              fixers.push(fixer => [
                fixer.replaceTextRange(
                  [expression.range[1] - 2, expression.range[1] - 2],
                  '\\',
                ),
              ]);
            }
            if (
              expression.quasis.length === 1 &&
              expression.quasis[0].value.raw.length !== 0
            ) {
              nextCharacterIsOpeningCurlyBrace =
                expression.quasis[0].value.raw.startsWith('{');
            }

            // Remove the beginning and trailing backtick characters.
            fixers.push(fixer => [
              fixer.removeRange([expression.range[0], expression.range[0] + 1]),
              fixer.removeRange([expression.range[1] - 1, expression.range[1]]),
            ]);
          } else {
            nextCharacterIsOpeningCurlyBrace = false;
          }

          // `... $${'{...'} ...`
          //      ^^^^^
          if (
            nextCharacterIsOpeningCurlyBrace &&
            endsWithUnescapedDollarSign(prevQuasi.value.raw)
          ) {
            fixers.push(fixer => [
              fixer.replaceTextRange(
                [prevQuasi.range[1] - 3, prevQuasi.range[1] - 2],
                '\\$',
              ),
            ]);
          }

          context.report({
            node: expression,
            messageId: 'noUnnecessaryTemplateExpression',
            fix(fixer): TSESLint.RuleFix[] {
              return [
                // Remove the quasis' parts that are related to the current expression.
                fixer.removeRange([
                  prevQuasi.range[1] - 2,
                  expression.range[0],
                ]),
                fixer.removeRange([
                  expression.range[1],
                  nextQuasi.range[0] + 1,
                ]),

                ...fixers.flatMap(cb => cb(fixer)),
              ];
            },
          });
        }
      },
    };
  },
});
