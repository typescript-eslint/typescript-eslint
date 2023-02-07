import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type Options = ['fields' | 'getters'];
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
  } ${final} `.trimStart();

const isSupportedLiteral = (
  node: TSESTree.Node,
): node is TSESTree.LiteralExpression => {
  if (node.type === AST_NODE_TYPES.Literal) {
    return true;
  }

  if (
    node.type === AST_NODE_TYPES.TaggedTemplateExpression ||
    node.type === AST_NODE_TYPES.TemplateLiteral
  ) {
    return ('quasi' in node ? node.quasi.quasis : node.quasis).length === 1;
  }

  return false;
};

export default util.createRule<Options, MessageIds>({
  name: 'class-literal-property-style',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that literals on classes are exposed in a consistent style',
      recommended: 'strict',
    },
    fixable: 'code',
    messages: {
      preferFieldStyle: 'Literals should be exposed using readonly fields.',
      preferGetterStyle: 'Literals should be exposed using getters.',
    },
    schema: [{ enum: ['fields', 'getters'] }],
  },
  defaultOptions: ['fields'],
  create(context, [style]) {
    return {
      ...(style === 'fields' && {
        MethodDefinition(node): void {
          if (
            node.kind !== 'get' ||
            !node.value.body ||
            node.value.body.body.length === 0
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
              const sourceCode = context.getSourceCode();
              const name = sourceCode.getText(node.key);

              let text = '';

              text += printNodeModifiers(node, 'readonly');
              text += node.computed ? `[${name}]` : name;
              text += ` = ${sourceCode.getText(argument)};`;

              return fixer.replaceText(node, text);
            },
          });
        },
      }),
      ...(style === 'getters' && {
        PropertyDefinition(node): void {
          if (!node.readonly || node.declare) {
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
              const sourceCode = context.getSourceCode();
              const name = sourceCode.getText(node.key);

              let text = '';

              text += printNodeModifiers(node, 'get');
              text += node.computed ? `[${name}]` : name;
              text += `() { return ${sourceCode.getText(value)}; }`;

              return fixer.replaceText(node, text);
            },
          });
        },
      }),
    };
  },
});
