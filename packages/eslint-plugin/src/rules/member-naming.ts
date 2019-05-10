import { TSESTree } from '@typescript-eslint/typescript-estree';
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
        'Enforces naming conventions for class members by visibility.',
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

    /**
     * Check that the property name matches the convention for its
     * accessibility.
     * @param {ASTNode} node the named node to evaluate.
     * @returns {void}
     * @private
     */
    function validateName(
      node: TSESTree.MethodDefinition | TSESTree.ClassProperty,
    ): void {
      const name = util.getNameFromClassMember(node, sourceCode);
      const accessibility: Modifiers = node.accessibility || 'public';
      const convention = conventions[accessibility];

      const method = node as TSESTree.MethodDefinition;
      if (method.kind === 'constructor') {
        return;
      }

      if (!convention || convention.test(name)) {
        return;
      }

      context.report({
        node: node.key,
        messageId: 'incorrectName',
        data: { accessibility, name, convention },
      });
    }

    return {
      MethodDefinition: validateName,
      ClassProperty: validateName,
    };
  },
});
