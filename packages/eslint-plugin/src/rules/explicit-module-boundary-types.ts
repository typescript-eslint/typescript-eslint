import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';
import {
  checkFunctionExpressionReturnType,
  checkFunctionReturnType,
  doesImmediatelyReturnFunctionExpression,
  FunctionExpression,
  FunctionNode,
  isTypedFunctionExpression,
} from '../util/explicitReturnTypeUtils';

type Options = [
  {
    allowArgumentsExplicitlyTypedAsAny?: boolean;
    allowDirectConstAssertionInArrowFunctions?: boolean;
    allowedNames?: string[];
    allowHigherOrderFunctions?: boolean;
    allowTypedFunctionExpressions?: boolean;
    shouldTrackReferences?: boolean;
  },
];
type MessageIds =
  | 'missingReturnType'
  | 'missingArgType'
  | 'missingArgTypeUnnamed'
  | 'anyTypedArg'
  | 'anyTypedArgUnnamed';

export default util.createRule<Options, MessageIds>({
  name: 'explicit-module-boundary-types',
  meta: {
    type: 'problem',
    docs: {
      description:
        "Require explicit return and argument types on exported functions' and classes' public class methods",
      category: 'Stylistic Issues',
      recommended: 'warn',
    },
    messages: {
      missingReturnType: 'Missing return type on function.',
      missingArgType: "Argument '{{name}}' should be typed.",
      missingArgTypeUnnamed: '{{type}} argument should be typed.',
      anyTypedArg: "Argument '{{name}}' should be typed with a non-any type.",
      anyTypedArgUnnamed:
        '{{type}} argument should be typed with a non-any type.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowArgumentsExplicitlyTypedAsAny: {
            type: 'boolean',
          },
          allowDirectConstAssertionInArrowFunctions: {
            type: 'boolean',
          },
          allowedNames: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          allowHigherOrderFunctions: {
            type: 'boolean',
          },
          allowTypedFunctionExpressions: {
            type: 'boolean',
          },
          // DEPRECATED - To be removed in next major
          shouldTrackReferences: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
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
  create(context, [options]) {
    const sourceCode = context.getSourceCode();

    // tracks all of the functions we've already checked
    const checkedFunctions = new Set<FunctionNode>();

    // tracks functions that were found whilst traversing
    const foundFunctions: FunctionNode[] = [];

    // all nodes visited, avoids infinite recursion for cyclic references
    // (such as class member referring to itself)
    const alreadyVisited = new Set<TSESTree.Node>();

    /*
    # How the rule works:

    As the rule traverses the AST, it immediately checks every single function that it finds is exported.
    "exported" means that it is either directly exported, or that its name is exported.

    It also collects a list of every single function it finds on the way, but does not check them.
    After it's finished traversing the AST, it then iterates through the list of found functions, and checks to see if
    any of them are part of a higher-order function
    */

    return {
      ExportDefaultDeclaration(node): void {
        checkNode(node.declaration);
      },
      'ExportNamedDeclaration:not([source])'(
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
      TSExportAssignment(node): void {
        checkNode(node.expression);
      },

      'ArrowFunctionExpression, FunctionDeclaration, FunctionExpression'(
        node: FunctionNode,
      ): void {
        foundFunctions.push(node);
      },
      'Program:exit'(): void {
        for (const func of foundFunctions) {
          if (isExportedHigherOrderFunction(func)) {
            checkNode(func);
          }
        }
      },
    };

    function checkParameters(
      node: TSESTree.TSEmptyBodyFunctionExpression | FunctionNode,
    ): void {
      function checkParameter(param: TSESTree.Parameter): void {
        function report(
          namedMessageId: MessageIds,
          unnamedMessageId: MessageIds,
        ): void {
          if (param.type === AST_NODE_TYPES.Identifier) {
            context.report({
              node: param,
              messageId: namedMessageId,
              data: { name: param.name },
            });
          } else if (param.type === AST_NODE_TYPES.ArrayPattern) {
            context.report({
              node: param,
              messageId: unnamedMessageId,
              data: { type: 'Array pattern' },
            });
          } else if (param.type === AST_NODE_TYPES.ObjectPattern) {
            context.report({
              node: param,
              messageId: unnamedMessageId,
              data: { type: 'Object pattern' },
            });
          } else if (param.type === AST_NODE_TYPES.RestElement) {
            if (param.argument.type === AST_NODE_TYPES.Identifier) {
              context.report({
                node: param,
                messageId: namedMessageId,
                data: { name: param.argument.name },
              });
            } else {
              context.report({
                node: param,
                messageId: unnamedMessageId,
                data: { type: 'Rest' },
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
      if (!node || !options.allowedNames || !options.allowedNames.length) {
        return false;
      }

      if (node.type === AST_NODE_TYPES.VariableDeclarator) {
        return (
          node.id.type === AST_NODE_TYPES.Identifier &&
          options.allowedNames.includes(node.id.name)
        );
      } else if (
        node.type === AST_NODE_TYPES.MethodDefinition ||
        node.type === AST_NODE_TYPES.TSAbstractMethodDefinition
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

    function isExportedHigherOrderFunction(node: FunctionNode): boolean {
      let current = node.parent;
      while (current) {
        if (current.type === AST_NODE_TYPES.ReturnStatement) {
          // the parent of a return will always be a block statement, so we can skip over it
          current = current.parent?.parent;
          continue;
        }

        if (
          !util.isFunction(current) ||
          !doesImmediatelyReturnFunctionExpression(current)
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
      const scope = context.getScope();
      const variable = scope.set.get(node.name);
      /* istanbul ignore if */ if (!variable) {
        return;
      }

      // check all of the definitions
      for (const definition of variable.defs) {
        // cases we don't care about in this rule
        if (
          definition.type === 'ImplicitGlobalVariable' ||
          definition.type === 'ImportBinding' ||
          // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
          definition.type === 'CatchClause' ||
          definition.type === 'Parameter'
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
        case AST_NODE_TYPES.FunctionExpression:
          return checkFunctionExpression(node);

        case AST_NODE_TYPES.ArrayExpression:
          for (const element of node.elements) {
            checkNode(element);
          }
          return;

        case AST_NODE_TYPES.ClassProperty:
        case AST_NODE_TYPES.TSAbstractClassProperty:
          if (node.accessibility === 'private') {
            return;
          }
          return checkNode(node.value);

        case AST_NODE_TYPES.ClassDeclaration:
        case AST_NODE_TYPES.ClassExpression:
          for (const element of node.body.body) {
            checkNode(element);
          }
          return;

        case AST_NODE_TYPES.FunctionDeclaration:
          return checkFunction(node);

        case AST_NODE_TYPES.MethodDefinition:
        case AST_NODE_TYPES.TSAbstractMethodDefinition:
          if (node.accessibility === 'private') {
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

    /**
     * Check whether any ancestor of the provided function has a valid return type.
     * This function assumes that the function either:
     * - belongs to an exported function chain validated by isExportedHigherOrderFunction
     * - is directly exported itself
     */
    function ancestorHasReturnType(node: FunctionNode): boolean {
      let ancestor = node.parent;

      // if the ancestor is not a return, then this function was not returned at all, so we can exit early
      const isReturnStatement =
        ancestor?.type === AST_NODE_TYPES.ReturnStatement;
      const isBodylessArrow =
        ancestor?.type === AST_NODE_TYPES.ArrowFunctionExpression &&
        ancestor.body.type !== AST_NODE_TYPES.BlockStatement;
      if (!isReturnStatement && !isBodylessArrow) {
        return false;
      }

      while (ancestor) {
        switch (ancestor.type) {
          case AST_NODE_TYPES.ArrowFunctionExpression:
          case AST_NODE_TYPES.FunctionExpression:
          case AST_NODE_TYPES.FunctionDeclaration:
            if (ancestor.returnType) {
              return true;
            }
            // assume
            break;

          // const x: Foo = () => {};
          // Assume that a typed variable types the function expression
          case AST_NODE_TYPES.VariableDeclarator:
            if (ancestor.id.typeAnnotation) {
              return true;
            }
            break;
        }

        ancestor = ancestor.parent;
      }

      return false;
    }

    function checkEmptyBodyFunctionExpression(
      node: TSESTree.TSEmptyBodyFunctionExpression,
    ): void {
      const isConstructor =
        node.parent?.type === AST_NODE_TYPES.MethodDefinition &&
        node.parent.kind === 'constructor';
      const isSetAccessor =
        (node.parent?.type === AST_NODE_TYPES.TSAbstractMethodDefinition ||
          node.parent?.type === AST_NODE_TYPES.MethodDefinition) &&
        node.parent.kind === 'set';
      if (!isConstructor && !isSetAccessor && !node.returnType) {
        context.report({
          node,
          messageId: 'missingReturnType',
        });
      }

      checkParameters(node);
    }

    function checkFunctionExpression(node: FunctionExpression): void {
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

      checkFunctionExpressionReturnType(node, options, sourceCode, loc => {
        context.report({
          node,
          loc,
          messageId: 'missingReturnType',
        });
      });

      checkParameters(node);
    }

    function checkFunction(node: TSESTree.FunctionDeclaration): void {
      if (checkedFunctions.has(node)) {
        return;
      }
      checkedFunctions.add(node);

      if (isAllowedName(node.parent) || ancestorHasReturnType(node)) {
        return;
      }

      checkFunctionReturnType(node, options, sourceCode, loc => {
        context.report({
          node,
          loc,
          messageId: 'missingReturnType',
        });
      });

      checkParameters(node);
    }
  },
});
