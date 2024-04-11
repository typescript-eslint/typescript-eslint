import { DefinitionType } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';

import { createRule, getStaticStringValue, nullThrows } from '../util';

type MessageIds = 'unnecessaryAssign';

const UNNECESSARY_OPERATORS = new Set(['=', '&&=', '||=', '??=']);

export default createRule<[], MessageIds>({
  name: 'no-unnecessary-parameter-property-assignment',
  meta: {
    docs: {
      description:
        'Disallow unnecessary assignment of constructor property parameter',
      requiresTypeChecking: false,
    },
    fixable: 'code',
    messages: {
      unnecessaryAssign:
        'This assignment is unnecessary since it already assigned by parameter property.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const reportInfoStack: {
      assignedBeforeUnnecessary: Set<string>;
      assignedBeforeCtor: Set<string>;
      unnecessaryAssigments: {
        name: string;
        node: TSESTree.AssignmentExpression;
      }[];
    }[] = [];

    function getPropertyName(node: TSESTree.MemberExpression): string | null {
      if (node.property.type === AST_NODE_TYPES.Identifier) {
        return node.property.name;
      }
      if (node.computed) {
        return getStaticStringValue(node.property);
      }
      return null;
    }

    function findFunction(
      node: TSESTree.Node | undefined,
    ):
      | TSESTree.FunctionExpression
      | TSESTree.FunctionDeclaration
      | TSESTree.ArrowFunctionExpression
      | undefined {
      if (
        !node ||
        node.type === AST_NODE_TYPES.FunctionDeclaration ||
        node.type === AST_NODE_TYPES.FunctionExpression ||
        node.type === AST_NODE_TYPES.ArrowFunctionExpression
      ) {
        return node;
      }
      return findFunction(node.parent);
    }

    function isThisMemberExpression(
      node: TSESTree.Node,
    ): node is TSESTree.MemberExpression {
      return (
        node.type === AST_NODE_TYPES.MemberExpression &&
        node.object.type === AST_NODE_TYPES.ThisExpression
      );
    }

    function findPropertyDefinition(
      node: TSESTree.Node | undefined,
    ): TSESTree.PropertyDefinition | undefined {
      if (!node || node.type === AST_NODE_TYPES.PropertyDefinition) {
        return node;
      }
      return findPropertyDefinition(node.parent);
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
            node.parameter.left.type === AST_NODE_TYPES.Identifier &&
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

    return {
      ClassBody(): void {
        reportInfoStack.push({
          unnecessaryAssigments: [],
          assignedBeforeUnnecessary: new Set(),
          assignedBeforeCtor: new Set(),
        });
      },
      'ClassBody:exit'(): void {
        const { unnecessaryAssigments, assignedBeforeCtor } = nullThrows(
          reportInfoStack.pop(),
          'The top stack should exist',
        );
        unnecessaryAssigments.forEach(({ name, node }) => {
          if (assignedBeforeCtor.has(name)) {
            return;
          }
          context.report({
            node,
            messageId: 'unnecessaryAssign',
          });
        });
      },
      'PropertyDefinition AssignmentExpression'(
        node: TSESTree.AssignmentExpression,
      ): void {
        if (!isThisMemberExpression(node.left)) {
          return;
        }

        const name = getPropertyName(node.left);

        if (!name) {
          return;
        }

        const functionNode = findFunction(node);
        if (functionNode) {
          const isArrowIIFE =
            functionNode.type === AST_NODE_TYPES.ArrowFunctionExpression &&
            functionNode.parent.type === AST_NODE_TYPES.CallExpression;

          if (
            !(
              isArrowIIFE &&
              findPropertyDefinition(node)?.value === functionNode.parent
            )
          ) {
            return;
          }
        }

        const { assignedBeforeCtor } = nullThrows(
          reportInfoStack.at(reportInfoStack.length - 1),
          'The top stack should exist',
        );
        assignedBeforeCtor.add(name);
      },
      "MethodDefinition[kind='constructor'] > FunctionExpression AssignmentExpression"(
        node: TSESTree.AssignmentExpression,
      ): void {
        if (!isThisMemberExpression(node.left)) {
          return;
        }

        const leftName = getPropertyName(node.left);

        if (!leftName) {
          return;
        }

        const functionNode = findFunction(node);

        if (!isConstructorFunctionExpression(functionNode)) {
          return;
        }

        const { assignedBeforeUnnecessary, unnecessaryAssigments } = nullThrows(
          reportInfoStack.at(reportInfoStack.length - 1),
          'The top of stack should exist',
        );

        if (!UNNECESSARY_OPERATORS.has(node.operator)) {
          assignedBeforeUnnecessary.add(leftName);
          return;
        }

        const rightId = getIdentifier(node.right);

        if (
          !rightId ||
          leftName !== rightId.name ||
          !isReferenceFromParameter(rightId)
        ) {
          return;
        }

        const hasParameterPropety = functionNode.params.some(param =>
          isParameterPropertyWithName(param, rightId.name),
        );

        if (hasParameterPropety) {
          if (!assignedBeforeUnnecessary.has(leftName)) {
            unnecessaryAssigments.push({
              name: leftName,
              node,
            });
          }
        }
      },
    };
  },
});
