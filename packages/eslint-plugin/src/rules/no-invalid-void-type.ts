import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, getStaticMemberAccessValue } from '../util';

interface Options {
  allowAsThisParameter?: boolean;
  allowInGenericTypeArguments?: boolean | [string, ...string[]];
}

type MessageIds =
  | 'invalidVoidForGeneric'
  | 'invalidVoidNotReturn'
  | 'invalidVoidNotReturnOrGeneric'
  | 'invalidVoidNotReturnOrThisParam'
  | 'invalidVoidNotReturnOrThisParamOrGeneric'
  | 'invalidVoidUnionConstituent';

export default createRule<[Options], MessageIds>({
  name: 'no-invalid-void-type',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow `void` type outside of generic or return types',
      recommended: 'strict',
    },
    messages: {
      invalidVoidForGeneric:
        '{{ generic }} may not have void as a type argument.',
      invalidVoidNotReturn: 'void is only valid as a return type.',
      invalidVoidNotReturnOrGeneric:
        'void is only valid as a return type or generic type argument.',
      invalidVoidNotReturnOrThisParam:
        'void is only valid as return type or type of `this` parameter.',
      invalidVoidNotReturnOrThisParamOrGeneric:
        'void is only valid as a return type or generic type argument or the type of a `this` parameter.',
      invalidVoidUnionConstituent:
        'void is not valid as a constituent in a union type',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowAsThisParameter: {
            type: 'boolean',
            description:
              'Whether a `this` parameter of a function may be `void`.',
          },
          allowInGenericTypeArguments: {
            description:
              'Whether `void` can be used as a valid value for generic type parameters.',
            oneOf: [
              {
                type: 'boolean',
                description:
                  'Whether `void` can be used as a valid value for all generic type parameters.',
              },
              {
                type: 'array',
                description:
                  'Allowlist of types that may accept `void` as a generic type parameter.',
                items: { type: 'string' },
                minItems: 1,
              },
            ],
          },
        },
      },
    ],
  },
  defaultOptions: [
    { allowAsThisParameter: false, allowInGenericTypeArguments: true },
  ],
  create(context, [{ allowAsThisParameter, allowInGenericTypeArguments }]) {
    const validParents: AST_NODE_TYPES[] = [
      AST_NODE_TYPES.TSTypeAnnotation, //
    ];
    const invalidGrandParents: AST_NODE_TYPES[] = [
      AST_NODE_TYPES.TSPropertySignature,
      AST_NODE_TYPES.CallExpression,
      AST_NODE_TYPES.PropertyDefinition,
      AST_NODE_TYPES.Identifier,
    ];
    const validUnionMembers: AST_NODE_TYPES[] = [
      AST_NODE_TYPES.TSVoidKeyword,
      AST_NODE_TYPES.TSNeverKeyword,
    ];

    if (allowInGenericTypeArguments === true) {
      validParents.push(AST_NODE_TYPES.TSTypeParameterInstantiation);
    }

    /**
     * @brief check if the given void keyword is used as a valid generic type
     *
     * reports if the type parametrized by void is not in the allowlist, or
     * allowInGenericTypeArguments is false.
     * no-op if the given void keyword is not used as generic type
     */
    function checkGenericTypeArgument(node: TSESTree.TSVoidKeyword): void {
      // only matches T<..., void, ...>
      // extra check for precaution
      /* istanbul ignore next */
      if (
        node.parent.type !== AST_NODE_TYPES.TSTypeParameterInstantiation ||
        node.parent.parent.type !== AST_NODE_TYPES.TSTypeReference
      ) {
        return;
      }

      // check allowlist
      if (Array.isArray(allowInGenericTypeArguments)) {
        const fullyQualifiedName = context.sourceCode
          .getText(node.parent.parent.typeName)
          .replaceAll(' ', '');

        if (
          !allowInGenericTypeArguments
            .map(s => s.replaceAll(' ', ''))
            .includes(fullyQualifiedName)
        ) {
          context.report({
            node,
            messageId: 'invalidVoidForGeneric',
            data: { generic: fullyQualifiedName },
          });
        }
        return;
      }

      if (!allowInGenericTypeArguments) {
        context.report({
          node,
          messageId: allowAsThisParameter
            ? 'invalidVoidNotReturnOrThisParam'
            : 'invalidVoidNotReturn',
        });
      }
    }

    /**
     * @brief checks if the generic type parameter defaults to void
     */
    function checkDefaultVoid(
      node: TSESTree.TSVoidKeyword,
      parentNode: TSESTree.TSTypeParameter,
    ): void {
      if (parentNode.default !== node) {
        context.report({
          node,
          messageId: getNotReturnOrGenericMessageId(node),
        });
      }
    }

    /**
     * @brief checks that a union containing void is valid
     * @return true if every member of the union is specified as a valid type in
     * validUnionMembers, or is a valid generic type parametrized by void
     */
    function isValidUnionType(node: TSESTree.TSUnionType): boolean {
      return node.types.every(
        member =>
          validUnionMembers.includes(member.type) ||
          // allows any T<..., void, ...> here, checked by checkGenericTypeArgument
          (member.type === AST_NODE_TYPES.TSTypeReference &&
            member.typeArguments?.type ===
              AST_NODE_TYPES.TSTypeParameterInstantiation &&
            member.typeArguments.params
              .map(param => param.type)
              .includes(AST_NODE_TYPES.TSVoidKeyword)),
      );
    }

    function getMembers(
      node: TSESTree.Node,
    ):
      | TSESTree.ClassElement[]
      | TSESTree.ProgramStatement[]
      | TSESTree.Statement[] {
      switch (node.type) {
        case AST_NODE_TYPES.ClassBody:
        case AST_NODE_TYPES.Program:
        case AST_NODE_TYPES.TSModuleBlock:
        case AST_NODE_TYPES.BlockStatement:
          return node.body;
        default:
          return [];
      }
    }

    function getParentFunctionDeclarationNode(
      node: TSESTree.Node,
    ): TSESTree.FunctionDeclaration | TSESTree.MethodDefinition | null {
      let current = node.parent;
      while (current) {
        if (current.type === AST_NODE_TYPES.FunctionDeclaration) {
          return current;
        }

        if (
          current.type === AST_NODE_TYPES.FunctionExpression &&
          current.parent.type === AST_NODE_TYPES.MethodDefinition
        ) {
          return current.parent;
        }

        current = current.parent;
      }

      return null;
    }

    function getFunctionDeclarationName(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.MethodDefinition
        | TSESTree.TSDeclareFunction,
    ): string | symbol | undefined {
      if (
        node.type === AST_NODE_TYPES.FunctionDeclaration ||
        node.type === AST_NODE_TYPES.TSDeclareFunction
      ) {
        return node.id?.name;
      }

      return getStaticMemberAccessValue(node, context);
    }

    function hasOverloadMethods(
      node: TSESTree.FunctionDeclaration | TSESTree.MethodDefinition,
    ): boolean {
      // `export default function () {}`
      if (node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
        for (const member of getMembers(node.parent.parent)) {
          if (
            member.type === AST_NODE_TYPES.ExportDefaultDeclaration &&
            member.declaration.type === AST_NODE_TYPES.TSDeclareFunction
          ) {
            return true;
          }
        }

        return false;
      }

      // `export function f() {}`
      if (
        node.type === AST_NODE_TYPES.FunctionDeclaration &&
        node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration
      ) {
        for (const member of getMembers(node.parent.parent)) {
          if (
            member.type === AST_NODE_TYPES.ExportNamedDeclaration &&
            member.declaration?.type === AST_NODE_TYPES.TSDeclareFunction &&
            member.declaration.id?.name === node.id?.name
          ) {
            return true;
          }
        }

        return false;
      }

      // otherwise...
      const nodeKey = getFunctionDeclarationName(node);

      for (const member of getMembers(node.parent)) {
        if (
          member.type !== AST_NODE_TYPES.TSDeclareFunction &&
          (member.type !== AST_NODE_TYPES.MethodDefinition ||
            member.value.type === AST_NODE_TYPES.FunctionExpression)
        ) {
          continue;
        }

        const memberKey = getFunctionDeclarationName(member);

        if (memberKey === nodeKey) {
          return true;
        }
      }

      return false;
    }

    return {
      TSVoidKeyword(node: TSESTree.TSVoidKeyword): void {
        // checks T<..., void, ...> against specification of allowInGenericArguments option
        if (
          node.parent.type === AST_NODE_TYPES.TSTypeParameterInstantiation &&
          node.parent.parent.type === AST_NODE_TYPES.TSTypeReference
        ) {
          checkGenericTypeArgument(node);
          return;
        }

        // allow <T = void> if allowInGenericTypeArguments is specified, and report if the generic type parameter extends void
        if (
          allowInGenericTypeArguments &&
          node.parent.type === AST_NODE_TYPES.TSTypeParameter &&
          node.parent.default?.type === AST_NODE_TYPES.TSVoidKeyword
        ) {
          checkDefaultVoid(node, node.parent);
          return;
        }

        // union w/ void must contain types from validUnionMembers, or a valid generic void type
        if (
          node.parent.type === AST_NODE_TYPES.TSUnionType &&
          isValidUnionType(node.parent)
        ) {
          return;
        }

        // using `void` as part of the return type of function overloading implementation
        if (node.parent.type === AST_NODE_TYPES.TSUnionType) {
          const declaringFunction = getParentFunctionDeclarationNode(
            node.parent,
          );

          if (declaringFunction && hasOverloadMethods(declaringFunction)) {
            return;
          }
        }

        // this parameter is ok to be void.
        if (
          allowAsThisParameter &&
          node.parent.type === AST_NODE_TYPES.TSTypeAnnotation &&
          node.parent.parent.type === AST_NODE_TYPES.Identifier &&
          node.parent.parent.name === 'this'
        ) {
          return;
        }

        // default cases
        if (
          validParents.includes(node.parent.type) &&
          // https://github.com/typescript-eslint/typescript-eslint/issues/6225
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          !invalidGrandParents.includes(node.parent.parent!.type)
        ) {
          return;
        }

        context.report({
          node,
          messageId:
            allowInGenericTypeArguments && allowAsThisParameter
              ? 'invalidVoidNotReturnOrThisParamOrGeneric'
              : allowInGenericTypeArguments
                ? getNotReturnOrGenericMessageId(node)
                : allowAsThisParameter
                  ? 'invalidVoidNotReturnOrThisParam'
                  : 'invalidVoidNotReturn',
        });
      },
    };
  },
});

function getNotReturnOrGenericMessageId(
  node: TSESTree.TSVoidKeyword,
): MessageIds {
  return node.parent.type === AST_NODE_TYPES.TSUnionType
    ? 'invalidVoidUnionConstituent'
    : 'invalidVoidNotReturnOrGeneric';
}
