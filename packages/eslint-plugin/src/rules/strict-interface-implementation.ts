import * as tsutils from 'ts-api-utils';
import type { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

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
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      unassignable:
        'This {{target}} is not fully assignable to the interface {{interface}} type for {{name}}.',
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
      const methodName = getStaticMemberAccessValue(element, context);
      if (typeof methodName !== 'string') {
        return;
      }

      const baseMethod = base.members?.get(methodName as ts.__String);
      if (!baseMethod?.valueDeclaration) {
        return;
      }

      const baseType = checker.getTypeAtLocation(baseMethod.valueDeclaration);
      const derivedType = services.getTypeAtLocation(element);

      if (isMethodAssignable(baseType, derivedType)) {
        return;
      }

      context.report({
        node: element.key,
        messageId: 'unassignable',
        data: {
          name: methodName,
          interface: checker.symbolToString(base),
          target: 'method',
        },
      });
    }

    function isMethodAssignable(base: ts.Type, derived: ts.Type) {
      const baseSignature = base.getCallSignatures()[0];
      const derivedSignature = derived.getCallSignatures()[0];

      if (
        derivedSignature.parameters.length > baseSignature.parameters.length
      ) {
        return false;
      }

      for (let i = 0; i < baseSignature.parameters.length; i += 1) {
        const baseType = checker.getTypeOfSymbol(baseSignature.parameters[i]);
        const derivedType = checker.getTypeOfSymbol(
          derivedSignature.parameters[i],
        );

        if (!checker.isTypeAssignableTo(baseType, derivedType)) {
          return false;
        }
      }

      return true;
    }

    function checkProperty(element: NodeWithStaticKey, base: ts.Symbol) {
      const propertyName = getStaticMemberAccessValue(element, context);
      if (typeof propertyName !== 'string') {
        return;
      }

      const baseProperty = base.members?.get(propertyName as ts.__String);
      if (!baseProperty?.valueDeclaration) {
        return;
      }

      const baseType = checker.getTypeAtLocation(baseProperty.valueDeclaration);
      const derivedType = services.getTypeAtLocation(element);

      if (checker.isTypeAssignableTo(baseType, derivedType)) {
        return;
      }

      context.report({
        node: element.key,
        messageId: 'unassignable',
        data: {
          name: propertyName,
          interface: checker.symbolToString(base),
          target: 'property',
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
