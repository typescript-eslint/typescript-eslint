import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Options = ['any' | 'fields' | 'getters'];
type MessageIds = 'preferFieldStyle' | 'preferGetterStyle';

interface NodeWithModifiers {
  accessibility?: TSESTree.Accessibility;
  static: boolean;
}

const printNodeModifiers = (
  node: NodeWithModifiers,
  final: 'readonly' | 'get',
): string =>
  `${node.accessibility ?? ''}${
    node.static ? ' static' : ''
  } ${final} `.trimLeft();

const isSupportedLiteral = (
  node: TSESTree.Node,
): node is TSESTree.LiteralExpression =>
  node.type === AST_NODE_TYPES.Literal ||
  node.type === AST_NODE_TYPES.BigIntLiteral ||
  (node.type === AST_NODE_TYPES.TemplateLiteral && node.quasis.length === 1);

export default util.createRule<Options, MessageIds>({
  name: 'class-literals-style',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensures that literals on classes are exposed in a consistent style',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferFieldStyle: 'Literals should be exposed using readonly fields.',
      preferGetterStyle: 'Literals should be exposed using getters.',
    },
    schema: [{ enum: ['fields', 'getters'] }],
  },
  defaultOptions: ['any'],
  create(context) {
    const [style] = context.options;

    switch (style) {
      case 'fields':
        return {
          MethodDefinition(node: TSESTree.MethodDefinition): void {
            if (
              node.kind !== 'get' ||
              !node.value.body ||
              !node.value.body.body.length
            ) {
              return;
            }

            const [statement] = node.value.body.body;

            if (statement.type !== AST_NODE_TYPES.ReturnStatement) {
              return;
            }

            const { argument } = statement;

            if (!argument || !isSupportedLiteral(argument)) {
              return;
            }

            context.report({
              node: node.key,
              messageId: 'preferFieldStyle',
              fix(fixer) {
                const keyOffset = node.computed ? 1 : 0;

                return [
                  // replace the start bits with the field modifiers
                  fixer.replaceTextRange(
                    [node.range[0], node.key.range[0] - keyOffset],
                    printNodeModifiers(node, 'readonly'),
                  ),
                  // replace the middle bits with the assignment
                  fixer.replaceTextRange(
                    [node.value.range[0], argument.range[0]],
                    '=',
                  ),
                  // remove the end bits
                  fixer.removeRange([argument.range[1], node.range[1]]),
                ];
              },
            });
          },
        };
      case 'getters':
        return {
          ClassProperty(node: TSESTree.ClassProperty): void {
            if (!node.readonly) {
              return;
            }

            const { value } = node;

            if (!value || !isSupportedLiteral(value)) {
              return;
            }

            context.report({
              node: node.key,
              messageId: 'preferGetterStyle',
              fix(fixer) {
                const keyOffset = node.computed ? 1 : 0;

                return [
                  // replace the start bits with the getter modifiers
                  fixer.replaceTextRange(
                    [node.range[0], node.key.range[0] - keyOffset],
                    printNodeModifiers(node, 'get'),
                  ),
                  // replace the middle bits with the start of the getter
                  fixer.replaceTextRange(
                    [node.key.range[1] + keyOffset, value.range[0]],
                    '(){return ',
                  ),
                  // replace the end bits with the end of the getter
                  fixer.replaceTextRange([value.range[1], node.range[1]], '}'),
                ];
              },
            });
          },
        };
      case 'any':
      default:
        /* istanbul ignore next */
        return {};
    }
  },
});
