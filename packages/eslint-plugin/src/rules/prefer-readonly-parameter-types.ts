import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type Options = [
  {
    allow?: util.TypeOrValueSpecifier[];
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
        'Require function parameters to be typed as `readonly` to prevent accidental mutation of inputs',
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allow: util.readonlynessOptionsSchema.properties.allow,
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
      allow: util.readonlynessOptionsDefaults.allow,
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
        allow,
        checkParameterProperties,
        ignoreInferredTypes,
        treatMethodsAsReadonly,
      },
    ],
  ) {
    const services = util.getParserServices(context);

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

          const type = services.getTypeAtLocation(actualParam);
          const isReadOnly = util.isTypeReadonly(services.program, type, {
            treatMethodsAsReadonly: treatMethodsAsReadonly!,
            allow,
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
