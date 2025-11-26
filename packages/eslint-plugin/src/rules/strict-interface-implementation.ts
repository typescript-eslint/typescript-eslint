import type { TSESTree } from '@typescript-eslint/utils';
import type * as ts from 'typescript';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { NodeWithKey } from '../util';

import {
  createRule,
  getParserServices,
  getStaticMemberAccessValue,
  isNodeWithKey,
} from '../util';

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
        "This method has more parameters than its implemented interface {{interface}}'s type for {{name}}.",
      methodParameter:
        "This method's parameter {{index}} is not assignable to the implemented interface {{interface}}'s parameter {{index}} type for {{name}}.",
      unassignable:
        "This property is not fully assignable to the implemented interface {{interface}}'s type for {{name}}.",
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
      const failure = getMethodAssignabilityFailure(
        metadata.baseType,
        metadata.derivedType,
      );

      switch (failure?.reason) {
        case 'excess-parameters':
          context.report({
            node: element.key,
            messageId: 'methodExcessParameters',
            data: {
              name: metadata.fieldName,
              interface: checker.symbolToString(base),
            },
          });
          break;

        case 'parameter':
          for (const index of failure.indices) {
            context.report({
              node: element.value.params[index],
              messageId: 'methodParameter',
              data: {
                name: metadata.fieldName,
                index,
                interface: checker.symbolToString(base),
              },
            });
          }
          break;
      }
    }

    function getMethodAssignabilityFailure(base: ts.Type, derived: ts.Type) {
      const baseSignature = base.getCallSignatures()[0];
      const derivedSignature = derived.getCallSignatures()[0];

      if (
        derivedSignature.parameters.length > baseSignature.parameters.length
      ) {
        return { reason: 'excess-parameters' } as const;
      }

      const indices: number[] = [];

      for (let i = 0; i < derivedSignature.parameters.length; i += 1) {
        const baseType = checker.getTypeOfSymbol(baseSignature.parameters[i]);
        const derivedType = checker.getTypeOfSymbol(
          derivedSignature.parameters[i],
        );

        if (!checker.isTypeAssignableTo(baseType, derivedType)) {
          indices.push(i);
        }
      }

      return indices.length > 0
        ? ({ indices, reason: 'parameter' } as const)
        : undefined;
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
        checker.isTypeAssignableTo(metadata.baseType, metadata.derivedType)
      ) {
        return;
      }

      context.report({
        node: element.key,
        messageId: 'unassignable',
        data: {
          name: metadata.fieldName,
          interface: checker.symbolToString(base),
        },
      });
    }

    function* getSuperClassImplements(
      superType: ts.Type,
    ): Generator<ts.Symbol | undefined> {
      yield superType.getSymbol();

      for (const baseType of checker.getBaseTypes(
        superType as ts.InterfaceType,
      )) {
        yield* getSuperClassImplements(baseType);
      }
    }

    return {
      'ClassDeclaration, ClassExpression'(
        node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
      ) {
        for (const implemented of node.implements) {
          checkClassImplements(
            node,
            services.getSymbolAtLocation(implemented.expression),
          );
        }

        if (node.superClass && node.body.body.length) {
          for (const implemented of getSuperClassImplements(
            services.getTypeAtLocation(node.superClass),
          )) {
            checkClassImplements(node, implemented);
          }
        }
      },
    };
  },
});
