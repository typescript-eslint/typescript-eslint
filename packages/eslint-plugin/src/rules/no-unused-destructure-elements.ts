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

export default createRule({
  name: 'no-unused-destructure-elements',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow partial destructuring of inline objects and tuple types',
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

    function isTypeMatchingIndexSignatureType(
      indexSignatureType: ts.Type,
      comparedType: ts.Type,
    ): boolean {
      if (isNoUncheckedIndexedAccess) {
        const uncastParts = tsutils
          .unionTypeParts(indexSignatureType)
          .filter(part => !isTypeFlagSet(part, ts.TypeFlags.Undefined));

        const castParts = tsutils.unionTypeParts(comparedType);

        if (uncastParts.length !== castParts.length) {
          return false;
        }

        const uncastPartsSet = new Set(uncastParts);
        return castParts.every(part => uncastPartsSet.has(part));
      }

      return indexSignatureType === comparedType;
    }

    /**
     * Recursive function to report on missing destructuring in object nodes.
     */
    function checkObject(
      node: TSESTree.ObjectPattern,
      typeAnnotation: TSESTree.TSTypeLiteral,
    ): void {
      const remainingProperties = new Map<
        number | string | symbol,
        PropertyDestructure
      >();
      const dynamicProperties = new Set<PropertyDestructure>();
      const indexSignatures: TSESTree.TSIndexSignature[] = [];

      // collect used properties
      for (const property of node.properties) {
        // bail on a rest element
        if (property.type === AST_NODE_TYPES.RestElement) {
          return;
        }

        const memberKey = getStaticMemberAccessValue(property, context);

        // collect dynamic keys which we failed to statically analyzed
        if (memberKey === undefined) {
          dynamicProperties.add({ property });
          continue;
        }

        remainingProperties.set(memberKey, { property });
      }

      // remove used type members, report on anything that's unused
      for (const member of typeAnnotation.members) {
        if (member.type === AST_NODE_TYPES.TSIndexSignature) {
          indexSignatures.push(member);
          continue;
        }

        if (
          member.type === AST_NODE_TYPES.TSMethodSignature ||
          member.type === AST_NODE_TYPES.TSPropertySignature
        ) {
          const memberKey = getStaticMemberAccessValue(member, context);

          if (memberKey === undefined) {
            continue;
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

            continue;
          }

          // check if this is used by a dynamic index type
          const dynamicProperty = memberKeyMatchesDynamicProperty(
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

            continue;
          }

          reportOnMember(member, {
            type: 'property',
            key: String(memberKey),
          });
        }
      }

      // check and report on any unused index signatures
      for (const indexSignature of indexSignatures) {
        // an index signature must have exactly one parameter, having more
        // is valid syntax, but invalid typescript
        const indexParameter = indexSignature.parameters[0];
        const indexParameterType = getConstrainedTypeAtLocation(
          services,
          indexParameter,
        );

        if (
          indexSignatureHasMatchingKey(
            indexParameterType,
            dynamicProperties,
            remainingProperties,
          )
        ) {
          continue;
        }

        // Template literal index signatures are used if any remaining property's type is the same
        if (
          tsutils.isTemplateLiteralType(indexParameterType) &&
          indexSignatureHasMatchingValue(
            remainingProperties.values(),
            indexSignature,
          )
        ) {
          continue;
        }

        reportOnMember(indexSignature, {
          type: 'index signature',
          key: `[${checker.typeToString(indexParameterType)}]`,
        });
      }
    }

    /**
     * Recursive function to report on missing destructuring in array nodes.
     */
    function checkTuple(
      param: TSESTree.ArrayPattern,
      typeAnnotation: TSESTree.TSTupleType,
    ): void {
      for (const [index, member] of typeAnnotation.elementTypes.entries()) {
        const property = param.elements.at(index);

        if (
          // bail in case of `[, ...]`
          // eslint-disable-next-line eqeqeq
          property === null ||
          // bail on a rest element
          property?.type === AST_NODE_TYPES.RestElement
        ) {
          return;
        }

        if (property === undefined) {
          reportOnMember(member, { type: 'key', key: String(index) });
          continue;
        }

        checkParam(property, member);
      }
    }

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

    /**
     * Attempts to find a dynamic property that matches a given member key.
     *
     * @returns `TSESTree.Property` if it finds one, or `false` otherwise.
     */
    function memberKeyMatchesDynamicProperty(
      memberKey: number | string | symbol,
      dynamicProperties: Set<PropertyDestructure>,
    ): TSESTree.Property | undefined {
      for (const destructure of dynamicProperties) {
        destructure.type ??= services.getTypeAtLocation(
          destructure.property.key,
        );

        for (const type of tsutils.unionTypeParts(destructure.type)) {
          if (
            typeof memberKey === 'string' &&
            ((tsutils.isStringLiteralType(type) && type.value === memberKey) ||
              tsutils.isIntrinsicStringType(type))
          ) {
            return destructure.property;
          }

          if (
            typeof memberKey === 'number' &&
            ((tsutils.isNumberLiteralType(type) && type.value === memberKey) ||
              tsutils.isIntrinsicNumberType(type))
          ) {
            return destructure.property;
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
      dynamicProperties: Set<PropertyDestructure>,
      remainingProperties: Map<number | string | symbol, PropertyDestructure>,
    ) {
      const indexParameterTypeParts =
        tsutils.unionTypeParts(indexParameterType);

      // check remaining properties for a match
      for (const key of remainingProperties.keys()) {
        if (
          typeof key === 'number' &&
          indexParameterTypeParts.some(tsutils.isIntrinsicNumberType)
        ) {
          return true;
        }

        if (
          typeof key === 'string' &&
          indexParameterTypeParts.some(tsutils.isIntrinsicStringType)
        ) {
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
      remainingDestructures: IterableIterator<PropertyDestructure>,
      indexSignature: TSESTree.TSIndexSignature,
    ): boolean {
      // `{ used }: { [i: `_${string}`] }`
      if (!indexSignature.typeAnnotation) {
        return true;
      }

      const indexType = services.getTypeAtLocation(
        indexSignature.typeAnnotation.typeAnnotation,
      );

      for (const destructure of remainingDestructures) {
        destructure.type ??= services.getTypeAtLocation(
          destructure.property.value,
        );

        if (isTypeMatchingIndexSignatureType(destructure.type, indexType)) {
          return true;
        }
      }

      return false;
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
