import type { TSESLint } from '@typescript-eslint/utils';

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstraintInfo,
  getMovedNodeCode,
  getParserServices,
  isNodeOfType,
  isTypeFlagSet,
  isUndefinedIdentifier,
  nullThrows,
  NullThrowsReasons,
} from '../util';
import { rangeToLoc } from '../util/rangeToLoc';

export type MessageId = 'noUnnecessaryTemplateExpression';

type TemplateLiteralTypeOrValue =
  | TSESTree.TemplateLiteral
  | TSESTree.TSTemplateLiteralType;

interface InterpolationInfo {
  interpolation: TSESTree.Expression | TSESTree.TypeNode;
  prevQuasi: TSESTree.TemplateElement;
  nextQuasi: TSESTree.TemplateElement;
}

const evenNumOfBackslashesRegExp = /(?<!(?:[^\\]|^)(?:\\\\)*\\)/;

// '\\$' <- false
// '\\\\$' <- true
// '\\\\\\$' <- false
function endsWithUnescapedDollarSign(str: string): boolean {
  return new RegExp(`${evenNumOfBackslashesRegExp.source}\\$$`).test(str);
}

export default createRule<[], MessageId>({
  name: 'no-unnecessary-template-expression',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      recommended: 'strict',
      description: 'Disallow unnecessary template expressions',
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
    const checker = services.program.getTypeChecker();

    function isStringLike(type: ts.Type): boolean {
      return isTypeFlagSet(type, ts.TypeFlags.StringLike);
    }

    function isUnderlyingTypeString(type: ts.Type): boolean {
      if (type.isUnion()) {
        return type.types.every(isStringLike);
      }

      if (type.isIntersection()) {
        return type.types.some(isStringLike);
      }

      return isStringLike(type);
    }

    function isEnumMemberType(type: ts.Type): boolean {
      return tsutils.typeConstituents(type).some(t => {
        const symbol = t.getSymbol();
        return !!(
          symbol?.valueDeclaration && ts.isEnumMember(symbol.valueDeclaration)
        );
      });
    }

    const isLiteral = isNodeOfType(TSESTree.AST_NODE_TYPES.Literal);

    function isTemplateLiteral(
      node: TSESTree.Node,
    ): node is TSESTree.TemplateLiteral {
      return node.type === AST_NODE_TYPES.TemplateLiteral;
    }

    function isInfinityIdentifier(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.Identifier && node.name === 'Infinity'
      );
    }

    function isNaNIdentifier(node: TSESTree.Node): boolean {
      return node.type === AST_NODE_TYPES.Identifier && node.name === 'NaN';
    }

    function isFixableIdentifier(node: TSESTree.Node): boolean {
      return (
        isUndefinedIdentifier(node) ||
        isInfinityIdentifier(node) ||
        isNaNIdentifier(node)
      );
    }

    function hasCommentsBetweenQuasi(
      startQuasi: TSESTree.TemplateElement,
      endQuasi: TSESTree.TemplateElement,
    ): boolean {
      const startToken = nullThrows(
        context.sourceCode.getTokenByRangeStart(startQuasi.range[0]),
        NullThrowsReasons.MissingToken('`${', 'opening template literal'),
      );
      const endToken = nullThrows(
        context.sourceCode.getTokenByRangeStart(endQuasi.range[0]),
        NullThrowsReasons.MissingToken('}', 'closing template literal'),
      );

      return context.sourceCode.commentsExistBetween(startToken, endToken);
    }

    function isTrivialInterpolation(
      node: TSESTree.TemplateLiteral | TSESTree.TSTemplateLiteralType,
    ) {
      return (
        node.quasis.length === 2 &&
        node.quasis[0].value.raw === '' &&
        node.quasis[1].value.raw === ''
      );
    }

    function getInterpolations(
      node: TemplateLiteralTypeOrValue,
    ): TSESTree.Expression[] | TSESTree.TypeNode[] {
      if (node.type === AST_NODE_TYPES.TemplateLiteral) {
        return node.expressions;
      }
      return node.types;
    }

    function getInterpolationInfos(
      node: TemplateLiteralTypeOrValue,
    ): InterpolationInfo[] {
      return getInterpolations(node).map((interpolation, index) => ({
        interpolation,
        nextQuasi: node.quasis[index + 1],
        prevQuasi: node.quasis[index],
      }));
    }

    function getLiteral(
      node: TSESTree.Expression | TSESTree.TypeNode,
    ): TSESTree.Literal | null {
      const maybeLiteral =
        node.type === AST_NODE_TYPES.TSLiteralType ? node.literal : node;
      return isLiteral(maybeLiteral) ? maybeLiteral : null;
    }

    function getTemplateLiteral(
      node: TSESTree.Expression | TSESTree.TypeNode,
    ): TSESTree.TemplateLiteral | null {
      const maybeTemplateLiteral =
        node.type === AST_NODE_TYPES.TSLiteralType ? node.literal : node;
      return isTemplateLiteral(maybeTemplateLiteral)
        ? maybeTemplateLiteral
        : null;
    }

    function reportSingleInterpolation(node: TemplateLiteralTypeOrValue): void {
      const interpolations = getInterpolations(node);
      context.report({
        loc: rangeToLoc(context.sourceCode, [
          interpolations[0].range[0] - 2,
          interpolations[0].range[1] + 1,
        ]),
        messageId: 'noUnnecessaryTemplateExpression',
        fix(fixer): TSESLint.RuleFix | null {
          const wrappingCode = getMovedNodeCode({
            nodeToMove: interpolations[0],
            destinationNode: node,
            sourceCode: context.sourceCode,
          });

          return fixer.replaceText(node, wrappingCode);
        },
      });
    }

    function isUnncessaryValueInterpolation({
      interpolation,
      nextQuasi,
      prevQuasi,
    }: InterpolationInfo): boolean {
      if (hasCommentsBetweenQuasi(prevQuasi, nextQuasi)) {
        return false;
      }

      if (isFixableIdentifier(interpolation)) {
        return true;
      }

      if (isLiteral(interpolation)) {
        // allow trailing whitespace literal
        if (startsWithNewLine(nextQuasi.value.raw)) {
          return !(
            typeof interpolation.value === 'string' &&
            isWhitespace(interpolation.value)
          );
        }
        return true;
      }

      if (isTemplateLiteral(interpolation)) {
        // allow trailing whitespace literal
        if (startsWithNewLine(nextQuasi.value.raw)) {
          return !(
            interpolation.quasis.length === 1 &&
            isWhitespace(interpolation.quasis[0].value.raw)
          );
        }
        return true;
      }

      return false;
    }

    function isUnncessaryTypeInterpolation({
      interpolation,
      nextQuasi,
      prevQuasi,
    }: InterpolationInfo): boolean {
      if (hasCommentsBetweenQuasi(prevQuasi, nextQuasi)) {
        return false;
      }

      const literal = getLiteral(interpolation);
      if (literal) {
        // allow trailing whitespace literal
        if (startsWithNewLine(nextQuasi.value.raw)) {
          return !(
            typeof literal.value === 'string' && isWhitespace(literal.value)
          );
        }
        return true;
      }

      if (
        interpolation.type === AST_NODE_TYPES.TSNullKeyword ||
        interpolation.type === AST_NODE_TYPES.TSUndefinedKeyword
      ) {
        return true;
      }

      const templateLiteral = getTemplateLiteral(interpolation);
      if (templateLiteral) {
        // allow trailing whitespace literal
        if (startsWithNewLine(nextQuasi.value.raw)) {
          return !(
            templateLiteral.quasis.length === 1 &&
            isWhitespace(templateLiteral.quasis[0].value.raw)
          );
        }
        return true;
      }

      return false;
    }

    function getReportDescriptors(
      infos: InterpolationInfo[],
    ): TSESLint.ReportDescriptor<MessageId>[] {
      let nextCharacterIsOpeningCurlyBrace = false;
      const reportDescriptors: TSESLint.ReportDescriptor<MessageId>[] = [];
      const reversedInfos = [...infos].reverse();
      for (const { interpolation, nextQuasi, prevQuasi } of reversedInfos) {
        const fixers: ((fixer: TSESLint.RuleFixer) => TSESLint.RuleFix[])[] =
          [];

        if (nextQuasi.value.raw !== '') {
          nextCharacterIsOpeningCurlyBrace =
            nextQuasi.value.raw.startsWith('{');
        }

        const literal = getLiteral(interpolation);
        const templateLiteral = getTemplateLiteral(interpolation);
        if (literal) {
          let escapedValue = (
            typeof literal.value === 'string'
              ? // The value is already a string, so we're removing quotes:
                // "'va`lue'" -> "va`lue"
                literal.raw.slice(1, -1)
              : // The value may be one of number | bigint | boolean | RegExp | null.
                // In regular expressions, we escape every backslash
                String(literal.value).replaceAll('\\', '\\\\')
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
            .replaceAll(
              new RegExp(`${evenNumOfBackslashesRegExp.source}(\`|\\\${)`, 'g'),
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

          fixers.push(fixer => [fixer.replaceText(literal, escapedValue)]);
        } else if (templateLiteral) {
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
              templateLiteral.quasis[templateLiteral.quasis.length - 1].value
                .raw,
            )
          ) {
            fixers.push(fixer => [
              fixer.replaceTextRange(
                [templateLiteral.range[1] - 2, templateLiteral.range[1] - 2],
                '\\',
              ),
            ]);
          }
          if (
            templateLiteral.quasis.length === 1 &&
            templateLiteral.quasis[0].value.raw.length !== 0
          ) {
            nextCharacterIsOpeningCurlyBrace =
              templateLiteral.quasis[0].value.raw.startsWith('{');
          }

          // Remove the beginning and trailing backtick characters.
          fixers.push(fixer => [
            fixer.removeRange([
              templateLiteral.range[0],
              templateLiteral.range[0] + 1,
            ]),
            fixer.removeRange([
              templateLiteral.range[1] - 1,
              templateLiteral.range[1],
            ]),
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

        const warnLocStart = prevQuasi.range[1] - 2;
        const warnLocEnd = nextQuasi.range[0] + 1;
        reportDescriptors.push({
          loc: rangeToLoc(context.sourceCode, [warnLocStart, warnLocEnd]),
          messageId: 'noUnnecessaryTemplateExpression',
          fix(fixer): TSESLint.RuleFix[] {
            return [
              // Remove the quasis' parts that are related to the current expression.
              fixer.removeRange([warnLocStart, interpolation.range[0]]),
              fixer.removeRange([interpolation.range[1], warnLocEnd]),

              ...fixers.flatMap(cb => cb(fixer)),
            ];
          },
        });
      }
      return reportDescriptors;
    }

    return {
      TemplateLiteral(node: TSESTree.TemplateLiteral): void {
        if (node.parent.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          return;
        }
        if (
          isTrivialInterpolation(node) &&
          !hasCommentsBetweenQuasi(node.quasis[0], node.quasis[1])
        ) {
          const { constraintType } = getConstraintInfo(
            checker,
            services.getTypeAtLocation(node.expressions[0]),
          );
          if (constraintType && isUnderlyingTypeString(constraintType)) {
            reportSingleInterpolation(node);
            return;
          }
        }

        const infos = getInterpolationInfos(node).filter(
          isUnncessaryValueInterpolation,
        );

        for (const reportDescriptor of getReportDescriptors(infos)) {
          context.report(reportDescriptor);
        }
      },
      TSTemplateLiteralType(node: TSESTree.TSTemplateLiteralType): void {
        if (
          isTrivialInterpolation(node) &&
          !hasCommentsBetweenQuasi(node.quasis[0], node.quasis[1])
        ) {
          const { constraintType, isTypeParameter } = getConstraintInfo(
            checker,
            services.getTypeAtLocation(node.types[0]),
          );

          if (
            constraintType &&
            !isTypeParameter &&
            isUnderlyingTypeString(constraintType) &&
            !isEnumMemberType(constraintType)
          ) {
            reportSingleInterpolation(node);
            return;
          }
        }

        const infos = getInterpolationInfos(node).filter(
          isUnncessaryTypeInterpolation,
        );

        for (const reportDescriptor of getReportDescriptors(infos)) {
          context.report(reportDescriptor);
        }
      },
    };
  },
});

function isWhitespace(x: string): boolean {
  // allow empty string too since we went to allow
  // `      ${''}
  // `;
  //
  // in addition to
  // `${'        '}
  // `;
  //
  return /^\s*$/.test(x);
}

function startsWithNewLine(x: string): boolean {
  return x.startsWith('\n') || x.startsWith('\r\n');
}
