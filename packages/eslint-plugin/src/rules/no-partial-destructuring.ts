import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getStaticMemberAccessValue,
  isTypeFlagSet,
} from '../util';

interface PropertyDestructure {
  /**
   * @remarks We avoid computing property types until we know we need them.
   */
  type?: ts.Type;
  property: TSESTree.Property;
}

type RemainingProperties = Map<number | string | symbol, PropertyDestructure>;

type DynamicProperties = Set<PropertyDestructure>;

export default createRule({
  name: 'no-partial-destructuring',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow destructuring patterns that do not fully handle all elements of inline object and tuple types',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      partialDestructuring: "Unused {{type}} '{{key}}' in destructuring.",
      removeUnusedKey: "Remove unused {{type}} '{{key}}' from destructuring.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();
    const isNoUncheckedIndexedAccess =
      !!compilerOptions.noUncheckedIndexedAccess;

    /**
     * Checks and reports a destructuring node and and its matching type annotation.
     *
     * _Ignores non-destructuring nodes._
     */
    function checkParam(param: TSESTree.Node, paramType: TSESTree.Node): void {
      if (
        param.type === AST_NODE_TYPES.ObjectPattern &&
        paramType.type === AST_NODE_TYPES.TSTypeLiteral
      ) {
        return checkObject(param, paramType);
      }

      if (
        param.type === AST_NODE_TYPES.ArrayPattern &&
        paramType.type === AST_NODE_TYPES.TSTupleType
      ) {
        return checkTuple(param, paramType);
      }

      // do nothing otherwise
    }

    function checkObject(
      node: TSESTree.ObjectPattern,
      typeAnnotation: TSESTree.TSTypeLiteral,
    ): void {
      const remainingProperties: RemainingProperties = new Map();
      const dynamicProperties: DynamicProperties = new Set();

      // collect used properties
      for (const property of node.properties) {
        // bail on a rest element
        if (property.type === AST_NODE_TYPES.RestElement) {
          return;
        }

        const memberKey = getStaticMemberAccessValue(property, context);

        // collect dynamic keys which we failed to statically analyzed
        if (memberKey === undefined) {
          const valueType = services.getTypeAtLocation(property.value);

          // bail if a dynamic property misses; this is a type-error
          if (tsutils.isIntrinsicErrorType(valueType)) {
            return;
          }

          dynamicProperties.add({ property });
          continue;
        }

        remainingProperties.set(memberKey, { property });
      }

      // remove used type members, report on anything that's unused
      for (const member of typeAnnotation.members) {
        if (member.type === AST_NODE_TYPES.TSIndexSignature) {
          checkIndexSignature(member, remainingProperties, dynamicProperties);
          continue;
        }

        if (
          member.type === AST_NODE_TYPES.TSMethodSignature ||
          member.type === AST_NODE_TYPES.TSPropertySignature
        ) {
          checkStaticMember(member, remainingProperties, dynamicProperties);
          continue;
        }
      }
    }

    function checkTuple(
      param: TSESTree.ArrayPattern,
      typeAnnotation: TSESTree.TSTupleType,
    ): void {
      for (const [index, member] of typeAnnotation.elementTypes.entries()) {
        const property = param.elements.at(index);

        // missing destructure
        if (property === undefined) {
          reportOnMember(member, { type: 'key', key: String(index) });
          continue;
        }

        if (
          // bail in case of `[, ...]`
          property == null ||
          // bail on a rest element
          property.type === AST_NODE_TYPES.RestElement
        ) {
          return;
        }

        checkParam(property, member);
      }
    }

    /**
     * Checks if an index signature property is covered by at least one destructure property.
     */
    function checkIndexSignature(
      member: TSESTree.TSIndexSignature,
      remainingProperties: RemainingProperties,
      dynamicProperties: DynamicProperties,
    ) {
      const indexParameterType = getConstrainedTypeAtLocation(
        services,
        // an index signature must have exactly one parameter, having more
        // is valid syntax, but invalid typescript
        member.parameters[0],
      );

      if (
        indexSignatureHasMatchingKey(
          indexParameterType,
          dynamicProperties,
          remainingProperties,
        )
      ) {
        return;
      }

      // Template literal index signatures are used if any remaining property's type is the
      // same, this may miss some unused template literal index signatures
      if (
        tsutils.isTemplateLiteralType(indexParameterType) &&
        indexSignatureHasMatchingValue(remainingProperties, member)
      ) {
        return;
      }

      reportOnMember(member, {
        type: 'index signature',
        key: `[${checker.typeToString(indexParameterType)}]`,
      });
    }

    /**
     * Checks if an non index-signature property is covered by at least one destructure property.
     */
    function checkStaticMember(
      member: TSESTree.TSMethodSignature | TSESTree.TSPropertySignature,
      remainingProperties: RemainingProperties,
      dynamicProperties: DynamicProperties,
    ): void {
      const memberKey = getStaticMemberAccessValue(member, context);

      if (memberKey === undefined) {
        return;
      }

      // check if this is used by a remaining property
      const remainingProperty = remainingProperties.get(memberKey);

      if (remainingProperty) {
        remainingProperties.delete(memberKey);

        if (
          member.type === AST_NODE_TYPES.TSPropertySignature &&
          member.typeAnnotation
        ) {
          checkParam(
            remainingProperty.property.value,
            member.typeAnnotation.typeAnnotation,
          );
        }

        return;
      }

      // check if this is used by a dynamic index type
      const dynamicProperty = getDynamicKeyForMember(
        member,
        memberKey,
        dynamicProperties,
      );

      if (dynamicProperty) {
        if (
          member.type === AST_NODE_TYPES.TSPropertySignature &&
          member.typeAnnotation
        ) {
          checkParam(
            dynamicProperty.value,
            member.typeAnnotation.typeAnnotation,
          );
        }

        return;
      }

      reportOnMember(member, {
        type: 'property',
        key: String(memberKey),
      });
    }

    /**
     * Attempts to find a dynamic property that matches a given member key.
     */
    function getDynamicKeyForMember(
      member: TSESTree.TSMethodSignature | TSESTree.TSPropertySignature,
      memberKey: number | string | symbol,
      dynamicProperties: DynamicProperties,
    ): TSESTree.Property | undefined {
      for (const destructure of dynamicProperties) {
        destructure.type ??= getConstrainedTypeAtLocation(
          services,
          destructure.property.key,
        );

        for (const type of tsutils.unionTypeParts(destructure.type)) {
          if (tsutils.isStringLiteralType(type) && type.value === memberKey) {
            return destructure.property;
          }

          if (tsutils.isNumberLiteralType(type) && type.value === memberKey) {
            return destructure.property;
          }
        }
      }

      // compare types for computed type keys
      if (member.computed) {
        const memberKeyType = services.getTypeAtLocation(member.key);

        for (const destructure of dynamicProperties) {
          destructure.type ??= getConstrainedTypeAtLocation(
            services,
            destructure.property.key,
          );

          for (const type of tsutils.unionTypeParts(destructure.type)) {
            if (checker.isTypeAssignableTo(type, memberKeyType)) {
              return destructure.property;
            }
          }
        }
      }

      return undefined;
    }

    /**
     * @returns `true` if an index signature's key matches an existing
     * property's key, `false` otherwise
     */
    function indexSignatureHasMatchingKey(
      indexParameterType: ts.Type,
      dynamicProperties: DynamicProperties,
      remainingProperties: RemainingProperties,
    ) {
      const indexParameterTypeParts =
        tsutils.unionTypeParts(indexParameterType);

      const indexParameterHasNumberType = indexParameterTypeParts.some(
        tsutils.isIntrinsicNumberType,
      );

      const indexParameterHasStringType = indexParameterTypeParts.some(
        tsutils.isIntrinsicStringType,
      );

      // check remaining properties for a match
      for (const key of remainingProperties.keys()) {
        if (typeof key === 'number' && indexParameterHasNumberType) {
          return true;
        }

        if (typeof key === 'string' && indexParameterHasStringType) {
          return true;
        }
      }

      // check dynamic properties for a match
      for (const destructure of dynamicProperties) {
        destructure.type ??= services.getTypeAtLocation(
          destructure.property.key,
        );

        for (const type of tsutils.unionTypeParts(destructure.type)) {
          if (checker.isTypeAssignableTo(type, indexParameterType)) {
            return true;
          }
        }
      }

      return false;
    }

    /**
     * @returns `true` if an index signature's value type matches an existing
     * property's value type, `false` otherwise
     */
    function indexSignatureHasMatchingValue(
      remainingProperties: RemainingProperties,
      indexSignature: TSESTree.TSIndexSignature,
    ): boolean {
      // `{ used }: { [i: `_${string}`] }`
      if (!indexSignature.typeAnnotation) {
        return true;
      }

      const indexType = services.getTypeAtLocation(
        indexSignature.typeAnnotation.typeAnnotation,
      );

      for (const destructure of remainingProperties.values()) {
        destructure.type ??= services.getTypeAtLocation(
          destructure.property.value,
        );

        if (isTypeMatchingIndexSignatureType(destructure.type, indexType)) {
          return true;
        }
      }

      return false;
    }

    /**
     * Compares an index-signature value-type with another type. If `isNoUncheckedIndexedAccess`
     * is enabled, will filter out `undefined` from the index-signature's type.
     */
    function isTypeMatchingIndexSignatureType(
      indexSignatureType: ts.Type,
      comparedType: ts.Type,
    ): boolean {
      if (isNoUncheckedIndexedAccess) {
        const indexSignatureParts = tsutils
          .unionTypeParts(indexSignatureType)
          .filter(part => !isTypeFlagSet(part, ts.TypeFlags.Undefined));

        const comparedTypeParts = tsutils.unionTypeParts(comparedType);

        if (indexSignatureParts.length !== comparedTypeParts.length) {
          return false;
        }

        const indexSignaturePartsSet = new Set(indexSignatureParts);

        return comparedTypeParts.every(part =>
          indexSignaturePartsSet.has(part),
        );
      }

      return indexSignatureType === comparedType;
    }

    function reportOnMember(
      member: TSESTree.Node,
      data: { key: string; type: string },
    ): void {
      context.report({
        node: member,
        messageId: 'partialDestructuring',
        data,
        suggest: [
          {
            messageId: 'removeUnusedKey',
            data,
            fix: fixer => {
              const nextToken = context.sourceCode.getTokenAfter(member);

              if (nextToken?.value === ',') {
                return fixer.removeRange([member.range[0], nextToken.range[1]]);
              }

              return fixer.remove(member);
            },
          },
        ],
      });
    }

    return {
      "ArrayPattern[typeAnnotation.typeAnnotation.type='TSTupleType']"(
        node: TSESTree.ArrayPattern & {
          typeAnnotation: TSESTree.TSTypeAnnotation;
        },
      ): void {
        checkParam(node, node.typeAnnotation.typeAnnotation);
      },
      "ObjectPattern[typeAnnotation.typeAnnotation.type='TSTypeLiteral']"(
        node: TSESTree.ObjectPattern & {
          typeAnnotation: TSESTree.TSTypeAnnotation;
        },
      ): void {
        checkParam(node, node.typeAnnotation.typeAnnotation);
      },
    };
  },
});
