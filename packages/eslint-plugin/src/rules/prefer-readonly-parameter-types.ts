import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { TypeOrValueSpecifier } from '../util';

import {
  createRule,
  getParserServices,
  isTypeReadonly,
  readonlynessOptionsDefaults,
  readonlynessOptionsSchema,
} from '../util';

type Options = [
  {
    allow?: TypeOrValueSpecifier[];
    checkParameterProperties?: boolean;
    ignoreInferredTypes?: boolean;
    treatMethodsAsReadonly?: boolean;
  },
];
type MessageIds = 'shouldBeReadonly';

export default createRule<Options, MessageIds>({
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
    const services = getParserServices(context);

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
          const isReadOnly = isTypeReadonly(services.program, type, {
            allow,
            treatMethodsAsReadonly: !!treatMethodsAsReadonly,
          });

          if (!isReadOnly) {
            context.report({
              messageId: 'shouldBeReadonly',
              node: actualParam,
            });
          }
        }
      },
    };
  },
  defaultOptions: [
    {
      allow: readonlynessOptionsDefaults.allow,
      checkParameterProperties: true,
      ignoreInferredTypes: false,
      treatMethodsAsReadonly:
        readonlynessOptionsDefaults.treatMethodsAsReadonly,
    },
  ],
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require function parameters to be typed as `readonly` to prevent accidental mutation of inputs',
      requiresTypeChecking: true,
    },
    messages: {
      shouldBeReadonly: 'Parameter should be a read only type.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allow: readonlynessOptionsSchema.properties.allow,
          checkParameterProperties: {
            type: 'boolean',
          },
          ignoreInferredTypes: {
            type: 'boolean',
          },
          treatMethodsAsReadonly:
            readonlynessOptionsSchema.properties.treatMethodsAsReadonly,
        },
      },
    ],
  },
  name: 'prefer-readonly-parameter-types',
});
