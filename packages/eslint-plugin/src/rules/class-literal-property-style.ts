import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getStaticStringValue,
  isAssignee,
  isFunction,
  nullThrows,
} from '../util';

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

interface PropertiesInfo {
  properties: TSESTree.PropertyDefinition[];
  excludeSet: Set<string>;
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
    const propertiesInfoStack: PropertiesInfo[] = [];

    function getStringValue(node: TSESTree.Node): string {
      return getStaticStringValue(node) ?? context.sourceCode.getText(node);
    }

    function enterClassBody(): void {
      propertiesInfoStack.push({
        properties: [],
        excludeSet: new Set(),
      });
    }

    function exitClassBody(): void {
      const { properties, excludeSet } = nullThrows(
        propertiesInfoStack.pop(),
        'Stack should exist on class exit',
      );

      properties.forEach(node => {
        const { value } = node;
        if (!value || !isSupportedLiteral(value)) {
          return;
        }

        const name = getStringValue(node.key);
        if (excludeSet.has(name)) {
          return;
        }

        context.report({
          node: node.key,
          messageId: 'preferGetterStyle',
          suggest: [
            {
              messageId: 'preferGetterStyleSuggestion',
              fix(fixer): TSESLint.RuleFix {
                const name = context.sourceCode.getText(node.key);

                let text = '';
                text += printNodeModifiers(node, 'get');
                text += node.computed ? `[${name}]` : name;
                text += `() { return ${context.sourceCode.getText(value)}; }`;

                return fixer.replaceText(node, text);
              },
            },
          ],
        });
      });
    }

    function excludeAssignedProperty(node: TSESTree.MemberExpression): void {
      if (isAssignee(node)) {
        const { excludeSet } =
          propertiesInfoStack[propertiesInfoStack.length - 1];

        const name =
          getStaticStringValue(node.property) ??
          context.sourceCode.getText(node.property);

        if (name) {
          excludeSet.add(name);
        }
      }
    }

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

          const name = getStringValue(node.key);

          if (node.parent.type === AST_NODE_TYPES.ClassBody) {
            const hasDuplicateKeySetter = node.parent.body.some(element => {
              return (
                element.type === AST_NODE_TYPES.MethodDefinition &&
                element.kind === 'set' &&
                getStringValue(element.key) === name
              );
            });
            if (hasDuplicateKeySetter) {
              return;
            }
          }

          context.report({
            node: node.key,
            messageId: 'preferFieldStyle',
            suggest: [
              {
                messageId: 'preferFieldStyleSuggestion',
                fix(fixer): TSESLint.RuleFix {
                  const name = context.sourceCode.getText(node.key);

                  let text = '';

                  text += printNodeModifiers(node, 'readonly');
                  text += node.computed ? `[${name}]` : name;
                  text += ` = ${context.sourceCode.getText(argument)};`;

                  return fixer.replaceText(node, text);
                },
              },
            ],
          });
        },
      }),
      ...(style === 'getters' && {
        ClassBody: enterClassBody,
        'ClassBody:exit': exitClassBody,
        'MethodDefinition[kind="constructor"] ThisExpression'(
          node: TSESTree.ThisExpression,
        ): void {
          if (node.parent.type === AST_NODE_TYPES.MemberExpression) {
            let parent: TSESTree.Node | undefined = node.parent;

            while (!isFunction(parent)) {
              parent = parent.parent;
            }

            if (
              parent.parent.type === AST_NODE_TYPES.MethodDefinition &&
              parent.parent.kind === 'constructor'
            ) {
              excludeAssignedProperty(node.parent);
            }
          }
        },
        PropertyDefinition(node): void {
          if (!node.readonly || node.declare) {
            return;
          }
          const { properties } =
            propertiesInfoStack[propertiesInfoStack.length - 1];
          properties.push(node);
        },
      }),
    };
  },
});
