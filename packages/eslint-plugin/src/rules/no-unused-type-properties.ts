import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import ts from 'typescript';

import * as util from '../util';
import { getIntrinsicName } from '../util';

type ObjectPatternWithTypeAnnotation = TSESTree.ObjectPattern & {
  typeAnnotation: {
    typeAnnotation: {
      type: AST_NODE_TYPES.TSTypeLiteral;
    };
  };
};

interface PropertyDestructure {
  /**
   * @remarks We avoid computing property types until we know we need them.
   */
  type?: ts.Type;
  property: TSESTree.Property;
}

export default util.createRule({
  name: 'no-unused-type-properties',
  meta: {
    docs: {
      description: 'Flag unused properties on inline object types',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      unused: 'This {{ term }} is unused and may be removed.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      "ObjectPattern[typeAnnotation.typeAnnotation.type='TSTypeLiteral']"(
        node: ObjectPatternWithTypeAnnotation,
      ): void {
        const remainingProperties = new Map<string, PropertyDestructure>();
        const indexSignatures: TSESTree.TSIndexSignature[] = [];

        for (const property of node.properties) {
          if (property.type === AST_NODE_TYPES.RestElement) {
            return;
          }

          if (property.key.type === AST_NODE_TYPES.Identifier) {
            remainingProperties.set(property.key.name, { property });
          } else if (property.key.type === AST_NODE_TYPES.Literal) {
            remainingProperties.set(`${property.key.value}`, { property });
          }
        }

        for (const member of node.typeAnnotation.typeAnnotation.members) {
          if (member.type === AST_NODE_TYPES.TSIndexSignature) {
            indexSignatures.push(member);
            continue;
          }

          if (
            member.type === AST_NODE_TYPES.TSMethodSignature ||
            member.type === AST_NODE_TYPES.TSPropertySignature
          ) {
            const memberKey = getMemberKey(member.key);
            if (memberKey === undefined) {
              continue;
            }

            if (remainingProperties.has(memberKey)) {
              remainingProperties.delete(memberKey);
            } else {
              reportOnMember(member, 'property type');
            }
          }
        }

        // Index signatures are considered unused if no type adheres to them
        // At this point, only unused properties are still in remainingProperties
        for (const indexSignature of indexSignatures) {
          const memberTsNode =
            parserServices.esTreeNodeToTSNodeMap.get(indexSignature);
          const indexType = checker.getTypeAtLocation(memberTsNode.type);

          // Indexes are unused if no remaining property's type is the same
          // (this is necessary for template literal types like [i: `_${string}`])
          if (
            !propertyMatchesIndexSignature(
              remainingProperties.values(),
              indexType,
            )
          ) {
            reportOnMember(indexSignature, 'index signature');
          }
        }
      },
    };

    function reportOnMember(member: TSESTree.Node, term: string): void {
      context.report({
        data: { term },
        fix(fixer) {
          return fixer.remove(member);
        },
        messageId: 'unused',
        node: member,
      });
    }

    function propertyMatchesIndexSignature(
      remainingDestructures: IterableIterator<PropertyDestructure>,
      indexType: ts.Type,
    ): boolean {
      for (const destructure of remainingDestructures) {
        destructure.type ??= checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(destructure.property.value),
        );

        if (destructure.type === indexType) {
          return true;
        }
      }

      return false;
    }
  },
});

function getMemberKey(key: TSESTree.Node): string | undefined {
  switch (key.type) {
    case AST_NODE_TYPES.Identifier:
      return key.name;
    case AST_NODE_TYPES.Literal:
      return `${key.value}`;
  }

  return undefined;
}
