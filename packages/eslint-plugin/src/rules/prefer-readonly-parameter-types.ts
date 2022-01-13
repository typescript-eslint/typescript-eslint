import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as util from '../util';

type Options = [
  {
    checkParameterProperties?: boolean;
    ignoreInferredTypes?: boolean;
    allowlist?: Array<string>;
  } & util.ReadonlynessOptions,
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
          checkParameterProperties: {
            type: 'boolean',
          },
          ignoreInferredTypes: {
            type: 'boolean',
          },
          allowlist: {
            type: 'array',
          },
          ...util.readonlynessOptionsSchema.properties,
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
      allowlist: [],
      ...util.readonlynessOptionsDefaults,
    },
  ],
  create(
    context,
    [
      {
        checkParameterProperties,
        ignoreInferredTypes,
        allowlist,
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
          const isReadOnly = util.isTypeReadonly(checker, type, {
            treatMethodsAsReadonly: treatMethodsAsReadonly!,
          });
          const typeName = type.getSymbol()?.escapedName;
          if (typeName !== undefined) {
            if (allowlist?.includes(typeName)) {
              return;
            }
            const internalAllowlist = ['HTMLElement'];
            if (internalAllowlist?.includes(typeName)) {
              const declarations = type.getSymbol()?.getDeclarations() ?? [];
              for (const declaration of declarations) {
                if (
                  program.isSourceFileDefaultLibrary(
                    declaration.getSourceFile(),
                  )
                ) {
                  return;
                }
              }
            }
          }

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
