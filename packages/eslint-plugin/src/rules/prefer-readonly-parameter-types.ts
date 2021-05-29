import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import { isTypeReadonlyArrayOrTupleFlat } from '../util';

type Options = [
  {
    checkParameterProperties?: boolean;
    ignoreInferredTypes?: boolean;
    arraysAndTuplesOnly?: boolean;
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
      category: 'Possible Errors',
      recommended: false,
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkParameterProperties: {
            type: 'boolean',
          },
          ignoreInferredTypes: {
            type: 'boolean',
          },
          arraysAndTuplesOnly: {
            type: 'boolean',
          },
        },
      },
    ],
    messages: {
      shouldBeReadonly: 'Parameter should be a read only type.',
    },
  },
  defaultOptions: [
    {
      checkParameterProperties: true,
      ignoreInferredTypes: false,
      arraysAndTuplesOnly: false,
    },
  ],
  create(context, options) {
    const [
      { checkParameterProperties, ignoreInferredTypes, arraysAndTuplesOnly },
    ] = options;
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

          if (arraysAndTuplesOnly) {
            let toCheck =
              actualParam.type === AST_NODE_TYPES.RestElement &&
              (checker.isArrayType(type) || checker.isTupleType(type))
                ? // if this is a REST parameter, check all elements
                  // for a REST parameter, we don't care about the parameter itself though
                  checker.getTypeArguments(type)
                : // otherwise check just the parameter
                  [type];

            for (const checkType of toCheck) {
              if (
                (checker.isArrayType(checkType) ||
                  checker.isTupleType(checkType)) &&
                !isTypeReadonlyArrayOrTupleFlat(checker, checkType)
              ) {
                context.report({
                  node: actualParam,
                  messageId: 'shouldBeReadonly',
                });
              }
            }

            continue;
          }

          const isReadOnly = util.isTypeReadonly(checker, type);

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
