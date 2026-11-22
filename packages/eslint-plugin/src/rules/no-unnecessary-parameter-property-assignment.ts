import type { ScopeVariable } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';

import { DefinitionType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import {
  createRule,
  getStaticStringValue,
  isAssignee,
  nullThrows,
} from '../util';

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
      /**
       * For each property written in the constructor, the earliest position
       * in the code that a write to it may run at.
       */
      earliestWrites: Map<string, number>;
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
     * Finds the constructor whose `this` a write in `node` changes: like
     * `findImmediateConstructor`, but through any arrow function, as each one
     * shares the constructor's `this`.
     */
    function findConstructorOfWrite(
      node: TSESTree.Node,
    ): TSESTree.FunctionExpression | undefined {
      let functionNode = findParentFunction(node);
      while (functionNode?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
        functionNode = findParentFunction(functionNode.parent);
      }

      return isConstructorFunctionExpression(functionNode)
        ? functionNode
        : undefined;
    }

    /**
     * Finds the variable a function can only be called through, as in
     * `function f() {}` or `const f = () => {}`.
     */
    function getFunctionVariable(
      node:
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionDeclaration
        | TSESTree.FunctionExpression,
    ): ScopeVariable | undefined {
      if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
        return context.sourceCode.getDeclaredVariables(node).at(0);
      }
      if (
        node.parent.type === AST_NODE_TYPES.VariableDeclarator &&
        node.parent.init === node &&
        node.parent.id.type === AST_NODE_TYPES.Identifier
      ) {
        return context.sourceCode.getDeclaredVariables(node.parent).at(0);
      }
      return undefined;
    }

    /**
     * Finds the earliest position in the constructor that `node` may run at,
     * or `undefined` if it never runs as part of the constructor.
     *
     * A function can't run before it's created, and one only reachable
     * through a variable can't run before that variable is first read, so
     * `const f = () => { this.foo = 1; };` doesn't run until `f` is used.
     */
    function getEarliestRunPosition(
      node: TSESTree.Node,
      visited = new Set<TSESTree.Node>(),
    ): number | undefined {
      const functionNode = findParentFunction(node);
      if (!functionNode || visited.has(functionNode)) {
        return undefined;
      }
      if (isConstructorFunctionExpression(functionNode)) {
        return node.range[0];
      }

      visited.add(functionNode);

      const variable = getFunctionVariable(functionNode);
      if (!variable) {
        return getEarliestRunPosition(functionNode.parent, visited);
      }

      let earliest: number | undefined;
      for (const reference of variable.references) {
        if (!reference.isRead()) {
          continue;
        }
        const position = getEarliestRunPosition(reference.identifier, visited);
        if (position != null && (earliest == null || position < earliest)) {
          earliest = position;
        }
      }
      return earliest;
    }

    function addWrite(name: string, node: TSESTree.Node): void {
      const position = getEarliestRunPosition(node);
      if (position == null) {
        return;
      }

      const { earliestWrites } = nullThrows(
        reportInfoStack.at(-1),
        'The top of stack should exist',
      );
      const earliest = earliestWrites.get(name);
      if (earliest == null || position < earliest) {
        earliestWrites.set(name, position);
      }
    }

    return {
      ClassBody(): void {
        reportInfoStack.push({
          assignedBeforeConstructor: new Set(),
          earliestWrites: new Map(),
          unnecessaryAssignments: [],
        });
      },
      'ClassBody:exit'(): void {
        const {
          assignedBeforeConstructor,
          earliestWrites,
          unnecessaryAssignments,
        } = nullThrows(reportInfoStack.pop(), 'The top stack should exist');
        unnecessaryAssignments.forEach(({ name, node }) => {
          const earliestWrite = earliestWrites.get(name);
          if (
            assignedBeforeConstructor.has(name) ||
            (earliestWrite != null && earliestWrite < node.range[0])
          ) {
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
        const constructorNode = findConstructorOfWrite(node);

        if (!leftName || !constructorNode) {
          return;
        }

        const rightId = getIdentifier(node.right);

        if (
          UNNECESSARY_OPERATORS.has(node.operator) &&
          leftName === rightId?.name &&
          isUnchangedConstructorParameter(rightId, constructorNode, node) &&
          constructorNode.params.some(param =>
            isParameterPropertyWithName(param, leftName),
          )
        ) {
          // A copy in a callback such as `setTimeout` may run after the
          // property changed, so only report copies that run immediately.
          // Either way, it doesn't change the property's value.
          if (findImmediateConstructor(node)) {
            nullThrows(
              reportInfoStack.at(-1),
              'The top of stack should exist',
            ).unnecessaryAssignments.push({
              name: leftName,
              node,
            });
          }
          return;
        }

        addWrite(leftName, node);
      },
      "MethodDefinition[kind='constructor'] > FunctionExpression MemberExpression"(
        node: TSESTree.MemberExpression,
      ): void {
        const name = getPropertyName(node);

        // Writes such as `this.foo++`, `[this.foo] = values`,
        // `(this.foo as number) = 1`, `delete this.foo` or
        // `delete this?.foo`. A plain `this.foo = value` is handled by the
        // AssignmentExpression listener.
        if (
          name &&
          isAssignee(
            node.parent.type === AST_NODE_TYPES.ChainExpression
              ? node.parent
              : node,
          ) &&
          !(
            node.parent.type === AST_NODE_TYPES.AssignmentExpression &&
            node.parent.left === node
          ) &&
          findConstructorOfWrite(node)
        ) {
          addWrite(name, node);
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
