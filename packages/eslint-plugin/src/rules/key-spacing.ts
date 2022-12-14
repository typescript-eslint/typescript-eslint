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

    function checkBeforeColon(
      node: TSESTree.TSIndexSignature | TSESTree.TSPropertySignature,
      key: TSESTree.PropertyName | TSESTree.Parameter,
      nBeforeColon: number,
    ): void {
      const colon = node.typeAnnotation!.loc.start.column;
      const keyEnd = key.loc.end.column;
      const expectedDiff = nBeforeColon;
      if (colon - keyEnd !== expectedDiff) {
        context.report({
          node,
          messageId: colon - keyEnd > expectedDiff ? 'extraKey' : 'missingKey',
          data: {
            computed: '',
            key: sourceCode.getText(key),
          },
        });
      }
    }

    function checkAfterColon(
      node: TSESTree.TSIndexSignature | TSESTree.TSPropertySignature,
      key: TSESTree.PropertyName | TSESTree.Parameter,
      nAfterColon: number,
    ): void {
      const colon = node.typeAnnotation!.loc.start.column;
      const typeStart = node.typeAnnotation!.typeAnnotation.loc.start.column;
      const expectedDiff = nAfterColon + 1;
      if (typeStart - colon !== expectedDiff) {
        context.report({
          node,
          messageId:
            typeStart - colon > expectedDiff ? 'extraValue' : 'missingValue',
          data: {
            computed: '',
            key: sourceCode.getText(key),
          },
        });
      }
    }

    function checkAlignGroup(group: TSESTree.TypeElement[]): void {
      let alignColumn = 0;
      const align =
        (typeof options.align === 'object'
          ? options.align.on
          : options.align) ?? 'colon';
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

      for (const node of group) {
        if (
          (node.type === AST_NODE_TYPES.TSPropertySignature ||
            node.type === AST_NODE_TYPES.TSIndexSignature) &&
          node.typeAnnotation
        ) {
          const key =
            'key' in node
              ? node.key
              : node.parameters[node.parameters.length - 1];
          alignColumn = Math.max(
            alignColumn,
            align === 'colon'
              ? key.loc.end.column + nBeforeColon
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
          const key =
            'key' in node
              ? node.key
              : node.parameters[node.parameters.length - 1];
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
                key: sourceCode.getText(key),
              },
            });
          }

          if (align === 'colon') {
            checkAfterColon(node, key, nAfterColon);
          } else {
            checkBeforeColon(node, key, nBeforeColon);
          }
        }
      }
    }

    function checkIndividualNode(
      node: TSESTree.TypeElement,
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

      if (
        (node.type === AST_NODE_TYPES.TSPropertySignature ||
          node.type === AST_NODE_TYPES.TSIndexSignature) &&
        node.typeAnnotation
      ) {
        const key =
          'key' in node
            ? node.key
            : node.parameters[node.parameters.length - 1];

        checkBeforeColon(node, key, nBeforeColon);
        checkAfterColon(node, key, nAfterColon);
      }
    }

    function validateBody(
      body: TSESTree.TSTypeLiteral | TSESTree.TSInterfaceBody,
    ): void {
      const isSingleLine = body.loc.start.line === body.loc.end.line;

      const members = 'members' in body ? body.members : body.body;

      let alignGroups: TSESTree.TypeElement[][] = [];
      let unalignedElements: TSESTree.TypeElement[] = [];

      if (options.align) {
        let currentAlignGroup: TSESTree.TypeElement[] = [];
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
    };
  },
});
