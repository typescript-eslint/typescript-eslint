import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import baseRule from 'eslint/lib/rules/semi';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'semi',
  meta: {
    type: 'layout',
    docs: {
      description: 'Require or disallow semicolons instead of ASI',
      tslintRuleName: 'semi',
      category: 'Stylistic Issues',
      recommended: 'error',
    },
    fixable: 'code',
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: ['always'],
  create(context, optionsWithDefaults) {
    // because we extend the base rule, have to update opts on the context
    // the context defines options as readonly though...
    const contextWithDefaults: typeof context = Object.create(context, {
      options: {
        writable: false,
        configurable: false,
        value: optionsWithDefaults,
      },
    });

    const rules = baseRule.create(contextWithDefaults);

    return Object.assign({}, rules, {
      TSTypeAliasDeclaration(node: TSESTree.TSTypeAliasDeclaration) {
        return rules.VariableDeclaration({
          ...node,
          type: AST_NODE_TYPES.VariableDeclaration,
          kind: 'const' as 'const',
          declarations: [],
        });
      },
      ClassProperty(node: TSESTree.ClassProperty) {
        return rules.VariableDeclaration({
          ...node,
          type: AST_NODE_TYPES.VariableDeclaration,
          kind: 'const' as 'const',
          declarations: [],
        });
      },
      ExportDefaultDeclaration(node: TSESTree.ExportDefaultDeclaration) {
        if (
          !/(?:Class|Function|TSInterface)Declaration/.test(
            node.declaration.type,
          )
        ) {
          rules.ExportDefaultDeclaration(node);
        }
      },
    });
  },
});
