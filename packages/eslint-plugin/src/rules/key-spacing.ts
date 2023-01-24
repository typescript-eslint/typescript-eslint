import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('key-spacing');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const baseSchema = Array.isArray(baseRule.meta.schema)
  ? baseRule.meta.schema[0]
  : baseRule.meta.schema;

export default util.createRule<Options, MessageIds>({
  name: 'key-spacing',
  meta: {
    type: 'layout',
    docs: {
      description:
        'Enforce consistent spacing between property names and type annotations in types and interfaces',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: [baseSchema],
    messages: baseRule.meta.messages,
  },
  defaultOptions: [{}],

  create(context, [options]) {
    const sourceCode = context.getSourceCode();
    const baseRules = baseRule.create(context);

    /**
     * Starting from the given a node (a property.key node here) looks forward
     * until it finds the last token before a colon punctuator and returns it.
     */
    function getLastTokenBeforeColon(node: TSESTree.Node): TSESTree.Token {
      const colonToken = sourceCode.getTokenAfter(node, util.isColonToken)!;

      return sourceCode.getTokenBefore(colonToken)!;
    }

    /**
     * Relevant nodes to our rule
     *
     * node.typeAnnotation will always be defined, but no way to enforce that and keep
     * the type compatible with TSEstree.Node (except maybe TS 4.9' "satisfies" keyword)
     */
    type KeyTypeNode =
      | TSESTree.TSIndexSignature
      | TSESTree.TSPropertySignature
      | TSESTree.PropertyDefinition;

    function isKeyTypeNode(node: TSESTree.Node): node is KeyTypeNode {
      return (
        (node.type === AST_NODE_TYPES.TSPropertySignature ||
          node.type === AST_NODE_TYPES.TSIndexSignature ||
          node.type === AST_NODE_TYPES.PropertyDefinition) &&
        !!node.typeAnnotation
      );
    }

    /**
     * To handle index signatures, to get the whole text for the parameters
     */
    function getKeyText(node: KeyTypeNode): string {
      if ('key' in node) {
        return sourceCode.getText(node.key);
      }

      const code = sourceCode.getText(node);
      return code.slice(
        0,
        sourceCode.getTokenAfter(
          node.parameters.at(-1)!,
          util.isClosingBracketToken,
        )!.range[1] - node.range[0],
      );
    }

    /**
     * To handle index signatures, be able to get the end position of the parameters
     */
    function getKeyLocEnd(node: KeyTypeNode): TSESTree.Position {
      return getLastTokenBeforeColon(
        'key' in node ? node.key : node.parameters.at(-1)!,
      ).loc.end;
    }

    function checkBeforeColon(
      node: KeyTypeNode,
      expectedWhitespaceBeforeColon: number,
      mode: 'strict' | 'minimum',
    ): void {
      const colon = node.typeAnnotation!.loc.start.column;
      const keyEnd = getKeyLocEnd(node);
      const difference = colon - keyEnd.column - expectedWhitespaceBeforeColon;
      if (mode === 'strict' ? difference : difference < 0) {
        context.report({
          node,
          messageId: difference > 0 ? 'extraKey' : 'missingKey',
          fix: fixer => {
            if (difference > 0) {
              return fixer.removeRange([
                node.typeAnnotation!.range[0] - difference,
                node.typeAnnotation!.range[0],
              ]);
            } else {
              return fixer.insertTextBefore(
                node.typeAnnotation!,
                ' '.repeat(-difference),
              );
            }
          },
          data: {
            computed: '',
            key: getKeyText(node),
          },
        });
      }
    }

    function checkAfterColon(
      node: KeyTypeNode,
      expectedWhitespaceAfterColon: number,
      mode: 'strict' | 'minimum',
    ): void {
      const colon = node.typeAnnotation!.loc.start.column;
      const typeStart = node.typeAnnotation!.typeAnnotation.loc.start.column;
      const difference = typeStart - colon - 1 - expectedWhitespaceAfterColon;
      if (mode === 'strict' ? difference : difference < 0) {
        context.report({
          node,
          messageId: difference > 0 ? 'extraValue' : 'missingValue',
          fix: fixer => {
            if (difference > 0) {
              return fixer.removeRange([
                node.typeAnnotation!.typeAnnotation.range[0] - difference,
                node.typeAnnotation!.typeAnnotation.range[0],
              ]);
            } else {
              return fixer.insertTextBefore(
                node.typeAnnotation!.typeAnnotation,
                ' '.repeat(-difference),
              );
            }
          },
          data: {
            computed: '',
            key: getKeyText(node),
          },
        });
      }
    }

    // adapted from  https://github.com/eslint/eslint/blob/ba74253e8bd63e9e163bbee0540031be77e39253/lib/rules/key-spacing.js#L356
    function continuesAlignGroup(
      lastMember: TSESTree.Node,
      candidate: TSESTree.Node,
    ): boolean {
      const groupEndLine = lastMember.loc.start.line;
      const candidateValueStartLine = (
        isKeyTypeNode(candidate) ? candidate.typeAnnotation! : candidate
      ).loc.start.line;

      if (candidateValueStartLine === groupEndLine) {
        return false;
      }

      if (candidateValueStartLine - groupEndLine === 1) {
        return true;
      }

      /*
       * Check that the first comment is adjacent to the end of the group, the
       * last comment is adjacent to the candidate property, and that successive
       * comments are adjacent to each other.
       */
      const leadingComments = sourceCode.getCommentsBefore(candidate);

      if (
        leadingComments.length &&
        leadingComments[0].loc.start.line - groupEndLine <= 1 &&
        candidateValueStartLine - leadingComments.at(-1)!.loc.end.line <= 1
      ) {
        for (let i = 1; i < leadingComments.length; i++) {
          if (
            leadingComments[i].loc.start.line -
              leadingComments[i - 1].loc.end.line >
            1
          ) {
            return false;
          }
        }
        return true;
      }

      return false;
    }

    function checkAlignGroup(group: TSESTree.Node[]): void {
      let alignColumn = 0;
      const align: 'value' | 'colon' =
        (typeof options.align === 'object'
          ? options.align.on
          : typeof options.multiLine?.align === 'object'
          ? options.multiLine.align.on
          : options.multiLine?.align ?? options.align) ?? 'colon';
      const beforeColon =
        (typeof options.align === 'object'
          ? options.align.beforeColon
          : options.multiLine
          ? typeof options.multiLine.align === 'object'
            ? options.multiLine.align.beforeColon
            : options.multiLine.beforeColon
          : options.beforeColon) ?? false;
      const expectedWhitespaceBeforeColon = beforeColon ? 1 : 0;
      const afterColon =
        (typeof options.align === 'object'
          ? options.align.afterColon
          : options.multiLine
          ? typeof options.multiLine.align === 'object'
            ? options.multiLine.align.afterColon
            : options.multiLine.afterColon
          : options.afterColon) ?? true;
      const expectedWhitespaceAfterColon = afterColon ? 1 : 0;
      const mode =
        (typeof options.align === 'object'
          ? options.align.mode
          : options.multiLine
          ? typeof options.multiLine.align === 'object'
            ? // same behavior as in original rule
              options.multiLine.align.mode ?? options.multiLine.mode
            : options.multiLine.mode
          : options.mode) ?? 'strict';

      for (const node of group) {
        if (isKeyTypeNode(node)) {
          alignColumn = Math.max(
            alignColumn,
            align === 'colon'
              ? getKeyLocEnd(node).column + expectedWhitespaceBeforeColon
              : getKeyLocEnd(node).column +
                  ':'.length +
                  expectedWhitespaceAfterColon +
                  expectedWhitespaceBeforeColon,
          );
        }
      }

      for (const node of group) {
        if (!isKeyTypeNode(node)) {
          continue;
        }
        const toCheck =
          align === 'colon'
            ? node.typeAnnotation!
            : node.typeAnnotation!.typeAnnotation;
        const difference = toCheck.loc.start.column - alignColumn;

        if (difference) {
          context.report({
            node,
            messageId:
              difference > 0
                ? align === 'colon'
                  ? 'extraKey'
                  : 'extraValue'
                : align === 'colon'
                ? 'missingKey'
                : 'missingValue',
            fix: fixer => {
              if (difference > 0) {
                return fixer.removeRange([
                  toCheck.range[0] - difference,
                  toCheck.range[0],
                ]);
              } else {
                return fixer.insertTextBefore(toCheck, ' '.repeat(-difference));
              }
            },
            data: {
              computed: '',
              key: getKeyText(node),
            },
          });
        }

        if (align === 'colon') {
          checkAfterColon(node, expectedWhitespaceAfterColon, mode);
        } else {
          checkBeforeColon(node, expectedWhitespaceBeforeColon, mode);
        }
      }
    }

    function checkIndividualNode(
      node: TSESTree.Node,
      { singleLine }: { singleLine: boolean },
    ): void {
      const beforeColon =
        (singleLine
          ? options.singleLine
            ? options.singleLine.beforeColon
            : options.beforeColon
          : options.multiLine
          ? options.multiLine.beforeColon
          : options.beforeColon) ?? false;
      const expectedWhitespaceBeforeColon = beforeColon ? 1 : 0;
      const afterColon =
        (singleLine
          ? options.singleLine
            ? options.singleLine.afterColon
            : options.afterColon
          : options.multiLine
          ? options.multiLine.afterColon
          : options.afterColon) ?? true;
      const expectedWhitespaceAfterColon = afterColon ? 1 : 0;
      const mode =
        (singleLine
          ? options.singleLine
            ? options.singleLine.mode
            : options.mode
          : options.multiLine
          ? options.multiLine.mode
          : options.mode) ?? 'strict';

      if (isKeyTypeNode(node)) {
        checkBeforeColon(node, expectedWhitespaceBeforeColon, mode);
        checkAfterColon(node, expectedWhitespaceAfterColon, mode);
      }
    }

    function validateBody(
      body:
        | TSESTree.TSTypeLiteral
        | TSESTree.TSInterfaceBody
        | TSESTree.ClassBody,
    ): void {
      const isSingleLine = body.loc.start.line === body.loc.end.line;

      const members = 'members' in body ? body.members : body.body;

      let alignGroups: TSESTree.Node[][] = [];
      let unalignedElements: TSESTree.Node[] = [];

      if (options.align || options.multiLine?.align) {
        let currentAlignGroup: TSESTree.Node[] = [];
        alignGroups.push(currentAlignGroup);

        let prevNode: TSESTree.Node | undefined = undefined;

        for (const node of members) {
          let prevAlignedNode = currentAlignGroup.at(-1);
          if (prevAlignedNode !== prevNode) {
            prevAlignedNode = undefined;
          }

          if (prevAlignedNode && continuesAlignGroup(prevAlignedNode, node)) {
            currentAlignGroup.push(node);
          } else if (prevNode?.loc.start.line === node.loc.start.line) {
            if (prevAlignedNode) {
              // Here, prevNode === prevAlignedNode === currentAlignGroup.at(-1)
              unalignedElements.push(prevAlignedNode);
              currentAlignGroup.pop();
            }
            unalignedElements.push(node);
          } else {
            currentAlignGroup = [node];
            alignGroups.push(currentAlignGroup);
          }

          prevNode = node;
        }

        unalignedElements = unalignedElements.concat(
          ...alignGroups.filter(group => group.length === 1),
        );
        alignGroups = alignGroups.filter(group => group.length >= 2);
      } else {
        unalignedElements = members;
      }

      for (const group of alignGroups) {
        checkAlignGroup(group);
      }

      for (const node of unalignedElements) {
        checkIndividualNode(node, { singleLine: isSingleLine });
      }
    }
    return {
      ...baseRules,
      TSTypeLiteral: validateBody,
      TSInterfaceBody: validateBody,
      ClassBody: validateBody,
    };
  },
});
