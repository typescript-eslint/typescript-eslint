import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  FunctionSignature,
  getContextualType,
  getParserServices,
  getStaticMemberAccessValue,
  MakeRequired,
} from '../util';
import { getParentFunctionNode } from '../util/getParentFunctionNode';
import {
  getEnumTypes,
  isMismatchedEnumAssignmentTypes,
} from './enum-utils/shared';

const bitwiseBinaryOperators = new Set(['&', '<<', '>>', '>>>', '^', '|']);

export default createRule({
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
      unsafeEnumReturn:
        'The value returned here does not have a shared enum type with the expected enum {{enumNames}}.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const suppressedNestedReportRoots = new WeakSet<TSESTree.Node>();

    function hasSharedEnumType(
      type: ts.Type,
      expectedEnumTypes: readonly ts.Type[],
    ) {
      const typeEnumTypes = new Set(getEnumTypes(checker, type));

      for (const expectedEnumType of expectedEnumTypes) {
        if (typeEnumTypes.has(expectedEnumType)) {
          return true;
        }
      }

      return false;
    }

    function getTsExpression(node: TSESTree.Expression): ts.Expression {
      return services.esTreeNodeToTSNodeMap.get(node) as ts.Expression;
    }

    function getContextualTypeForExpression(node: TSESTree.Expression) {
      return getContextualType(checker, getTsExpression(node));
    }

    function isTypeReference(type: ts.Type): type is ts.TypeReference {
      return 'target' in type;
    }

    function getTypeArguments(type: ts.Type): readonly ts.Type[] {
      if (!isTypeReference(type)) {
        return [];
      }

      return checker.getTypeArguments(type);
    }

    function isSafeEnumBitwiseExpression(
      expression: TSESTree.Expression,
      receiverType: ts.Type,
    ) {
      const receiverEnumTypes = getEnumTypes(checker, receiverType);
      if (receiverEnumTypes.length === 0) {
        return false;
      }

      function unwrapTsExpression(node: ts.Expression) {
        if (ts.isParenthesizedExpression(node)) {
          return unwrapTsExpression(node.expression);
        }

        if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
          return unwrapTsExpression(node.expression);
        }

        return node;
      }

      function isBitwiseOperand(node: ts.Expression): boolean {
        const unwrappedNode = unwrapTsExpression(node);
        if (ts.isBinaryExpression(unwrappedNode)) {
          const operator = ts.tokenToString(unwrappedNode.operatorToken.kind);
          if (!operator || !bitwiseBinaryOperators.has(operator)) {
            return false;
          }

          return (
            isBitwiseOperand(unwrappedNode.left) &&
            isBitwiseOperand(unwrappedNode.right)
          );
        }

        return hasSharedEnumType(
          checker.getTypeAtLocation(unwrappedNode),
          receiverEnumTypes,
        );
      }

      const unwrappedExpression = unwrapTsExpression(
        getTsExpression(expression),
      );
      if (!ts.isBinaryExpression(unwrappedExpression)) {
        return false;
      }

      const operator = ts.tokenToString(unwrappedExpression.operatorToken.kind);
      if (!operator || !bitwiseBinaryOperators.has(operator)) {
        return false;
      }

      return (
        isBitwiseOperand(unwrappedExpression.left) &&
        isBitwiseOperand(unwrappedExpression.right)
      );
    }

    function getImplementedMemberTypes(
      node: TSESTree.AccessorProperty | TSESTree.PropertyDefinition,
    ) {
      const memberName = getStaticMemberAccessValue(node, context);
      if (typeof memberName !== 'string') {
        return [];
      }

      const tsMemberNode = services.esTreeNodeToTSNodeMap.get(node);
      const classNode = tsMemberNode.parent;

      const implementedTypes = [];
      for (const heritageClause of classNode.heritageClauses ?? []) {
        for (const heritageType of heritageClause.types) {
          const implementedType = checker.getTypeAtLocation(heritageType);
          const memberSymbol = implementedType.getProperty(memberName);
          if (!memberSymbol) {
            continue;
          }

          implementedTypes.push(checker.getTypeOfSymbol(memberSymbol));
        }
      }

      return implementedTypes;
    }

    function hasSuppressedNestedReportAncestor(node: TSESTree.Node) {
      let current: TSESTree.Node | undefined = node;

      while (current) {
        if (suppressedNestedReportRoots.has(current)) {
          return true;
        }

        current = current.parent;
      }

      return false;
    }

    function formatEnumNames(enumNames: readonly string[]) {
      return enumNames.map(enumName => `'${enumName}'`).join(', ');
    }

    function getExpectedEnumNames(type: ts.Type) {
      const visited = new Set<ts.Type>();
      const enumNames = new Set<string>();

      function visit(currentType: ts.Type) {
        const constrainedType = getConstraintType(currentType);

        for (const enumType of getEnumTypes(checker, constrainedType)) {
          enumNames.add(checker.typeToString(enumType));
        }

        if (visited.has(constrainedType)) {
          return;
        }
        visited.add(constrainedType);

        for (const typeArgument of getTypeArguments(constrainedType)) {
          visit(typeArgument);
        }

        const indexType = checker.getIndexTypeOfType(
          constrainedType,
          ts.IndexKind.Number,
        );
        if (indexType) {
          visit(indexType);
        }

        for (const property of constrainedType.getProperties()) {
          visit(checker.getTypeOfSymbol(property));
        }
      }

      visit(type);

      return [...enumNames].sort();
    }

    function getReportDataForTypes(types: readonly ts.Type[]) {
      const enumNames = new Set<string>();

      for (const type of types) {
        for (const enumName of getExpectedEnumNames(type)) {
          enumNames.add(enumName);
        }
      }

      return {
        enumNames: formatEnumNames([...enumNames].sort()),
      };
    }

    function reportWithSuppressedNestedRoots(
      nodeToSuppress: TSESTree.Node,
      reportingNode: TSESTree.Node,
      messageId:
        | 'unsafeEnumAccess'
        | 'unsafeEnumArgument'
        | 'unsafeEnumAssertion'
        | 'unsafeEnumAssignment'
        | 'unsafeEnumReturn',
      receiverTypes: readonly ts.Type[],
    ) {
      suppressedNestedReportRoots.add(nodeToSuppress);
      context.report({
        node: reportingNode,
        messageId,
        data: getReportDataForTypes(receiverTypes),
      });
    }

    function checkImplementedMemberAssignment(
      node: TSESTree.AccessorProperty | TSESTree.PropertyDefinition,
      valueNode: TSESTree.Expression,
      reportingNode: TSESTree.Node,
    ) {
      const implementedMemberTypes = getImplementedMemberTypes(node);
      if (implementedMemberTypes.length === 0) {
        return false;
      }

      const senderType = services.getTypeAtLocation(valueNode);

      for (const receiverType of implementedMemberTypes) {
        if (
          !hasDeepEnumAssignmentMismatch(senderType, receiverType) ||
          isSafeEnumBitwiseExpression(valueNode, receiverType)
        ) {
          return false;
        }
      }

      reportWithSuppressedNestedRoots(
        valueNode,
        reportingNode,
        'unsafeEnumAssignment',
        implementedMemberTypes,
      );

      return true;
    }

    function checkAssignmentWithReceiverType(
      receiverType: ts.Type,
      senderNode: TSESTree.Expression,
      reportingNode: TSESTree.Node,
    ) {
      const senderType = services.getTypeAtLocation(senderNode);

      if (senderNode.type === AST_NODE_TYPES.ObjectExpression) {
        return false;
      }

      if (senderNode.type === AST_NODE_TYPES.ArrayExpression) {
        const constrainedReceiverType = getConstraintType(receiverType);

        if (
          !isTypeParameterType(receiverType) &&
          (checker.isArrayType(constrainedReceiverType) ||
            checker.isTupleType(constrainedReceiverType))
        ) {
          return false;
        }
      }

      if (hasDeepEnumAssignmentMismatch(senderType, receiverType)) {
        if (isSafeEnumBitwiseExpression(senderNode, receiverType)) {
          return false;
        }

        reportWithSuppressedNestedRoots(
          senderNode,
          reportingNode,
          'unsafeEnumAssignment',
          [receiverType],
        );
        return true;
      }

      return false;
    }

    function checkAssignment(
      receiverNode: TSESTree.Node,
      senderNode: TSESTree.Expression,
      reportingNode: TSESTree.Node,
    ) {
      return checkAssignmentWithReceiverType(
        services.getTypeAtLocation(receiverNode),
        senderNode,
        reportingNode,
      );
    }

    function checkContextualAssignment(
      receiverNode: TSESTree.Node,
      senderNode: TSESTree.Expression,
      reportingNode: TSESTree.Node,
      contextualReceiverNode: TSESTree.Expression,
    ) {
      return checkAssignmentWithReceiverType(
        getContextualTypeForExpression(contextualReceiverNode) ??
          services.getTypeAtLocation(receiverNode),
        senderNode,
        reportingNode,
      );
    }

    function getConstraintType(type: ts.Type) {
      return checker.getBaseConstraintOfType(type) ?? type;
    }

    function isTypeParameterType(type: ts.Type) {
      return tsutils.isTypeFlagSet(type, ts.TypeFlags.TypeParameter);
    }

    function getEffectiveArgumentReceiverType(
      _argument: TSESTree.Expression,
      parameterType: ts.Type,
    ) {
      return parameterType;
    }

    function hasDeepEnumAssignmentMismatch(
      senderType: ts.Type,
      receiverType: ts.Type,
      visited = new Set<string>(),
    ) {
      const constrainedSenderType = getConstraintType(senderType);
      const constrainedReceiverType = getConstraintType(receiverType);

      const key = `${checker.typeToString(constrainedSenderType)}=>${checker.typeToString(constrainedReceiverType)}`;
      if (visited.has(key)) {
        return false;
      }
      visited.add(key);

      if (
        isMismatchedEnumAssignmentTypes(
          checker,
          constrainedSenderType,
          constrainedReceiverType,
        )
      ) {
        return true;
      }

      const senderTypeArguments = getTypeArguments(constrainedSenderType);
      const receiverTypeArguments = getTypeArguments(constrainedReceiverType);
      if (
        senderTypeArguments.length > 0 &&
        senderTypeArguments.length === receiverTypeArguments.length
      ) {
        for (let index = 0; index < receiverTypeArguments.length; index += 1) {
          if (
            hasDeepEnumAssignmentMismatch(
              senderTypeArguments[index],
              receiverTypeArguments[index],
              visited,
            )
          ) {
            return true;
          }
        }
      }

      const receiverElementType = checker.getIndexTypeOfType(
        constrainedReceiverType,
        ts.IndexKind.Number,
      );
      if (
        receiverElementType &&
        checker.isTupleType(constrainedSenderType) &&
        checker
          .getTypeArguments(constrainedSenderType)
          .some(elementType =>
            hasDeepEnumAssignmentMismatch(
              elementType,
              receiverElementType,
              visited,
            ),
          )
      ) {
        return true;
      }

      for (const receiverProperty of constrainedReceiverType.getProperties()) {
        const senderProperty = constrainedSenderType.getProperty(
          receiverProperty.name,
        );
        if (!senderProperty) {
          continue;
        }

        if (
          hasDeepEnumAssignmentMismatch(
            checker.getTypeOfSymbol(senderProperty),
            checker.getTypeOfSymbol(receiverProperty),
            visited,
          )
        ) {
          return true;
        }
      }

      return false;
    }

    function checkArrayDestructurePattern(
      receiverNode: TSESTree.ArrayPattern,
      senderNode: TSESTree.Expression,
    ) {
      const receiverType = services.getTypeAtLocation(receiverNode);
      if (
        !checker.isTupleType(receiverType) &&
        !checker.isArrayType(receiverType)
      ) {
        return false;
      }

      const senderType = services.getTypeAtLocation(senderNode);
      const senderElementTypes = checker.isTupleType(senderType)
        ? checker.getTypeArguments(senderType)
        : [];
      const receiverElementTypes = checker.isTupleType(receiverType)
        ? checker.getTypeArguments(receiverType)
        : [];
      const receiverArrayElementType = checker.getIndexTypeOfType(
        receiverType,
        ts.IndexKind.Number,
      );

      let foundMismatch = false;
      for (let index = 0; index < receiverNode.elements.length; index += 1) {
        const receiverElement = receiverNode.elements[index];
        if (
          !receiverElement ||
          receiverElement.type === AST_NODE_TYPES.RestElement
        ) {
          continue;
        }

        const receiverElementType =
          receiverElementTypes[index] ?? receiverArrayElementType;

        const senderElementType =
          senderElementTypes[index] ??
          checker.getIndexTypeOfType(senderType, ts.IndexKind.Number);

        if (
          !hasDeepEnumAssignmentMismatch(senderElementType, receiverElementType)
        ) {
          continue;
        }

        context.report({
          node: receiverElement,
          messageId: 'unsafeEnumAssignment',
          data: getReportDataForTypes([receiverElementType]),
        });
        foundMismatch = true;
      }

      return foundMismatch;
    }

    function checkObjectDestructurePattern(
      receiverNode: TSESTree.ObjectPattern,
      senderNode: TSESTree.Expression,
    ) {
      const receiverType = services.getTypeAtLocation(receiverNode);
      const senderType = services.getTypeAtLocation(senderNode);

      let foundMismatch = false;
      for (const property of receiverNode.properties) {
        if (
          property.type !== AST_NODE_TYPES.Property ||
          property.value.type === AST_NODE_TYPES.AssignmentPattern
        ) {
          continue;
        }

        const key = getStaticMemberAccessValue(property, context);
        if (typeof key !== 'string') {
          continue;
        }

        const senderProperty = senderType.getProperty(key);
        const receiverProperty = receiverType.getProperty(key);
        if (!senderProperty || !receiverProperty) {
          continue;
        }

        const senderPropertyType = checker.getTypeOfSymbol(senderProperty);
        const receiverPropertyType = checker.getTypeOfSymbol(receiverProperty);

        if (
          !hasDeepEnumAssignmentMismatch(
            senderPropertyType,
            receiverPropertyType,
          )
        ) {
          continue;
        }

        context.report({
          node: property.value,
          messageId: 'unsafeEnumAssignment',
          data: getReportDataForTypes([receiverPropertyType]),
        });
        foundMismatch = true;
      }

      return foundMismatch;
    }

    function checkArguments(
      args: TSESTree.CallExpressionArgument[] | TSESTree.Expression[],
      node:
        | TSESTree.CallExpression
        | TSESTree.NewExpression
        | TSESTree.TaggedTemplateExpression,
    ) {
      if (args.length === 0) {
        return;
      }

      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const signature = FunctionSignature.create(checker, tsNode, {
        useDeclaredParameterTypes: true,
      })!;

      if (node.type === AST_NODE_TYPES.TaggedTemplateExpression) {
        signature.getNextParameterType();
      }

      for (const argument of args) {
        if (argument.type === AST_NODE_TYPES.SpreadElement) {
          const spreadArgType = services.getTypeAtLocation(argument.argument);
          if (checker.isTupleType(spreadArgType)) {
            const spreadTypeArguments = checker.getTypeArguments(spreadArgType);
            for (const tupleType of spreadTypeArguments) {
              const parameterType = signature.getNextParameterType();
              if (parameterType == null) {
                continue;
              }

              if (hasDeepEnumAssignmentMismatch(tupleType, parameterType)) {
                reportWithSuppressedNestedRoots(
                  argument,
                  argument,
                  'unsafeEnumArgument',
                  [parameterType],
                );
              }
            }

            if (spreadArgType.target.combinedFlags & ts.ElementFlags.Variable) {
              signature.consumeRemainingArguments();
            }
          }

          continue;
        }

        const parameterType = signature.getNextParameterType();
        if (parameterType == null) {
          continue;
        }

        if (argument.type === AST_NODE_TYPES.ArrayExpression) {
          const constrainedParameterType = getConstraintType(parameterType);

          if (
            !isTypeParameterType(parameterType) &&
            (checker.isArrayType(constrainedParameterType) ||
              checker.isTupleType(constrainedParameterType))
          ) {
            continue;
          }
        }

        const receiverType = getEffectiveArgumentReceiverType(
          argument,
          parameterType,
        );

        const argumentType = services.getTypeAtLocation(argument);
        if (
          hasDeepEnumAssignmentMismatch(argumentType, receiverType) &&
          !isSafeEnumBitwiseExpression(argument, receiverType)
        ) {
          reportWithSuppressedNestedRoots(
            argument,
            argument,
            'unsafeEnumArgument',
            [receiverType],
          );
        }
      }
    }

    function checkAssigningVariable(
      node: TSESTree.Node,
      assignee: TSESTree.Node,
      value: TSESTree.Expression,
    ) {
      switch (assignee.type) {
        case AST_NODE_TYPES.ArrayPattern:
          checkArrayDestructurePattern(assignee, value);
          return;
        case AST_NODE_TYPES.ObjectPattern:
          checkObjectDestructurePattern(assignee, value);
          return;
        default:
          checkAssignment(assignee, value, node);
          return;
      }
    }

    function checkReturn(
      returnNode: TSESTree.Expression,
      reportingNode: TSESTree.Node = returnNode,
    ) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const functionNode = getParentFunctionNode(returnNode)!;

      const functionTsNode = services.esTreeNodeToTSNodeMap.get(functionNode);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const signature = checker.getSignatureFromDeclaration(functionTsNode)!;

      const returnNodeType = services.getTypeAtLocation(returnNode);
      const senderType = functionNode.async
        ? checker.getAwaitedType(returnNodeType)
        : returnNodeType;
      if (!senderType) {
        return;
      }

      const signatureReturnType = signature.getReturnType();
      const receiverType = functionNode.async
        ? checker.getAwaitedType(signatureReturnType)
        : signatureReturnType;
      if (!receiverType) {
        return;
      }

      if (
        hasDeepEnumAssignmentMismatch(senderType, receiverType) &&
        !isSafeEnumBitwiseExpression(returnNode, receiverType)
      ) {
        reportWithSuppressedNestedRoots(
          returnNode,
          reportingNode,
          'unsafeEnumReturn',
          [receiverType],
        );
      }
    }

    function checkTypeAssertion(
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ) {
      const expressionType = services.getTypeAtLocation(node.expression);
      const assertedType = services.getTypeAtLocation(node.typeAnnotation);

      if (
        hasDeepEnumAssignmentMismatch(expressionType, assertedType) &&
        !isSafeEnumBitwiseExpression(node.expression, assertedType)
      ) {
        reportWithSuppressedNestedRoots(node, node, 'unsafeEnumAssertion', [
          assertedType,
        ]);
      }
    }

    function addMappedKeyConstraintTypesFromDeclarations(
      declaration: ts.Declaration,
    ): ts.Type[] {
      if (
        !ts.isParameter(declaration) &&
        !ts.isPropertyDeclaration(declaration) &&
        !ts.isPropertySignature(declaration) &&
        !ts.isVariableDeclaration(declaration)
      ) {
        return [];
      }

      if (!declaration.type) {
        return [];
      }

      if (ts.isMappedTypeNode(declaration.type)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const constraint = declaration.type.typeParameter.constraint!;
        return [checker.getTypeFromTypeNode(constraint)];
      }

      if (ts.isTypeLiteralNode(declaration.type)) {
        const receiverTypes: ts.Type[] = [];
        for (const member of declaration.type.members) {
          if (
            ts.isPropertySignature(member) &&
            ts.isComputedPropertyName(member.name)
          ) {
            receiverTypes.push(
              checker.getTypeAtLocation(member.name.expression),
            );
          }
        }

        return receiverTypes;
      }

      return [];
    }

    function isObjectPatternDestructureSource(
      objectExpression: TSESTree.ObjectExpression,
    ) {
      const objectExpressionParent = objectExpression.parent;

      return (
        (objectExpressionParent.type === AST_NODE_TYPES.VariableDeclarator &&
          objectExpressionParent.id.type === AST_NODE_TYPES.ObjectPattern &&
          objectExpressionParent.init === objectExpression) ||
        (objectExpressionParent.type === AST_NODE_TYPES.AssignmentExpression &&
          objectExpressionParent.left.type === AST_NODE_TYPES.ObjectPattern &&
          objectExpressionParent.right === objectExpression) ||
        (objectExpressionParent.type === AST_NODE_TYPES.AssignmentPattern &&
          objectExpressionParent.left.type === AST_NODE_TYPES.ObjectPattern &&
          objectExpressionParent.right === objectExpression)
      );
    }

    function isArrayPatternDestructureSource(node: TSESTree.ArrayExpression) {
      const parent = node.parent;

      return (
        (parent.type === AST_NODE_TYPES.VariableDeclarator &&
          parent.id.type === AST_NODE_TYPES.ArrayPattern &&
          parent.init === node) ||
        (parent.type === AST_NODE_TYPES.AssignmentExpression &&
          parent.left.type === AST_NODE_TYPES.ArrayPattern &&
          parent.right === node) ||
        (parent.type === AST_NODE_TYPES.AssignmentPattern &&
          parent.left.type === AST_NODE_TYPES.ArrayPattern &&
          parent.right === node)
      );
    }

    return {
      ':not(ObjectPattern) > Property'(
        node: TSESTree.Property & {
          parent: TSESTree.ObjectExpression;
          value: TSESTree.Expression;
        },
      ) {
        if (
          hasSuppressedNestedReportAncestor(node) ||
          isObjectPatternDestructureSource(node.parent)
        ) {
          return;
        }

        checkContextualAssignment(
          node.computed ? node.value : node.key,
          node.value,
          node,
          node.computed ? node.value : node.key,
        );
      },
      'AccessorProperty[value != null]'(
        node: { value: NonNullable<unknown> } & TSESTree.AccessorProperty,
      ) {
        if (checkImplementedMemberAssignment(node, node.value, node)) {
          return;
        }

        checkAssignment(node, node.value, node);
      },
      ArrayExpression(node) {
        if (
          hasSuppressedNestedReportAncestor(node) ||
          isArrayPatternDestructureSource(node)
        ) {
          return;
        }

        const contextualType = getContextualTypeForExpression(node);
        const constrainedContextualType = contextualType
          ? getConstraintType(contextualType)
          : undefined;
        if (
          !constrainedContextualType ||
          (!checker.isArrayType(constrainedContextualType) &&
            !checker.isTupleType(constrainedContextualType))
        ) {
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const arrayElementType = checker.getIndexTypeOfType(
          constrainedContextualType,
          ts.IndexKind.Number,
        )!;
        if (getEnumTypes(checker, arrayElementType).length === 0) {
          return;
        }

        for (const element of node.elements.filter(
          arrayElement =>
            arrayElement != null &&
            arrayElement.type !== AST_NODE_TYPES.SpreadElement,
        )) {
          const elementType = services.getTypeAtLocation(element);
          if (
            isMismatchedEnumAssignmentTypes(
              checker,
              elementType,
              arrayElementType,
            )
          ) {
            context.report({
              node: element,
              messageId: 'unsafeEnumAssignment',
              data: getReportDataForTypes([arrayElementType]),
            });
          }
        }
      },
      ArrowFunctionExpression(node) {
        if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
          checkReturn(node.body, node.body);
        }
      },
      'AssignmentExpression[operator = "="], AssignmentPattern'(
        node: TSESTree.AssignmentExpression | TSESTree.AssignmentPattern,
      ) {
        checkAssigningVariable(node, node.left, node.right);
      },
      'CallExpression, NewExpression'(
        node: TSESTree.CallExpression | TSESTree.NewExpression,
      ) {
        checkArguments(node.arguments, node);
      },
      'JSXAttribute[value != null]'(
        node: MakeRequired<TSESTree.JSXAttribute, 'value'>,
      ) {
        if (
          node.value.type !== AST_NODE_TYPES.JSXExpressionContainer ||
          node.value.expression.type === AST_NODE_TYPES.JSXEmptyExpression
        ) {
          return;
        }

        const receiverType = getContextualTypeForExpression(
          node.value.expression,
        );
        if (!receiverType) {
          return;
        }
        const senderType = services.getTypeAtLocation(node.value.expression);

        if (
          hasDeepEnumAssignmentMismatch(senderType, receiverType) &&
          !isSafeEnumBitwiseExpression(node.value.expression, receiverType)
        ) {
          reportWithSuppressedNestedRoots(
            node.value.expression,
            node.value.expression,
            'unsafeEnumAssignment',
            [receiverType],
          );
        }
      },
      'MemberExpression[computed = true]'(
        node: TSESTree.MemberExpression & { property: TSESTree.Expression },
      ) {
        const receiverTypes = [
          getContextualTypeForExpression(node.property),
        ].filter(type => type != null);

        const memberTsNode = services.esTreeNodeToTSNodeMap.get(node);
        for (const declaration of checker.getSymbolAtLocation(
          memberTsNode.expression,
        )?.declarations ?? []) {
          receiverTypes.push(
            ...addMappedKeyConstraintTypesFromDeclarations(declaration),
          );
        }

        if (receiverTypes.length === 0) {
          return;
        }

        const senderType = services.getTypeAtLocation(node.property);

        for (const receiverType of receiverTypes) {
          if (!hasDeepEnumAssignmentMismatch(senderType, receiverType)) {
            return;
          }
        }

        context.report({
          node: node.property,
          messageId: 'unsafeEnumAccess',
          data: getReportDataForTypes(receiverTypes),
        });
      },
      'PropertyDefinition[value != null]'(
        node: TSESTree.PropertyDefinition & { value: NonNullable<unknown> },
      ) {
        if (!checkImplementedMemberAssignment(node, node.value, node)) {
          checkAssignment(node, node.value, node);
        }
      },
      ReturnStatement(node) {
        if (node.argument) {
          checkReturn(node.argument, node);
        }
      },
      TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
        checkArguments(node.quasi.expressions, node);
      },
      TSAsExpression: checkTypeAssertion,
      TSTypeAssertion: checkTypeAssertion,
      'VariableDeclarator[init != null]'(
        node: TSESTree.VariableDeclarator & {
          init: NonNullable<TSESTree.VariableDeclarator['init']>;
        },
      ) {
        checkAssigningVariable(node, node.id, node.init);
      },
    };
  },
});
