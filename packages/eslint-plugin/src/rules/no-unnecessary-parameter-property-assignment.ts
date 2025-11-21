import type { TSESTree } from '@typescript-eslint/utils';

import { DefinitionType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import { createRule, getStaticStringValue, nullThrows } from '../util';

const UNNECESSARY_OPERATORS = new Set(['??=', '&&=', '=', '||=']);

export default createRule({
  name: 'no-unnecessary-parameter-property-assignment',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow unnecessary assignment of constructor property parameter',
    },
    messages: {
      unnecessaryAssign:
        'This assignment is unnecessary since it is already assigned by a parameter property.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const reportInfoStack: {
      assignedBeforeConstructor: Set<string>;
      assignedBeforeUnnecessary: Set<string>;
      unnecessaryAssignments: {
        name: string;
        node: TSESTree.AssignmentExpression;
      }[];
    }[] = [];

    function isThisMemberExpression(
      node: TSESTree.Node,
    ): node is TSESTree.MemberExpression {
      return (
        node.type === AST_NODE_TYPES.MemberExpression &&
        node.object.type === AST_NODE_TYPES.ThisExpression
      );
    }

    function getPropertyName(node: TSESTree.Node): string | null {
      if (!isThisMemberExpression(node)) {
        return null;
      }

      if (node.property.type === AST_NODE_TYPES.Identifier) {
        return node.property.name;
      }
      if (node.computed) {
        return getStaticStringValue(node.property);
      }
      return null;
    }

    function findParentFunction(
      node: TSESTree.Node | undefined,
    ):
      | TSESTree.ArrowFunctionExpression
      | TSESTree.FunctionDeclaration
      | TSESTree.FunctionExpression
      | undefined {
      if (
        !node ||
        node.type === AST_NODE_TYPES.FunctionDeclaration ||
        node.type === AST_NODE_TYPES.FunctionExpression ||
        node.type === AST_NODE_TYPES.ArrowFunctionExpression
      ) {
        return node;
      }
      return findParentFunction(node.parent);
    }

    function findParentPropertyDefinition(
      node: TSESTree.Node | undefined,
    ): TSESTree.PropertyDefinition | undefined {
      if (!node || node.type === AST_NODE_TYPES.PropertyDefinition) {
        return node;
      }
      return findParentPropertyDefinition(node.parent);
    }

    function isConstructorFunctionExpression(
      node: TSESTree.Node | undefined,
    ): node is TSESTree.FunctionExpression {
      return (
        node?.type === AST_NODE_TYPES.FunctionExpression &&
        ASTUtils.isConstructor(node.parent)
      );
    }

    function isReferenceFromParameter(node: TSESTree.Identifier): boolean {
      const scope = context.sourceCode.getScope(node);

      const rightRef = scope.references.find(
        ref => ref.identifier.name === node.name,
      );
      return rightRef?.resolved?.defs.at(0)?.type === DefinitionType.Parameter;
    }

    function isParameterPropertyWithName(
      node: TSESTree.Parameter,
      name: string,
    ): boolean {
      return (
        node.type === AST_NODE_TYPES.TSParameterProperty &&
        ((node.parameter.type === AST_NODE_TYPES.Identifier && // constructor (public foo) {}
          node.parameter.name === name) ||
          (node.parameter.type === AST_NODE_TYPES.AssignmentPattern && // constructor (public foo = 1) {}
            (node.parameter.left as TSESTree.Identifier).name === name))
      );
    }

    function getIdentifier(node: TSESTree.Node): TSESTree.Identifier | null {
      if (node.type === AST_NODE_TYPES.Identifier) {
        return node;
      }
      if (
        node.type === AST_NODE_TYPES.TSAsExpression ||
        node.type === AST_NODE_TYPES.TSNonNullExpression
      ) {
        return getIdentifier(node.expression);
      }
      return null;
    }

    function isArrowIIFE(node: TSESTree.Node): boolean {
      return (
        node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        node.parent.type === AST_NODE_TYPES.CallExpression
      );
    }

    return {
      ClassBody(): void {
        reportInfoStack.push({
          assignedBeforeConstructor: new Set(),
          assignedBeforeUnnecessary: new Set(),
          unnecessaryAssignments: [],
        });
      },
      'ClassBody:exit'(): void {
        const { assignedBeforeConstructor, unnecessaryAssignments } =
          nullThrows(reportInfoStack.pop(), 'The top stack should exist');
        unnecessaryAssignments.forEach(({ name, node }) => {
          if (assignedBeforeConstructor.has(name)) {
            return;
          }
          context.report({
            node,
            messageId: 'unnecessaryAssign',
          });
        });
      },
      "MethodDefinition[kind='constructor'] > FunctionExpression AssignmentExpression"(
        node: TSESTree.AssignmentExpression,
      ): void {
        const leftName = getPropertyName(node.left);

        if (!leftName) {
          return;
        }

        let functionNode = findParentFunction(node);
        if (functionNode && isArrowIIFE(functionNode)) {
          functionNode = findParentFunction(functionNode.parent);
        }

        if (!isConstructorFunctionExpression(functionNode)) {
          return;
        }

        const { assignedBeforeUnnecessary, unnecessaryAssignments } =
          nullThrows(
            reportInfoStack.at(reportInfoStack.length - 1),
            'The top of stack should exist',
          );

        if (!UNNECESSARY_OPERATORS.has(node.operator)) {
          assignedBeforeUnnecessary.add(leftName);
          return;
        }

        const rightId = getIdentifier(node.right);

        if (leftName !== rightId?.name || !isReferenceFromParameter(rightId)) {
          return;
        }

        const hasParameterProperty = functionNode.params.some(param =>
          isParameterPropertyWithName(param, rightId.name),
        );

        if (hasParameterProperty && !assignedBeforeUnnecessary.has(leftName)) {
          unnecessaryAssignments.push({
            name: leftName,
            node,
          });
        }
      },
      'PropertyDefinition AssignmentExpression'(
        node: TSESTree.AssignmentExpression,
      ): void {
        const name = getPropertyName(node.left);

        if (!name) {
          return;
        }

        const functionNode = findParentFunction(node);
        if (
          functionNode &&
          !(
            isArrowIIFE(functionNode) &&
            findParentPropertyDefinition(node)?.value === functionNode.parent
          )
        ) {
          return;
        }

        const { assignedBeforeConstructor } = nullThrows(
          reportInfoStack.at(-1),
          'The top stack should exist',
        );
        assignedBeforeConstructor.add(name);
      },
    };
  },
});
