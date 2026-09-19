import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  FunctionSignature,
  getParserServices,
  getStaticMemberAccessValue,
  isNumberLike,
  isStringLike,
  nullThrows,
} from '../util';
import { getParentFunctionNode } from '../util/getParentFunctionNode';
import { getEnumTypes, getEnumValueType } from './enum-utils/shared';

type MessageIds =
  | 'unsafeEnumAccess'
  | 'unsafeEnumArgument'
  | 'unsafeEnumAssertion'
  | 'unsafeEnumAssignment'
  | 'unsafeEnumMutation'
  | 'unsafeEnumReturn';

const assigningOperators = new Set([
  '=',
  '&&=',
  '&=',
  '??=',
  '^=',
  '|=',
  '||=',
]);

const bitwiseOperators = new Set(['&', '^', '|']);

export default createRule<[], MessageIds>({
  name: 'no-unsafe-enum-assignment',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow assigning non-enum values to enum typed locations',
      recommended: 'strict',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeEnumAccess:
        'The computed key used here does not have a shared enum type with the expected enum {{enumNames}}.',
      unsafeEnumArgument:
        'The argument passed here does not have a shared enum type with the expected enum {{enumNames}}.',
      unsafeEnumAssertion:
        'The value asserted here does not have a shared enum type with the expected enum {{enumNames}}.',
      unsafeEnumAssignment:
        'The value assigned here does not have a shared enum type with the expected enum {{enumNames}}.',
      unsafeEnumMutation:
        'This mutation can produce a value outside of the expected enum {{enumNames}}.',
      unsafeEnumReturn:
        'The value returned here does not have a shared enum type with the expected enum {{enumNames}}.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    const checkedNodes = new WeakSet<TSESTree.Node>();

    function report(
      node: TSESTree.Node,
      messageId: MessageIds,
      receiverTypes: readonly ts.Type[],
    ) {
      context.report({
        node,
        messageId,
        data: { enumNames: describeEnumTypes(checker, receiverTypes) },
      });
    }

    function markChecked(node: TSESTree.Node) {
      checkedNodes.add(node);

      switch (node.type) {
        case AST_NODE_TYPES.ArrayExpression:
          node.elements.forEach(element => element && markChecked(element));
          break;
        case AST_NODE_TYPES.ObjectExpression:
          node.properties.forEach(markChecked);
          break;
        case AST_NODE_TYPES.Property:
          markChecked(node.value);
          break;
        case AST_NODE_TYPES.SpreadElement:
          markChecked(node.argument);
          break;
        case AST_NODE_TYPES.TSAsExpression:
        case AST_NODE_TYPES.TSNonNullExpression:
        case AST_NODE_TYPES.TSSatisfiesExpression:
        case AST_NODE_TYPES.TSTypeAssertion:
          markChecked(node.expression);
          break;
      }
    }

    function getContextualType(node: TSESTree.Node) {
      return checker.getContextualType(
        services.esTreeNodeToTSNodeMap.get(node) as ts.Expression,
      );
    }

    function isSafeEnumBitwiseExpression(
      node: TSESTree.Node,
      receiverType: ts.Type,
    ): boolean {
      function isSafeOperand(operand: TSESTree.Node): boolean {
        return (
          isSafeEnumBitwiseExpression(operand, receiverType) ||
          !isMismatchedEnumAssignmentTypes(
            checker,
            services.getTypeAtLocation(operand),
            receiverType,
          )
        );
      }

      switch (node.type) {
        case AST_NODE_TYPES.BinaryExpression:
          return (
            bitwiseOperators.has(node.operator) &&
            isSafeOperand(node.left) &&
            isSafeOperand(node.right)
          );

        case AST_NODE_TYPES.UnaryExpression:
          return node.operator === '~' && isSafeOperand(node.argument);

        default:
          return false;
      }
    }

    function isUnsafeAssignment(
      senderNode: TSESTree.Node,
      receiverType: ts.Type,
      senderType = services.getTypeAtLocation(senderNode),
    ) {
      return (
        hasDeepEnumAssignmentMismatch(checker, senderType, receiverType) &&
        !isSafeEnumBitwiseExpression(senderNode, receiverType)
      );
    }

    function checkAssignment(
      receiverType: ts.Type,
      senderNode: TSESTree.Node,
      reportingNode: TSESTree.Node,
      messageId: MessageIds = 'unsafeEnumAssignment',
      senderType?: ts.Type,
    ) {
      if (
        senderNode.type === AST_NODE_TYPES.ArrayExpression ||
        senderNode.type === AST_NODE_TYPES.ObjectExpression
      ) {
        return;
      }

      if (isUnsafeAssignment(senderNode, receiverType, senderType)) {
        report(reportingNode, messageId, [receiverType]);
        markChecked(senderNode);
      }
    }

    function checkArguments(
      node:
        | TSESTree.CallExpression
        | TSESTree.NewExpression
        | TSESTree.TaggedTemplateExpression,
      args: readonly (TSESTree.Expression | TSESTree.SpreadElement)[],
    ) {
      const signature = FunctionSignature.create(
        checker,
        services.esTreeNodeToTSNodeMap.get(node),
      );

      if (node.type === AST_NODE_TYPES.TaggedTemplateExpression) {
        // The first parameter receives the template's strings, not a value.
        signature.getNextParameterType();
      }

      for (const argument of args) {
        if (argument.type === AST_NODE_TYPES.SpreadElement) {
          const spreadType = services.getTypeAtLocation(argument.argument);

          if (checker.isTupleType(spreadType)) {
            const mismatchedParameterTypes = checker
              .getTypeArguments(spreadType)
              .flatMap(elementType => {
                const parameterType = signature.getNextParameterType();
                return parameterType != null &&
                  hasDeepEnumAssignmentMismatch(
                    checker,
                    elementType,
                    parameterType,
                  )
                  ? [parameterType]
                  : [];
              });

            if (mismatchedParameterTypes.length > 0) {
              report(argument, 'unsafeEnumArgument', mismatchedParameterTypes);
            }

            if (spreadType.target.combinedFlags & ts.ElementFlags.Variable) {
              signature.consumeRemainingArguments();
            }

            continue;
          }
        }

        const parameterType = signature.getNextParameterType();
        if (parameterType != null) {
          checkAssignment(
            parameterType,
            argument,
            argument,
            'unsafeEnumArgument',
          );
        }
      }
    }

    function checkClassMember(
      node: (TSESTree.AccessorProperty | TSESTree.PropertyDefinition) & {
        value: TSESTree.Expression;
      },
    ) {
      // Class members don't get contextually typed by the members they
      // implement or override, so those types are also checked explicitly:
      //
      // ```ts
      // class Basket implements HasFruit {
      //   fruit = 1;
      // }
      // ```
      const heritageMemberTypes = getHeritageMemberTypes(node);
      if (
        heritageMemberTypes.length > 0 &&
        heritageMemberTypes.every(heritageMemberType =>
          isUnsafeAssignment(node.value, heritageMemberType),
        )
      ) {
        report(node, 'unsafeEnumAssignment', heritageMemberTypes);
        markChecked(node.value);
        return;
      }

      checkAssignment(services.getTypeAtLocation(node), node.value, node);
    }

    function getHeritageMemberTypes(
      node: TSESTree.AccessorProperty | TSESTree.PropertyDefinition,
    ) {
      const memberName = getStaticMemberAccessValue(node, context);
      if (typeof memberName !== 'string') {
        return [];
      }

      const classNode = services.esTreeNodeToTSNodeMap.get(node).parent;

      return (classNode.heritageClauses ?? []).flatMap(heritageClause =>
        heritageClause.types.flatMap(heritageType => {
          const memberSymbol = checker
            .getTypeAtLocation(heritageType)
            .getProperty(memberName);

          return memberSymbol ? [checker.getTypeOfSymbol(memberSymbol)] : [];
        }),
      );
    }

    function checkMutation(
      targetNode: TSESTree.Expression,
      reportingNode: TSESTree.Node,
    ) {
      const targetType = services.getTypeAtLocation(targetNode);

      if (
        getEnumTypes(checker, getConstraintType(checker, targetType)).length > 0
      ) {
        report(reportingNode, 'unsafeEnumMutation', [targetType]);
      }
    }

    function checkReturn(
      returnNode: TSESTree.Expression,
      reportingNode: TSESTree.Node,
    ) {
      const functionNode = getParentFunctionNode(returnNode);
      if (functionNode == null) {
        return;
      }

      const signature = nullThrows(
        checker.getSignatureFromDeclaration(
          services.esTreeNodeToTSNodeMap.get(functionNode),
        ),
        'Expected the function to have a signature.',
      );

      let receiverType: ts.Type | undefined = signature.getReturnType();
      let senderType: ts.Type | undefined =
        services.getTypeAtLocation(returnNode);

      if (functionNode.async) {
        receiverType = checker.getAwaitedType(receiverType);
        senderType = checker.getAwaitedType(senderType);
      }

      if (receiverType && senderType) {
        checkAssignment(
          receiverType,
          returnNode,
          reportingNode,
          'unsafeEnumReturn',
          senderType,
        );
      }
    }

    function checkTypeAssertion(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ) {
      checkAssignment(
        services.getTypeAtLocation(node.typeAnnotation),
        node.expression,
        node,
        'unsafeEnumAssertion',
      );
    }

    return {
      'AccessorProperty[value != null], PropertyDefinition[value != null]':
        checkClassMember,
      ArrayExpression(node) {
        if (checkedNodes.has(node)) {
          return;
        }

        for (const element of node.elements.filter(
          element => element != null,
        )) {
          const receiverType = getContextualType(element);
          if (receiverType != null) {
            checkAssignment(receiverType, element, element);
          }
        }
      },
      'ArrowFunctionExpression[body.type != "BlockStatement"]'(
        node: TSESTree.ArrowFunctionExpression & { body: TSESTree.Expression },
      ) {
        checkReturn(node.body, node.body);
      },
      AssignmentExpression(node) {
        if (assigningOperators.has(node.operator)) {
          checkAssignment(
            services.getTypeAtLocation(node.left),
            node.right,
            node,
          );
        } else {
          checkMutation(node.left, node);
        }
      },
      AssignmentPattern(node) {
        checkAssignment(
          services.getTypeAtLocation(node.left),
          node.right,
          node,
        );
      },
      'CallExpression, NewExpression'(
        node: TSESTree.CallExpression | TSESTree.NewExpression,
      ) {
        checkArguments(node, node.arguments);
      },
      'JSXAttribute > JSXExpressionContainer > :not(JSXEmptyExpression)'(
        node: TSESTree.Expression,
      ) {
        const receiverType = getContextualType(node);
        if (receiverType != null) {
          checkAssignment(receiverType, node, node);
        }
      },
      'MemberExpression[computed = true]'(
        node: TSESTree.MemberExpressionComputedName,
      ) {
        const receiverTypes =
          checker
            .getSymbolAtLocation(
              services.esTreeNodeToTSNodeMap.get(node).expression,
            )
            ?.declarations?.flatMap(declaration =>
              getMappedKeyConstraintTypes(checker, declaration),
            ) ?? [];
        if (receiverTypes.length === 0) {
          return;
        }

        const senderType = services.getTypeAtLocation(node.property);
        if (
          receiverTypes.every(
            receiverType =>
              hasDeepEnumAssignmentMismatch(
                checker,
                senderType,
                receiverType,
              ) || !checker.isTypeAssignableTo(senderType, receiverType),
          )
        ) {
          report(node.property, 'unsafeEnumAccess', receiverTypes);
        }
      },
      ObjectExpression(node) {
        if (checkedNodes.has(node)) {
          return;
        }

        for (const property of node.properties) {
          const [receiverNode, senderNode] =
            property.type === AST_NODE_TYPES.SpreadElement
              ? [node, property.argument]
              : [property.value, property.value];

          const receiverType = getContextualType(receiverNode);
          if (receiverType != null) {
            checkAssignment(receiverType, senderNode, property);
          }
        }
      },
      ReturnStatement(node) {
        if (node.argument) {
          checkReturn(node.argument, node);
        }
      },
      TaggedTemplateExpression(node) {
        checkArguments(node, node.quasi.expressions);
      },
      TSAsExpression: checkTypeAssertion,
      TSTypeAssertion: checkTypeAssertion,
      UpdateExpression(node) {
        checkMutation(node.argument, node);
      },
      'VariableDeclarator[init != null]'(
        node: TSESTree.VariableDeclarator & { init: TSESTree.Expression },
      ) {
        checkAssignment(services.getTypeAtLocation(node.id), node.init, node);
      },
    };
  },
});

function getConstraintType(checker: ts.TypeChecker, type: ts.Type) {
  return checker.getBaseConstraintOfType(type) ?? type;
}

function getTypeArguments(checker: ts.TypeChecker, type: ts.Type) {
  return tsutils.isTypeReference(type) ? checker.getTypeArguments(type) : [];
}

function hasDeepEnumAssignmentMismatch(
  checker: ts.TypeChecker,
  senderType: ts.Type,
  receiverType: ts.Type,
  visited = new Map<ts.Type, Set<ts.Type>>(),
): boolean {
  const constrainedSenderType = getConstraintType(checker, senderType);
  const constrainedReceiverType = getConstraintType(checker, receiverType);

  // Recursive types would otherwise be visited endlessly.
  let visitedReceiverTypes = visited.get(constrainedSenderType);
  if (visitedReceiverTypes == null) {
    visitedReceiverTypes = new Set();
    visited.set(constrainedSenderType, visitedReceiverTypes);
  } else if (visitedReceiverTypes.has(constrainedReceiverType)) {
    return false;
  }
  visitedReceiverTypes.add(constrainedReceiverType);

  if (
    isMismatchedEnumAssignmentTypes(
      checker,
      constrainedSenderType,
      constrainedReceiverType,
    )
  ) {
    return true;
  }

  // Set<number> -> Set<Fruit>
  const senderTypeArguments = getTypeArguments(checker, constrainedSenderType);
  const receiverTypeArguments = getTypeArguments(
    checker,
    constrainedReceiverType,
  );
  if (
    senderTypeArguments.length === receiverTypeArguments.length &&
    senderTypeArguments.some((senderTypeArgument, index) =>
      hasDeepEnumAssignmentMismatch(
        checker,
        senderTypeArgument,
        receiverTypeArguments[index],
        visited,
      ),
    )
  ) {
    return true;
  }

  // [number, Fruit] -> Fruit[]
  const senderElementType = constrainedSenderType.getNumberIndexType();
  const receiverElementType = constrainedReceiverType.getNumberIndexType();
  if (
    senderElementType &&
    receiverElementType &&
    hasDeepEnumAssignmentMismatch(
      checker,
      senderElementType,
      receiverElementType,
      visited,
    )
  ) {
    return true;
  }

  // { fruit: number } -> { fruit: Fruit }
  return constrainedReceiverType.getProperties().some(receiverProperty => {
    const senderProperty = constrainedSenderType.getProperty(
      receiverProperty.name,
    );

    return (
      senderProperty != null &&
      hasDeepEnumAssignmentMismatch(
        checker,
        checker.getTypeOfSymbol(senderProperty),
        checker.getTypeOfSymbol(receiverProperty),
        visited,
      )
    );
  });
}

function getMappedKeyConstraintTypes(
  checker: ts.TypeChecker,
  declaration: ts.Declaration,
) {
  if (
    !(
      ts.isGetAccessorDeclaration(declaration) ||
      ts.isParameter(declaration) ||
      ts.isPropertyDeclaration(declaration) ||
      ts.isPropertySignature(declaration) ||
      ts.isVariableDeclaration(declaration)
    ) ||
    declaration.type == null
  ) {
    return [];
  }

  const typeNode = declaration.type;

  if (ts.isMappedTypeNode(typeNode)) {
    return [
      checker.getTypeFromTypeNode(
        nullThrows(
          typeNode.typeParameter.constraint,
          'Expected the mapped type parameter to have a constraint.',
        ),
      ),
    ];
  }

  if (ts.isTypeLiteralNode(typeNode)) {
    return typeNode.members.flatMap(member => {
      const name = ts.getNameOfDeclaration(member);

      return name && ts.isComputedPropertyName(name)
        ? [checker.getTypeAtLocation(name.expression)]
        : [];
    });
  }

  return [];
}

function describeEnumTypes(checker: ts.TypeChecker, types: readonly ts.Type[]) {
  const enumNames = new Set<string>();
  const visited = new Set<ts.Type>();

  function visit(type: ts.Type) {
    const constrainedType = getConstraintType(checker, type);
    if (visited.has(constrainedType)) {
      return;
    }
    visited.add(constrainedType);

    for (const enumType of getEnumTypes(checker, constrainedType)) {
      enumNames.add(checker.typeToString(enumType));
    }

    for (const typeArgument of getTypeArguments(checker, constrainedType)) {
      visit(typeArgument);
    }

    const elementType = constrainedType.getNumberIndexType();
    if (elementType) {
      visit(elementType);
    }

    for (const property of constrainedType.getProperties()) {
      visit(checker.getTypeOfSymbol(property));
    }
  }

  types.forEach(visit);

  return [...enumNames]
    .sort()
    .map(enumName => `'${enumName}'`)
    .join(', ');
}

function isMismatchedEnumAssignmentTypes(
  checker: ts.TypeChecker,
  senderType: ts.Type,
  receiverType: ts.Type,
) {
  const receiverEnumTypes = getEnumTypes(checker, receiverType);
  const receiverTypeParts = tsutils.unionConstituents(receiverType);
  const receiverEnumValueTypes = new Set(
    receiverTypeParts.map(getEnumValueType),
  );
  const receiverNonEnumParts = receiverTypeParts.filter(
    receiverTypePart => getEnumTypes(checker, receiverTypePart).length === 0,
  );

  return tsutils
    .unionConstituents(senderType)
    .some(
      senderTypePart =>
        ((receiverEnumValueTypes.has(ts.TypeFlags.Number) &&
          isNumberLike(senderTypePart)) ||
          (receiverEnumValueTypes.has(ts.TypeFlags.String) &&
            isStringLike(senderTypePart))) &&
        !hasSharedEnumType(checker, senderTypePart, receiverEnumTypes) &&
        !receiverNonEnumParts.some(receiverTypePart =>
          checker.isTypeAssignableTo(senderTypePart, receiverTypePart),
        ),
    );
}

function hasSharedEnumType(
  checker: ts.TypeChecker,
  type: ts.Type,
  expectedEnumTypes: readonly ts.Type[],
) {
  const typeEnumTypes = new Set(getEnumTypes(checker, type));

  return expectedEnumTypes.some(expectedEnumType =>
    typeEnumTypes.has(expectedEnumType),
  );
}
