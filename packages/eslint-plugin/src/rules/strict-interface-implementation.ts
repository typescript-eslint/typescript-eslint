import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import type { NodeWithKey } from '../util';

import {
  createRule,
  getParserServices,
  getStaticMemberAccessValue,
  isNodeWithKey,
} from '../util';
import { checkMethodAssignability } from './strict-interface-implementation-utils/checkMethodAssignability';
import { isTypeOrConstraintAssignableTo } from './strict-interface-implementation-utils/isTypeOrConstraintAssignableTo';

type NodeWithStaticKey = Exclude<
  NodeWithKey,
  | TSESTree.MemberExpressionComputedName
  | TSESTree.MemberExpressionNonComputedName
>;

export default createRule({
  name: 'strict-interface-implementation',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce classes are fully assignable to any interfaces they implement',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      methodExcessParameters:
        "This method has more parameters than its implemented interface `{{interface}}`'s type for the `{{method}}` method.",
      methodParameter:
        "This method's parameter `{{nameDerived}}` is not assignable to the implemented interface `{{interface}}`'s parameter `{{nameBase}}` type under the `{{method}}` method.",
      property:
        "This property is not fully assignable to the implemented interface `{{interface}}`'s type for `{{property}}` property.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function checkClassImplements(
      node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
      base: ts.Symbol | undefined,
    ) {
      if (!base) {
        return;
      }

      for (const element of node.body.body) {
        if (element.type === AST_NODE_TYPES.MethodDefinition) {
          checkMethod(element, base);
        } else if (isNodeWithKey(element)) {
          checkProperty(element, base);
        }
      }
    }

    function checkMethod(element: TSESTree.MethodDefinition, base: ts.Symbol) {
      const metadata = getFieldMetadata(element, base);
      if (!metadata) {
        return;
      }
      const failure = checkMethodAssignability(
        checker,
        metadata.baseType,
        metadata.derivedType,
      );

      switch (failure?.reason) {
        case 'excess-parameters':
          context.report({
            node: element.key,
            messageId: 'methodExcessParameters',
            data: {
              interface: checker.symbolToString(base),
              method: metadata.fieldName,
            },
          });
          break;

        case 'parameter':
          for (const params of failure.params) {
            context.report({
              node: element.value.params[params.derived.index],
              messageId: 'methodParameter',
              data: {
                interface: checker.symbolToString(base),
                method: metadata.fieldName,
                nameBase: params.base.name,
                nameDerived: params.derived.name,
              },
            });
          }
          break;
      }
    }

    function getFieldMetadata(element: NodeWithStaticKey, base: ts.Symbol) {
      const fieldName = getStaticMemberAccessValue(element, context);
      if (typeof fieldName !== 'string') {
        return undefined;
      }

      const baseProperty = base.members?.get(fieldName as ts.__String);
      if (!baseProperty?.valueDeclaration) {
        return undefined;
      }

      const baseType = checker.getTypeAtLocation(baseProperty.valueDeclaration);
      const derivedType = services.getTypeAtLocation(element);

      return { baseType, derivedType, fieldName };
    }

    function checkProperty(element: NodeWithStaticKey, base: ts.Symbol) {
      const metadata = getFieldMetadata(element, base);
      if (
        !metadata ||
        isTypeOrConstraintAssignableTo(
          checker,
          metadata.baseType,
          metadata.derivedType,
        )
      ) {
        return;
      }

      context.report({
        node: element.key,
        messageId: 'property',
        data: {
          interface: checker.symbolToString(base),
          property: metadata.fieldName,
        },
      });
    }

    function* getSuperClassImplements(
      superType: ts.Type,
    ): Generator<ts.Symbol | undefined> {
      const superSymbol = superType.getSymbol();
      if (!superSymbol) {
        return;
      }

      const valueDeclaration =
        superSymbol.valueDeclaration ??
        superSymbol.getDeclarations()?.find(ts.isInterfaceDeclaration);

      if (!valueDeclaration) {
        return;
      }

      if (ts.isInterfaceDeclaration(valueDeclaration)) {
        yield superSymbol;
      }

      if (
        (ts.isClassLike(valueDeclaration) ||
          ts.isInterfaceDeclaration(valueDeclaration)) &&
        valueDeclaration.heritageClauses
      ) {
        for (const heritageClause of valueDeclaration.heritageClauses) {
          for (const typeNode of heritageClause.types) {
            const baseType = checker.getTypeAtLocation(typeNode);
            yield* getSuperClassImplements(baseType);
          }
        }
      }
    }

    return {
      'ClassDeclaration, ClassExpression'(
        node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
      ) {
        for (const base of [...node.implements, node.superClass]) {
          if (base) {
            for (const target of getSuperClassImplements(
              services.getTypeAtLocation(base),
            )) {
              checkClassImplements(node, target);
            }
          }
        }
      },
    };
  },
});
