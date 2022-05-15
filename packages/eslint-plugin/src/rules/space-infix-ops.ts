import { AST_TOKEN_TYPES, TSESTree } from '@typescript-eslint/utils';
import { getESLintCoreRule } from '../util/getESLintCoreRule';
import * as util from '../util';

const baseRule = getESLintCoreRule('space-infix-ops');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const UNIONS = ['|', '&'];

export default util.createRule<Options, MessageIds>({
  name: 'space-infix-ops',
  meta: {
    type: 'layout',
    docs: {
      description: 'Require spacing around infix operators',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: baseRule.meta.fixable,
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: {
      // @ts-expect-error -- we report on this messageId so we need to ensure it's there in case ESLint changes in future
      missingSpace: "Operator '{{operator}}' must be spaced.",
      ...baseRule.meta.messages,
    },
  },
  defaultOptions: [
    {
      int32Hint: false,
    },
  ],
  create(context) {
    const rules = baseRule.create(context);
    const sourceCode = context.getSourceCode();

    const report = (
      node: TSESTree.Node | TSESTree.Token,
      operator: TSESTree.Token,
    ): void => {
      context.report({
        node: node,
        loc: operator.loc,
        messageId: 'missingSpace',
        data: {
          operator: operator.value,
        },
        fix(fixer) {
          const previousToken = sourceCode.getTokenBefore(operator);
          const afterToken = sourceCode.getTokenAfter(operator);
          let fixString = '';

          if (operator.range[0] - previousToken!.range[1] === 0) {
            fixString = ' ';
          }

          fixString += operator.value;

          if (afterToken!.range[0] - operator.range[1] === 0) {
            fixString += ' ';
          }

          return fixer.replaceText(operator, fixString);
        },
      });
    };

    function isSpaceChar(token: TSESTree.Token): boolean {
      return token.type === AST_TOKEN_TYPES.Punctuator && token.value === '=';
    }

    function checkAndReportAssignmentSpace(
      node: TSESTree.Node,
      leftNode: TSESTree.Token,
      rightNode?: TSESTree.Token | null,
    ): void {
      if (!rightNode) {
        return;
      }

      const operator = sourceCode.getFirstTokenBetween(
        leftNode,
        rightNode,
        isSpaceChar,
      );

      const prev = sourceCode.getTokenBefore(operator!);
      const next = sourceCode.getTokenAfter(operator!);

      if (
        !sourceCode.isSpaceBetween!(prev!, operator!) ||
        !sourceCode.isSpaceBetween!(operator!, next!)
      ) {
        report(node, operator!);
      }
    }

    /**
     * Check if it has an assignment char and report if it's faulty
     * @param node The node to report
     */
    function checkForEnumAssignmentSpace(node: TSESTree.TSEnumMember): void {
      if (!node.initializer) {
        return;
      }

      const leftNode = sourceCode.getTokenByRangeStart(node.id.range[0])!;
      const rightNode = sourceCode.getTokenByRangeStart(
        node.initializer.range[0],
      )!;

      checkAndReportAssignmentSpace(node, leftNode, rightNode);
    }

    /**
     * Check if it has an assignment char and report if it's faulty
     * @param node The node to report
     */
    function checkForPropertyDefinitionAssignmentSpace(
      node: TSESTree.PropertyDefinition,
    ): void {
      const leftNode = sourceCode.getTokenByRangeStart(
        node.typeAnnotation?.range[0] ?? node.range[0],
      )!;
      const rightNode = node.value
        ? sourceCode.getTokenByRangeStart(node.value.range[0])
        : undefined;

      checkAndReportAssignmentSpace(node, leftNode, rightNode);
    }

    /**
     * Check if it is missing spaces between type annotations chaining
     * @param typeAnnotation TypeAnnotations list
     */
    function checkForTypeAnnotationSpace(
      typeAnnotation: TSESTree.TSIntersectionType | TSESTree.TSUnionType,
    ): void {
      const types = typeAnnotation.types;

      types.forEach(type => {
        const skipFunctionParenthesis =
          type.type === TSESTree.AST_NODE_TYPES.TSFunctionType
            ? util.isNotOpeningParenToken
            : 0;
        const operator = sourceCode.getTokenBefore(
          type,
          skipFunctionParenthesis,
        );

        if (operator != null && UNIONS.includes(operator.value)) {
          const prev = sourceCode.getTokenBefore(operator);
          const next = sourceCode.getTokenAfter(operator);

          if (
            !sourceCode.isSpaceBetween!(prev!, operator) ||
            !sourceCode.isSpaceBetween!(operator, next!)
          ) {
            report(typeAnnotation, operator);
          }
        }
      });
    }

    /**
     * Check if it has an assignment char and report if it's faulty
     * @param node The node to report
     */
    function checkForTypeAliasAssignment(
      node: TSESTree.TSTypeAliasDeclaration,
    ): void {
      const leftNode = sourceCode.getTokenByRangeStart(node.id.range[0])!;
      const rightNode = sourceCode.getTokenByRangeStart(
        node.typeAnnotation.range[0],
      );

      checkAndReportAssignmentSpace(node, leftNode, rightNode);
    }

    return {
      ...rules,
      TSEnumMember: checkForEnumAssignmentSpace,
      PropertyDefinition: checkForPropertyDefinitionAssignmentSpace,
      TSTypeAliasDeclaration: checkForTypeAliasAssignment,
      TSUnionType: checkForTypeAnnotationSpace,
      TSIntersectionType: checkForTypeAnnotationSpace,
    };
  },
});
