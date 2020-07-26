import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
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
  } ${final} `.trimLeft();

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
  defaultOptions: ['fields'],
  create(context, [style]) {
    const dict = new Map<string, TSESTree.Identifier>();

    if (style === 'fields') {
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
      };
    }

    return {
      // if in constrcutor and names are matching
      'MemberExpression > Identifier:exit'(node: TSESTree.Identifier): void {
        // check if we're in the constructor

        if (dict.has(node.name)) {
          context.report({
            node,
            messageId: 'preferGetterStyle',
          });
          dict.delete(node.name);
        }
      },
      'MethodDefinition:exit'(): void {
        if (dict.size) {
          dict.forEach(violatingNode => {
            context.report({
              node: violatingNode,
              messageId: 'preferGetterStyle',
            });
            dict.delete(violatingNode.name);
          });
        }
      },
      'ClassDeclaration:exit'(): void {
        if (dict.size) {
          dict.forEach(violatingNode => {
            context.report({
              node: violatingNode,
              messageId: 'preferGetterStyle',
            });
            dict.delete(violatingNode.name);
          });
        }
      },
      'ClassProperty[accessibility=private] > Identifier:exit'(
        node: TSESTree.Identifier,
      ): void {
        dict.set(node.name, node);
      },
      ClassProperty(node: TSESTree.ClassProperty): void {
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
    };
  },
});
