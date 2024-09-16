import type { TSESTree } from '@typescript-eslint/utils';

import { DefinitionType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type {
  FunctionExpression,
  FunctionInfo,
  FunctionNode,
} from '../util/explicitReturnTypeUtils';

import { createRule, isFunction } from '../util';
import {
  ancestorHasReturnType,
  checkFunctionExpressionReturnType,
  checkFunctionReturnType,
  doesImmediatelyReturnFunctionExpression,
  isTypedFunctionExpression,
} from '../util/explicitReturnTypeUtils';

type Options = [
  {
    allowArgumentsExplicitlyTypedAsAny?: boolean;
    allowDirectConstAssertionInArrowFunctions?: boolean;
    allowedNames?: string[];
    allowHigherOrderFunctions?: boolean;
    allowTypedFunctionExpressions?: boolean;
  },
];
type MessageIds =
  | 'anyTypedArg'
  | 'anyTypedArgUnnamed'
  | 'missingArgType'
  | 'missingArgTypeUnnamed'
  | 'missingReturnType';

export default createRule<Options, MessageIds>({
  create(context, [options]) {
    // tracks all of the functions we've already checked
    const checkedFunctions = new Set<FunctionNode>();

    const functionStack: FunctionNode[] = [];
    const functionReturnsMap = new Map<
      FunctionNode,
      TSESTree.ReturnStatement[]
    >();

    // all nodes visited, avoids infinite recursion for cyclic references
    // (such as class member referring to itself)
    const alreadyVisited = new Set<TSESTree.Node>();

    function getReturnsInFunction(
      node: FunctionNode,
    ): TSESTree.ReturnStatement[] {
      return functionReturnsMap.get(node) ?? [];
    }

    function enterFunction(node: FunctionNode): void {
      functionStack.push(node);
      functionReturnsMap.set(node, []);
    }

    function exitFunction(): void {
      functionStack.pop();
    }

    /*
    # How the rule works:

    As the rule traverses the AST, it immediately checks every single function that it finds is exported.
    "exported" means that it is either directly exported, or that its name is exported.

    It also collects a list of every single function it finds on the way, but does not check them.
    After it's finished traversing the AST, it then iterates through the list of found functions, and checks to see if
    any of them are part of a higher-order function
    */

    return {
      'ArrowFunctionExpression, FunctionDeclaration, FunctionExpression':
        enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,
      'ExportDefaultDeclaration:exit'(node): void {
        checkNode(node.declaration);
      },
      'ExportNamedDeclaration:not([source]):exit'(
        node: TSESTree.ExportNamedDeclaration,
      ): void {
        if (node.declaration) {
          checkNode(node.declaration);
        } else {
          for (const specifier of node.specifiers) {
            followReference(specifier.local);
          }
        }
      },
      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,
      'Program:exit'(): void {
        for (const [node, returns] of functionReturnsMap) {
          if (isExportedHigherOrderFunction({ node, returns })) {
            checkNode(node);
          }
        }
      },
      ReturnStatement(node): void {
        const current = functionStack[functionStack.length - 1];
        functionReturnsMap.get(current)?.push(node);
      },
      'TSExportAssignment:exit'(node): void {
        checkNode(node.expression);
      },
    };

    function checkParameters(
      node: FunctionNode | TSESTree.TSEmptyBodyFunctionExpression,
    ): void {
      function checkParameter(param: TSESTree.Parameter): void {
        function report(
          namedMessageId: MessageIds,
          unnamedMessageId: MessageIds,
        ): void {
          if (param.type === AST_NODE_TYPES.Identifier) {
            context.report({
              data: { name: param.name },
              messageId: namedMessageId,
              node: param,
            });
          } else if (param.type === AST_NODE_TYPES.ArrayPattern) {
            context.report({
              data: { type: 'Array pattern' },
              messageId: unnamedMessageId,
              node: param,
            });
          } else if (param.type === AST_NODE_TYPES.ObjectPattern) {
            context.report({
              data: { type: 'Object pattern' },
              messageId: unnamedMessageId,
              node: param,
            });
          } else if (param.type === AST_NODE_TYPES.RestElement) {
            if (param.argument.type === AST_NODE_TYPES.Identifier) {
              context.report({
                data: { name: param.argument.name },
                messageId: namedMessageId,
                node: param,
              });
            } else {
              context.report({
                data: { type: 'Rest' },
                messageId: unnamedMessageId,
                node: param,
              });
            }
          }
        }

        switch (param.type) {
          case AST_NODE_TYPES.ArrayPattern:
          case AST_NODE_TYPES.Identifier:
          case AST_NODE_TYPES.ObjectPattern:
          case AST_NODE_TYPES.RestElement:
            if (!param.typeAnnotation) {
              report('missingArgType', 'missingArgTypeUnnamed');
            } else if (
              options.allowArgumentsExplicitlyTypedAsAny !== true &&
              param.typeAnnotation.typeAnnotation.type ===
                AST_NODE_TYPES.TSAnyKeyword
            ) {
              report('anyTypedArg', 'anyTypedArgUnnamed');
            }
            return;

          case AST_NODE_TYPES.TSParameterProperty:
            return checkParameter(param.parameter);

          case AST_NODE_TYPES.AssignmentPattern: // ignored as it has a type via its assignment
            return;
        }
      }

      for (const arg of node.params) {
        checkParameter(arg);
      }
    }

    /**
     * Checks if a function name is allowed and should not be checked.
     */
    function isAllowedName(node: TSESTree.Node | undefined): boolean {
      if (!node || !options.allowedNames || options.allowedNames.length === 0) {
        return false;
      }

      if (
        node.type === AST_NODE_TYPES.VariableDeclarator ||
        node.type === AST_NODE_TYPES.FunctionDeclaration
      ) {
        return (
          node.id?.type === AST_NODE_TYPES.Identifier &&
          options.allowedNames.includes(node.id.name)
        );
      } else if (
        node.type === AST_NODE_TYPES.MethodDefinition ||
        node.type === AST_NODE_TYPES.TSAbstractMethodDefinition ||
        (node.type === AST_NODE_TYPES.Property && node.method) ||
        node.type === AST_NODE_TYPES.PropertyDefinition
      ) {
        if (
          node.key.type === AST_NODE_TYPES.Literal &&
          typeof node.key.value === 'string'
        ) {
          return options.allowedNames.includes(node.key.value);
        }
        if (
          node.key.type === AST_NODE_TYPES.TemplateLiteral &&
          node.key.expressions.length === 0
        ) {
          return options.allowedNames.includes(node.key.quasis[0].value.raw);
        }
        if (!node.computed && node.key.type === AST_NODE_TYPES.Identifier) {
          return options.allowedNames.includes(node.key.name);
        }
      }

      return false;
    }

    function isExportedHigherOrderFunction({
      node,
    }: FunctionInfo<FunctionNode>): boolean {
      let current: TSESTree.Node | undefined = node.parent;
      while (current) {
        if (current.type === AST_NODE_TYPES.ReturnStatement) {
          // the parent of a return will always be a block statement, so we can skip over it
          current = current.parent.parent;
          continue;
        }

        if (!isFunction(current)) {
          return false;
        }
        const returns = getReturnsInFunction(current);
        if (
          !doesImmediatelyReturnFunctionExpression({ node: current, returns })
        ) {
          return false;
        }

        if (checkedFunctions.has(current)) {
          return true;
        }

        current = current.parent;
      }

      return false;
    }

    function followReference(node: TSESTree.Identifier): void {
      const scope = context.sourceCode.getScope(node);
      const variable = scope.set.get(node.name);
      /* istanbul ignore if */ if (!variable) {
        return;
      }

      // check all of the definitions
      for (const definition of variable.defs) {
        // cases we don't care about in this rule
        if (
          [
            DefinitionType.CatchClause,
            DefinitionType.ImplicitGlobalVariable,
            DefinitionType.ImportBinding,
            DefinitionType.Parameter,
          ].includes(definition.type)
        ) {
          continue;
        }

        checkNode(definition.node);
      }

      // follow references to find writes to the variable
      for (const reference of variable.references) {
        if (
          // we don't want to check the initialization ref, as this is handled by the declaration check
          !reference.init &&
          reference.writeExpr
        ) {
          checkNode(reference.writeExpr);
        }
      }
    }

    function checkNode(node: TSESTree.Node | null): void {
      if (node == null || alreadyVisited.has(node)) {
        return;
      }
      alreadyVisited.add(node);

      switch (node.type) {
        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.FunctionExpression: {
          const returns = getReturnsInFunction(node);
          return checkFunctionExpression({ node, returns });
        }

        case AST_NODE_TYPES.ArrayExpression:
          for (const element of node.elements) {
            checkNode(element);
          }
          return;

        case AST_NODE_TYPES.PropertyDefinition:
          if (
            node.accessibility === 'private' ||
            node.key.type === AST_NODE_TYPES.PrivateIdentifier
          ) {
            return;
          }
          return checkNode(node.value);

        case AST_NODE_TYPES.ClassDeclaration:
        case AST_NODE_TYPES.ClassExpression:
          for (const element of node.body.body) {
            checkNode(element);
          }
          return;

        case AST_NODE_TYPES.FunctionDeclaration: {
          const returns = getReturnsInFunction(node);
          return checkFunction({ node, returns });
        }

        case AST_NODE_TYPES.MethodDefinition:
        case AST_NODE_TYPES.TSAbstractMethodDefinition:
          if (
            node.accessibility === 'private' ||
            node.key.type === AST_NODE_TYPES.PrivateIdentifier
          ) {
            return;
          }
          return checkNode(node.value);

        case AST_NODE_TYPES.Identifier:
          return followReference(node);

        case AST_NODE_TYPES.ObjectExpression:
          for (const property of node.properties) {
            checkNode(property);
          }
          return;

        case AST_NODE_TYPES.Property:
          return checkNode(node.value);

        case AST_NODE_TYPES.TSEmptyBodyFunctionExpression:
          return checkEmptyBodyFunctionExpression(node);

        case AST_NODE_TYPES.VariableDeclaration:
          for (const declaration of node.declarations) {
            checkNode(declaration);
          }
          return;

        case AST_NODE_TYPES.VariableDeclarator:
          return checkNode(node.init);
      }
    }

    function checkEmptyBodyFunctionExpression(
      node: TSESTree.TSEmptyBodyFunctionExpression,
    ): void {
      const isConstructor =
        node.parent.type === AST_NODE_TYPES.MethodDefinition &&
        node.parent.kind === 'constructor';
      const isSetAccessor =
        (node.parent.type === AST_NODE_TYPES.TSAbstractMethodDefinition ||
          node.parent.type === AST_NODE_TYPES.MethodDefinition) &&
        node.parent.kind === 'set';
      if (!isConstructor && !isSetAccessor && !node.returnType) {
        context.report({
          messageId: 'missingReturnType',
          node,
        });
      }

      checkParameters(node);
    }

    function checkFunctionExpression({
      node,
      returns,
    }: FunctionInfo<FunctionExpression>): void {
      if (checkedFunctions.has(node)) {
        return;
      }
      checkedFunctions.add(node);

      if (
        isAllowedName(node.parent) ||
        isTypedFunctionExpression(node, options) ||
        ancestorHasReturnType(node)
      ) {
        return;
      }

      checkFunctionExpressionReturnType(
        { node, returns },
        options,
        context.sourceCode,
        loc => {
          context.report({
            loc,
            messageId: 'missingReturnType',
            node,
          });
        },
      );

      checkParameters(node);
    }

    function checkFunction({
      node,
      returns,
    }: FunctionInfo<TSESTree.FunctionDeclaration>): void {
      if (checkedFunctions.has(node)) {
        return;
      }
      checkedFunctions.add(node);

      if (isAllowedName(node) || ancestorHasReturnType(node)) {
        return;
      }

      checkFunctionReturnType(
        { node, returns },
        options,
        context.sourceCode,
        loc => {
          context.report({
            loc,
            messageId: 'missingReturnType',
            node,
          });
        },
      );

      checkParameters(node);
    }
  },
  defaultOptions: [
    {
      allowArgumentsExplicitlyTypedAsAny: false,
      allowDirectConstAssertionInArrowFunctions: true,
      allowedNames: [],
      allowHigherOrderFunctions: true,
      allowTypedFunctionExpressions: true,
    },
  ],
  meta: {
    docs: {
      description:
        "Require explicit return and argument types on exported functions' and classes' public class methods",
    },
    messages: {
      anyTypedArg: "Argument '{{name}}' should be typed with a non-any type.",
      anyTypedArgUnnamed:
        '{{type}} argument should be typed with a non-any type.',
      missingArgType: "Argument '{{name}}' should be typed.",
      missingArgTypeUnnamed: '{{type}} argument should be typed.',
      missingReturnType: 'Missing return type on function.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowArgumentsExplicitlyTypedAsAny: {
            description:
              'Whether to ignore arguments that are explicitly typed as `any`.',
            type: 'boolean',
          },
          allowDirectConstAssertionInArrowFunctions: {
            description: [
              'Whether to ignore return type annotations on body-less arrow functions that return an `as const` type assertion.',
              'You must still type the parameters of the function.',
            ].join('\n'),
            type: 'boolean',
          },
          allowedNames: {
            description:
              'An array of function/method names that will not have their arguments or return values checked.',
            items: {
              type: 'string',
            },
            type: 'array',
          },
          allowHigherOrderFunctions: {
            description: [
              'Whether to ignore return type annotations on functions immediately returning another function expression.',
              'You must still type the parameters of the function.',
            ].join('\n'),
            type: 'boolean',
          },
          allowTypedFunctionExpressions: {
            description:
              'Whether to ignore type annotations on the variable of a function expression.',
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'problem',
  },
  name: 'explicit-module-boundary-types',
});
