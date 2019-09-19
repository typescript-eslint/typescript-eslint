import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

interface Config<T = string> {
  private?: T;
  protected?: T;
  public?: T;
}
type Modifiers = keyof Config;
type Options = [Config];
type MessageIds = 'incorrectName';

export default util.createRule<Options, MessageIds>({
  name: 'member-naming',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces naming conventions for class members by visibility',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      incorrectName:
        '{{accessibility}} property {{name}} should match {{convention}}.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          public: {
            type: 'string',
            minLength: 1,
            format: 'regex',
          },
          protected: {
            type: 'string',
            minLength: 1,
            format: 'regex',
          },
          private: {
            type: 'string',
            minLength: 1,
            format: 'regex',
          },
        },
        additionalProperties: false,
        minProperties: 1,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [config]) {
    const sourceCode = context.getSourceCode();

    const conventions = (Object.keys(config) as Modifiers[]).reduce<
      Config<RegExp>
    >((acc, accessibility) => {
      acc[accessibility] = new RegExp(config[accessibility]!);

      return acc;
    }, {});

    function getParameterNode(
      node: TSESTree.TSParameterProperty,
    ): TSESTree.Identifier | null {
      if (node.parameter.type === AST_NODE_TYPES.AssignmentPattern) {
        return node.parameter.left as TSESTree.Identifier;
      }

      if (node.parameter.type === AST_NODE_TYPES.Identifier) {
        return node.parameter;
      }

      return null;
    }

    function validateParameterName(node: TSESTree.TSParameterProperty): void {
      const parameterNode = getParameterNode(node);
      if (!parameterNode) {
        return;
      }

      validate(parameterNode, parameterNode.name, node.accessibility);
    }

    function validateName(
      node: TSESTree.MethodDefinition | TSESTree.ClassProperty,
    ): void {
      if (
        node.type === AST_NODE_TYPES.MethodDefinition &&
        node.kind === 'constructor'
      ) {
        return;
      }

      validate(
        node.key,
        util.getNameFromClassMember(node, sourceCode),
        node.accessibility,
      );
    }

    /**
     * Check that the name matches the convention for its accessibility.
     * @param {ASTNode}   node the named node to evaluate.
     * @param {string}    name
     * @param {Modifiers} accessibility
     * @returns {void}
     * @private
     */
    function validate(
      node: TSESTree.Identifier | TSESTree.Expression,
      name: string,
      accessibility: Modifiers = 'public',
    ): void {
      const convention = conventions[accessibility];
      if (!convention || convention.test(name)) {
        return;
      }

      context.report({
        node,
        messageId: 'incorrectName',
        data: { accessibility, name, convention },
      });
    }

    return {
      TSParameterProperty: validateParameterName,
      MethodDefinition: validateName,
      ClassProperty: validateName,
    };
  },
});
