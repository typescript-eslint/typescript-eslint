import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { TypeOrValueSpecifier } from '../util';

import {
  createRule,
  getParserServices,
  isTypeBrandedLiteralLike,
  isTypeReadonly,
  readonlynessOptionsDefaults,
  readonlynessOptionsSchema,
} from '../util';

export type Options = [
  {
    allow?: TypeOrValueSpecifier[];
    checkParameterProperties?: boolean;
    ignoreInferredTypes?: boolean;
    treatMethodsAsReadonly?: boolean;
  },
];
export type MessageIds = 'shouldBeReadonly';

export default createRule<Options, MessageIds>({
  name: 'prefer-readonly-parameter-types',
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
          allow: {
            ...readonlynessOptionsSchema.properties.allow,
            description: 'An array of type specifiers to ignore.',
          },
          checkParameterProperties: {
            type: 'boolean',
            description: 'Whether to check class parameter properties.',
          },
          ignoreInferredTypes: {
            type: 'boolean',
            description:
              "Whether to ignore parameters which don't explicitly specify a type.",
          },
          treatMethodsAsReadonly: {
            ...readonlynessOptionsSchema.properties.treatMethodsAsReadonly,
            description:
              'Whether to treat all mutable methods as though they are readonly.',
          },
        },
      },
    ],
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

    function getParameterType(
      actualParam:
        | TSESTree.ArrayPattern
        | TSESTree.AssignmentPattern
        | TSESTree.Identifier
        | TSESTree.ObjectPattern
        | TSESTree.RestElement,
    ): ts.Type {
      const checker = services.program.getTypeChecker();
      if (actualParam.typeAnnotation?.typeAnnotation) {
        // Get type from annotation node to preserve aliasSymbol
        const tsTypeNode = services.esTreeNodeToTSNodeMap.get(
          actualParam.typeAnnotation.typeAnnotation,
        ) as ts.TypeNode;
        return checker.getTypeFromTypeNode(tsTypeNode);
      }
      return services.getTypeAtLocation(actualParam);
    }

    function checkIsReadonly(type: ts.Type): boolean {
      if (type.aliasSymbol && allow) {
        const aliasMatches = allow.some(specifier => {
          const specifierName =
            typeof specifier === 'string' ? specifier : specifier.name;
          const names = Array.isArray(specifierName)
            ? specifierName
            : [specifierName];
          return type.aliasSymbol && names.includes(type.aliasSymbol.getName());
        });

        if (aliasMatches) {
          return true;
        }
      }

      return isTypeReadonly(services.program, type, {
        allow,
        treatMethodsAsReadonly: !!treatMethodsAsReadonly,
      });
    }

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

          const type = getParameterType(actualParam);
          const isReadOnly = checkIsReadonly(type);

          if (!isReadOnly && !isTypeBrandedLiteralLike(type)) {
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
