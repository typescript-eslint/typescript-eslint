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
        'Enforce consistent spacing between keys and values in types and interfaces',
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
     * To handle index signatures, to get the whole text for the parameters
     */
    function getKeyText(
      node: TSESTree.TSIndexSignature | TSESTree.TSPropertySignature,
    ): string {
      if ('key' in node) {
        return sourceCode.getText(node);
      }

      const code = sourceCode.getText(node);
      const lastParam = node.parameters[node.parameters.length - 1];
      return code.slice(
        0,
        code.indexOf(']', lastParam.range[1] - node.range[0]) + 1,
      );
    }

    /**
     * To handle index signatures, be able to get the end position of the parameters
     */
    function getKeyLocEnd(
      node: TSESTree.TSIndexSignature | TSESTree.TSPropertySignature,
    ): TSESTree.Position {
      if ('key' in node) {
        return node.key.loc.end;
      }

      // For index signatures, there's no easy way to get the location of the ending ']', we need to look at the source code
      const code = sourceCode.getText(node);
      const lastParam = node.parameters[node.parameters.length - 1];

      const remaining = code.slice(
        lastParam.range[1] - node.range[0],
        code.indexOf(']', lastParam.range[1] - node.range[0]) + 1,
      );
      const lines = remaining.split('\n');

      if (lines.length === 1) {
        return {
          line: lastParam.loc.end.line,
          column: lastParam.loc.end.column + remaining.length,
        };
      }

      return {
        line: lastParam.loc.end.line + lines.length - 1,
        column: lines[lines.length - 1].length,
      };
    }

    function checkBeforeColon(
      node: TSESTree.TSIndexSignature | TSESTree.TSPropertySignature,
      nBeforeColon: number,
      mode: 'strict' | 'minimum',
    ): void {
      const colon = node.typeAnnotation!.loc.start.column;
      const keyEnd = getKeyLocEnd(node);
      const expectedDiff = nBeforeColon;
      if (
        mode === 'strict'
          ? colon - keyEnd.column !== expectedDiff
          : colon - keyEnd.column < expectedDiff
      ) {
        context.report({
          node,
          messageId:
            colon - keyEnd.column > expectedDiff ? 'extraKey' : 'missingKey',
          data: {
            computed: '',
            key: getKeyText(node),
          },
        });
      }
    }

    function checkAfterColon(
      node: TSESTree.TSIndexSignature | TSESTree.TSPropertySignature,
      nAfterColon: number,
      mode: 'strict' | 'minimum',
    ): void {
      const colon = node.typeAnnotation!.loc.start.column;
      const typeStart = node.typeAnnotation!.typeAnnotation.loc.start.column;
      const expectedDiff = nAfterColon + 1;
      if (
        mode === 'strict'
          ? typeStart - colon !== expectedDiff
          : typeStart - colon < expectedDiff
      ) {
        context.report({
          node,
          messageId:
            typeStart - colon > expectedDiff ? 'extraValue' : 'missingValue',
          data: {
            computed: '',
            key: getKeyText(node),
          },
        });
      }
    }

    function checkAlignGroup(group: TSESTree.Node[]): void {
      let alignColumn = 0;
      const align =
        (typeof options.align === 'object'
          ? options.align.on
          : options.multiLine?.align ?? options.align) ?? 'colon';
      const beforeColon =
        (typeof options.align === 'object'
          ? options.align.beforeColon
          : options.multiLine
          ? options.multiLine.beforeColon
          : options.beforeColon) ?? false;
      const nBeforeColon = beforeColon ? 1 : 0;
      const afterColon =
        (typeof options.align === 'object'
          ? options.align.afterColon
          : options.multiLine
          ? options.multiLine.afterColon
          : options.beforeColon) ?? true;
      const nAfterColon = afterColon ? 1 : 0;
      const mode =
        (typeof options.align === 'object'
          ? options.align.mode
          : options.multiLine
          ? options.multiLine.mode
          : options.mode) ?? 'strict';

      for (const node of group) {
        if (
          (node.type === AST_NODE_TYPES.TSPropertySignature ||
            node.type === AST_NODE_TYPES.TSIndexSignature) &&
          node.typeAnnotation
        ) {
          alignColumn = Math.max(
            alignColumn,
            align === 'colon'
              ? getKeyLocEnd(node).column + nBeforeColon
              : node.typeAnnotation.loc.start.column +
                  ':'.length +
                  nAfterColon +
                  nBeforeColon,
          );
        }
      }

      for (const node of group) {
        if (
          (node.type === AST_NODE_TYPES.TSPropertySignature ||
            node.type === AST_NODE_TYPES.TSIndexSignature) &&
          node.typeAnnotation
        ) {
          const start =
            align === 'colon'
              ? node.typeAnnotation.loc.start.column
              : node.typeAnnotation.typeAnnotation.loc.start.column;

          if (start !== alignColumn) {
            context.report({
              node,
              messageId: start > alignColumn ? 'extraValue' : 'missingValue',
              data: {
                computed: '',
                key: getKeyText(node),
              },
            });
          }

          if (align === 'colon') {
            checkAfterColon(node, nAfterColon, mode);
          } else {
            checkBeforeColon(node, nBeforeColon, mode);
          }
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
      const nBeforeColon = beforeColon ? 1 : 0;
      const afterColon =
        (singleLine
          ? options.singleLine
            ? options.singleLine.afterColon
            : options.afterColon
          : options.multiLine
          ? options.multiLine.afterColon
          : options.afterColon) ?? true;
      const nAfterColon = afterColon ? 1 : 0;
      const mode =
        (singleLine
          ? options.singleLine
            ? options.singleLine.mode
            : options.mode
          : options.multiLine
          ? options.multiLine.mode
          : options.mode) ?? 'strict';

      if (
        (node.type === AST_NODE_TYPES.TSPropertySignature ||
          node.type === AST_NODE_TYPES.TSIndexSignature) &&
        node.typeAnnotation
      ) {
        checkBeforeColon(node, nBeforeColon, mode);
        checkAfterColon(node, nAfterColon, mode);
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

        for (const node of members) {
          const prevNode = currentAlignGroup.length
            ? currentAlignGroup[currentAlignGroup.length - 1]
            : null;

          if (prevNode?.loc.start.line === node.loc.start.line - 1) {
            currentAlignGroup.push(node);
          } else if (prevNode?.loc.start.line === node.loc.start.line) {
            if (currentAlignGroup.length) {
              unalignedElements.push(currentAlignGroup.pop()!);
            }
            unalignedElements.push(node);
          } else {
            currentAlignGroup = [node];
            alignGroups.push(currentAlignGroup);
          }
        }

        unalignedElements.push(
          ...alignGroups
            .filter(group => group.length === 1)
            .flatMap(group => group),
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
