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
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
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

      if (!node.computed && node.property.type === AST_NODE_TYPES.Identifier) {
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

    /**
     * Whether `node` reads a parameter of `constructorNode` that has not been
     * written to before `assignment`, so it still holds the value that the
     * parameter property assigned.
     */
    function isUnchangedConstructorParameter(
      node: TSESTree.Identifier,
      constructorNode: TSESTree.FunctionExpression,
      assignment: TSESTree.AssignmentExpression,
    ): boolean {
      const variable = ASTUtils.findVariable(
        context.sourceCode.getScope(node),
        node,
      );
      const definition = variable?.defs.at(0);

      return (
        definition?.type === DefinitionType.Parameter &&
        definition.node === constructorNode &&
        !variable?.references.some(
          reference =>
            reference.isWrite() &&
            !reference.init &&
            reference.identifier.range[0] < assignment.range[0],
        )
      );
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
            node.parameter.left.name === name))
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
        node.parent.type === AST_NODE_TYPES.CallExpression &&
        node.parent.callee === node
      );
    }

    /**
     * Finds the constructor that runs `node` immediately: either directly or
     * through arrow function IIFEs.
     */
    function findImmediateConstructor(
      node: TSESTree.Node,
    ): TSESTree.FunctionExpression | undefined {
      let functionNode = findParentFunction(node);
      if (functionNode && isArrowIIFE(functionNode)) {
        functionNode = findParentFunction(functionNode.parent);
      }

      return isConstructorFunctionExpression(functionNode)
        ? functionNode
        : undefined;
    }

    /**
     * Whether `node` is written by something other than an assignment
     * expression, such as `this.foo++` or `[this.foo] = values`.
     */
    function isNonAssignmentWriteTarget(node: TSESTree.MemberExpression) {
      const { parent } = node;
      switch (parent.type) {
        case AST_NODE_TYPES.ArrayPattern:
        case AST_NODE_TYPES.RestElement:
        case AST_NODE_TYPES.UpdateExpression:
          return true;
        case AST_NODE_TYPES.AssignmentPattern:
        case AST_NODE_TYPES.ForInStatement:
        case AST_NODE_TYPES.ForOfStatement:
          return parent.left === node;
        case AST_NODE_TYPES.Property:
          return (
            parent.value === node &&
            parent.parent.type === AST_NODE_TYPES.ObjectPattern
          );
      }
      return false;
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
        const constructorNode = findImmediateConstructor(node);
        const leftName = getPropertyName(node.left);

        if (!constructorNode || !leftName) {
          return;
        }

        const { assignedBeforeUnnecessary, unnecessaryAssignments } =
          nullThrows(
            reportInfoStack.at(reportInfoStack.length - 1),
            'The top of stack should exist',
          );

        const rightId = getIdentifier(node.right);

        if (
          UNNECESSARY_OPERATORS.has(node.operator) &&
          leftName === rightId?.name &&
          isUnchangedConstructorParameter(rightId, constructorNode, node) &&
          constructorNode.params.some(param =>
            isParameterPropertyWithName(param, leftName),
          )
        ) {
          if (!assignedBeforeUnnecessary.has(leftName)) {
            unnecessaryAssignments.push({
              name: leftName,
              node,
            });
          }
          return;
        }

        assignedBeforeUnnecessary.add(leftName);
      },
      "MethodDefinition[kind='constructor'] > FunctionExpression MemberExpression"(
        node: TSESTree.MemberExpression,
      ): void {
        const name = getPropertyName(node);

        if (
          name &&
          isNonAssignmentWriteTarget(node) &&
          findImmediateConstructor(node)
        ) {
          nullThrows(
            reportInfoStack.at(-1),
            'The top of stack should exist',
          ).assignedBeforeUnnecessary.add(name);
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
        // An arrow passed as an argument (`bar = list.map(() => ...)`) counts
        // too, since it may run before the constructor body.
        if (
          functionNode &&
          !(
            functionNode.type === AST_NODE_TYPES.ArrowFunctionExpression &&
            functionNode.parent.type === AST_NODE_TYPES.CallExpression &&
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
