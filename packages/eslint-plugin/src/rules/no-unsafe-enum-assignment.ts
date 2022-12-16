import type { TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';
import { getBaseEnumType, getEnumTypes } from './enum-utils/shared';

const ALLOWED_TYPES_FOR_ANY_ENUM_ARGUMENT =
  ts.TypeFlags.Unknown | ts.TypeFlags.Number | ts.TypeFlags.String;

export default util.createRule({
  name: 'no-unsafe-enum-assignment',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow providing non-enum values to enum typed locations',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      operation:
        'This {{ operator }} may change the enum value to one not present in its enum type.',
      provided: 'Unsafe non enum type provided to an enum value.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    /**
     * Similar to `getEnumTypes`, but returns early as soon as it finds one.
     */
    function hasEnumType(type: ts.Type): boolean {
      return tsutils
        .unionTypeParts(type)
        .some(subType => util.isTypeFlagSet(subType, ts.TypeFlags.EnumLiteral));
    }

    function getTypeFromNode(node: TSESTree.Node): ts.Type {
      return typeChecker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(node),
      );
    }

    /**
     * @returns Whether the recipient type is an enum and the provided type
     * unsafely provides it a number.
     */
    function isProvidedTypeUnsafe(
      providedType: ts.Type,
      recipientType: ts.Type,
    ): boolean {
      // This short-circuits most logic: if the types are the same, we're happy.
      if (providedType === recipientType) {
        return false;
      }

      // `any` types can't be reasoned with
      if (
        tsutils.isTypeFlagSet(recipientType, ts.TypeFlags.Any) ||
        tsutils.isTypeFlagSet(providedType, ts.TypeFlags.Any)
      ) {
        return false;
      }

      // If the two types are containers, check each matching type recursively.
      //
      // ```ts
      // declare let fruits: Fruit[];
      // fruits = [0, 1];
      // ```
      if (
        util.isTypeReferenceType(recipientType) &&
        util.isTypeReferenceType(providedType)
      ) {
        return isProvidedReferenceValueMismatched(providedType, recipientType);
      }

      // If the recipient is not an enum, we don't care about it.
      const recipientEnumTypes = new Set(
        getEnumTypes(typeChecker, recipientType),
      );
      if (recipientEnumTypes.size === 0) {
        return false;
      }

      const providedUnionTypes = tsutils.unionTypeParts(providedType);

      // Either every provided type should match the recipient enum...
      if (
        providedUnionTypes.every(providedType =>
          recipientEnumTypes.has(getBaseEnumType(typeChecker, providedType)),
        )
      ) {
        return false;
      }

      // ...or none of them can be an enum at all
      return !providedUnionTypes.every(tsutils.isEnumType);
    }

    /**
     * Finds the first mismatched type reference: meaning, a non-enum type in
     * the provided type compared to an enum type in the recipient type.
     */
    function isProvidedReferenceValueMismatched(
      providedType: ts.TypeReference,
      recipientType: ts.TypeReference,
    ): boolean {
      const providedTypeArguments = typeChecker.getTypeArguments(providedType);
      const recipientTypeArguments =
        typeChecker.getTypeArguments(recipientType);

      for (
        let i = 0;
        i <
        Math.min(recipientTypeArguments.length, providedTypeArguments.length);
        i += 1
      ) {
        if (
          isProvidedTypeUnsafe(
            providedTypeArguments[i],
            recipientTypeArguments[i],
          )
        ) {
          return true;
        }
      }

      return false;
    }

    /**
     * @returns The type of the parameter to the node, accounting for generic
     * type parameters.
     */
    function getParameterType(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
      signature: ts.Signature,
      index: number,
    ): ts.Type {
      // If possible, try to find the original parameter to retrieve any generic
      // type parameter. For example:
      //
      // ```ts
      // declare function useFruit<FruitType extends Fruit>(fruitType: FruitType);
      // useFruit(0)
      // ```
      const parameter = signature.getDeclaration()?.parameters[index];
      if (parameter !== undefined) {
        const parameterType = typeChecker.getTypeAtLocation(parameter);
        const constraint = parameterType.getConstraint();
        if (constraint !== undefined) {
          return constraint;
        }
      }

      // Failing that, defer to whatever TypeScript sees as the contextual type.
      return typeChecker.getContextualTypeForArgumentAtIndex(
        parserServices.esTreeNodeToTSNodeMap.get(node),
        index,
      );
    }

    function isMismatchedEnumFunctionArgument(
      argumentType: ts.Type,
      parameterType: ts.Type,
    ): boolean {
      // First, recursively check for functions with type containers like:
      //
      // ```ts
      // declare function useFruits(fruits: Fruit[]);
      // useFruits([0, 1]);
      // ```
      if (util.isTypeReferenceType(argumentType)) {
        const argumentTypeArguments =
          typeChecker.getTypeArguments(argumentType);

        const parameterSubTypes = tsutils.unionTypeParts(parameterType);
        for (const parameterSubType of parameterSubTypes) {
          if (!util.isTypeReferenceType(parameterSubType)) {
            continue;
          }
          const parameterTypeArguments =
            typeChecker.getTypeArguments(parameterSubType);

          for (let i = 0; i < argumentTypeArguments.length; i++) {
            if (
              isMismatchedEnumFunctionArgument(
                argumentTypeArguments[i],
                parameterTypeArguments[i],
              )
            ) {
              return true;
            }
          }
        }

        return false;
      }

      // Allow function calls that have nothing to do with enums, like:
      //
      // ```ts
      // declare function useNumber(num: number);
      // useNumber(0);
      // ```
      const parameterEnumTypes = getEnumTypes(typeChecker, parameterType);
      if (parameterEnumTypes.length === 0) {
        return false;
      }

      // Allow passing enum values into functions that take in the "any" type
      // and similar types that should basically match any enum, like:
      //
      // ```ts
      // declare function useNumber(num: number);
      // useNumber(Fruit.Apple);
      // ```
      const parameterSubTypes = new Set(tsutils.unionTypeParts(parameterType));
      for (const parameterSubType of parameterSubTypes) {
        if (
          util.isTypeFlagSet(
            parameterSubType,
            ALLOWED_TYPES_FOR_ANY_ENUM_ARGUMENT,
          )
        ) {
          return false;
        }
      }

      // Disallow passing number literals into enum parameters, like:
      //
      // ```ts
      // declare function useFruit(fruit: Fruit);
      // declare const fruit: Fruit.Apple | 1;
      // useFruit(fruit)
      // ```
      return tsutils.unionTypeParts(argumentType).some(
        argumentSubType =>
          argumentSubType.isLiteral() &&
          !util.isTypeFlagSet(argumentSubType, ts.TypeFlags.EnumLiteral) &&
          // Permit the argument if it's a number the parameter allows, like:
          //
          // ```ts
          // declare function useFruit(fruit: Fruit | -1);
          // useFruit(-1)
          // ```
          // that's ok too
          !parameterSubTypes.has(argumentSubType),
      );
    }

    /**
     * Checks whether a provided node mismatches
     *
     * @param provided
     * @param recipient
     */
    function compareProvidedNode(
      provided: TSESTree.Node,
      recipient: TSESTree.Node,
    ): void {
      const providedType = getTypeFromNode(provided);
      const recipientType = getTypeFromNode(recipient);

      if (isProvidedTypeUnsafe(providedType, recipientType)) {
        context.report({
          messageId: 'provided',
          node: provided,
        });
      }
    }

    return {
      AssignmentExpression(node): void {
        compareProvidedNode(node.right, node.left);
      },

      'CallExpression, NewExpression'(
        node: TSESTree.CallExpression | TSESTree.NewExpression,
      ): void {
        const signature = typeChecker.getResolvedSignature(
          parserServices.esTreeNodeToTSNodeMap.get(node),
          undefined,
          node.arguments.length,
        )!;

        // Iterate through the arguments provided to the call function and cross
        // reference their types to the types of the "real" function parameters.
        for (let i = 0; i < node.arguments.length; i++) {
          // any-typed arguments can be ignored altogether
          const argumentType = getTypeFromNode(node.arguments[i]);
          if (tsutils.isTypeFlagSet(argumentType, ts.TypeFlags.Any)) {
            continue;
          }

          const parameterType = getParameterType(node, signature, i);

          // Disallow mismatched function calls, like:
          //
          // ```ts
          // declare function useFruit(fruit: Fruit);
          // useFruit(0);
          // ```
          if (isMismatchedEnumFunctionArgument(argumentType, parameterType)) {
            context.report({
              messageId: 'provided',
              node: node.arguments[i],
            });
          }
        }
      },

      UpdateExpression(node): void {
        if (hasEnumType(getTypeFromNode(node.argument))) {
          context.report({
            data: {
              operator: node.operator,
            },
            messageId: 'operation',
            node,
          });
        }
      },

      'VariableDeclarator[init]'(
        node: TSESTree.VariableDeclarator & {
          init: NonNullable<TSESTree.VariableDeclarator['init']>;
        },
      ): void {
        compareProvidedNode(node.init, node.id);
      },
    };
  },
});
