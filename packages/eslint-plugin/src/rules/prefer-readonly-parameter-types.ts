import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as util from '../util';

type Options = [
  {
    allowlist?: Array<util.TypeAllowlistItem>;
    checkParameterProperties?: boolean;
    ignoreInferredTypes?: boolean;
    treatMethodsAsReadonly?: boolean;
  },
];
type MessageIds = 'shouldBeReadonly';

export default util.createRule<Options, MessageIds>({
  name: 'prefer-readonly-parameter-types',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires that function parameters are typed as readonly to prevent accidental mutation of inputs',
      recommended: false,
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowlist: util.readonlynessOptionsSchema.properties.allowlist,
          checkParameterProperties: {
            type: 'boolean',
          },
          ignoreInferredTypes: {
            type: 'boolean',
          },
          treatMethodsAsReadonly:
            util.readonlynessOptionsSchema.properties.treatMethodsAsReadonly,
        },
      },
    ],
    messages: {
      shouldBeReadonly: 'Parameter should be a read only type.',
    },
  },
  defaultOptions: [
    {
      allowlist: util.readonlynessOptionsDefaults.allowlist,
      checkParameterProperties: true,
      ignoreInferredTypes: false,
      treatMethodsAsReadonly:
        util.readonlynessOptionsDefaults.treatMethodsAsReadonly,
    },
  ],
  create(
    context,
    [
      {
        allowlist,
        checkParameterProperties,
        ignoreInferredTypes,
        treatMethodsAsReadonly,
      },
    ],
  ) {
    const { esTreeNodeToTSNodeMap, program } = util.getParserServices(context);
    const checker = program.getTypeChecker();

    return {
      [[
        AST_NODE_TYPES.ArrowFunctionExpression,
        AST_NODE_TYPES.FunctionDeclaration,
        AST_NODE_TYPES.FunctionExpression,
        AST_NODE_TYPES.TSCallSignatureDeclaration,
        AST_NODE_TYPES.TSConstructSignatureDeclaration,
        AST_NODE_TYPES.TSDeclareFunction,
        AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
        AST_NODE_TYPES.TSFunctionType,
        AST_NODE_TYPES.TSMethodSignature,
      ].join(', ')](
        node:
          | TSESTree.ArrowFunctionExpression
          | TSESTree.FunctionDeclaration
          | TSESTree.FunctionExpression
          | TSESTree.TSCallSignatureDeclaration
          | TSESTree.TSConstructSignatureDeclaration
          | TSESTree.TSDeclareFunction
          | TSESTree.TSEmptyBodyFunctionExpression
          | TSESTree.TSFunctionType
          | TSESTree.TSMethodSignature,
      ): void {
        for (const param of node.params) {
          if (
            !checkParameterProperties &&
            param.type === AST_NODE_TYPES.TSParameterProperty
          ) {
            continue;
          }

          const actualParam =
            param.type === AST_NODE_TYPES.TSParameterProperty
              ? param.parameter
              : param;

          if (ignoreInferredTypes && actualParam.typeAnnotation == null) {
            continue;
          }

          const tsNode = esTreeNodeToTSNodeMap.get(actualParam);
          const type = checker.getTypeAtLocation(tsNode);
          const isReadOnly = util.isTypeReadonly(program, type, {
            treatMethodsAsReadonly: treatMethodsAsReadonly!,
            allowlist: allowlist,
          });

          if (!isReadOnly) {
            context.report({
              node: actualParam,
              messageId: 'shouldBeReadonly',
            });
          }
        }
      },
    };
  },
});
