import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

type Options = ['fields' | 'getters'];
type MessageIds =
  | 'preferFieldStyle'
  | 'preferFieldStyleSuggestion'
  | 'preferGetterStyle'
  | 'preferGetterStyleSuggestion';

interface NodeWithModifiers {
  accessibility?: TSESTree.Accessibility;
  static: boolean;
}

const printNodeModifiers = (
  node: NodeWithModifiers,
  final: 'get' | 'readonly',
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

export default createRule<Options, MessageIds>({
  name: 'class-literal-property-style',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that literals on classes are exposed in a consistent style',
      recommended: 'stylistic',
    },
    hasSuggestions: true,
    messages: {
      preferFieldStyle: 'Literals should be exposed using readonly fields.',
      preferFieldStyleSuggestion: 'Replace the literals with readonly fields.',
      preferGetterStyle: 'Literals should be exposed using getters.',
      preferGetterStyleSuggestion: 'Replace the literals with getters.',
    },
    schema: [
      {
        type: 'string',
        enum: ['fields', 'getters'],
      },
    ],
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
            suggest: [
              {
                messageId: 'preferFieldStyleSuggestion',
                fix(fixer): TSESLint.RuleFix {
                  const sourceCode = context.getSourceCode();
                  const name = sourceCode.getText(node.key);

                  let text = '';

                  text += printNodeModifiers(node, 'readonly');
                  text += node.computed ? `[${name}]` : name;
                  text += ` = ${sourceCode.getText(argument)};`;

                  return fixer.replaceText(node, text);
                },
              },
            ],
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
            suggest: [
              {
                messageId: 'preferGetterStyleSuggestion',
                fix(fixer): TSESLint.RuleFix {
                  const sourceCode = context.getSourceCode();
                  const name = sourceCode.getText(node.key);

                  let text = '';

                  text += printNodeModifiers(node, 'get');
                  text += node.computed ? `[${name}]` : name;
                  text += `() { return ${sourceCode.getText(value)}; }`;

                  return fixer.replaceText(node, text);
                },
              },
            ],
          });
        },
      }),
    };
  },
});
