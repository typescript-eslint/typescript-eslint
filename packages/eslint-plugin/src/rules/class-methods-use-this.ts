import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  getFunctionHeadLoc,
  getFunctionNameWithKind,
  getStaticMemberAccessValue,
} from '../util';

export type Options = [
  {
    enforceForClassFields?: boolean;
    exceptMethods?: string[];
    ignoreClassesThatImplementAnInterface?: boolean | 'public-fields';
    ignoreOverrideMethods?: boolean;
  },
];
export type MessageIds = 'missingThis';

export default createRule<Options, MessageIds>({
  name: 'class-methods-use-this',
  meta: {
    type: 'suggestion',
    docs: {
      extendsBaseRule: true,
      description: 'Enforce that class methods utilize `this`',
      requiresTypeChecking: false,
    },
    messages: {
      missingThis: "Expected 'this' to be used by class {{name}}.",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          enforceForClassFields: {
            type: 'boolean',
            default: true,
            description:
              'Enforces that functions used as instance field initializers utilize `this`.',
          },
          exceptMethods: {
            type: 'array',
            description:
              'Allows specified method names to be ignored with this rule.',
            items: {
              type: 'string',
            },
          },
          ignoreClassesThatImplementAnInterface: {
            description:
              'Whether to ignore class members that are defined within a class that `implements` a type.',
            oneOf: [
              {
                type: 'boolean',
                description: 'Ignore all classes that implement an interface',
              },
              {
                type: 'string',
                description:
                  'Ignore only the public fields of classes that implement an interface',
                enum: ['public-fields'],
              },
            ],
          },
          ignoreOverrideMethods: {
            type: 'boolean',
            description:
              'Whether to ignore members marked with the `override` modifier.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      enforceForClassFields: true,
      exceptMethods: [],
      ignoreClassesThatImplementAnInterface: false,
      ignoreOverrideMethods: false,
    },
  ],
  create(
    context,
    [
      {
        enforceForClassFields,
        exceptMethods: exceptMethodsRaw,
        ignoreClassesThatImplementAnInterface,
        ignoreOverrideMethods,
      },
    ],
  ) {
    const exceptMethods = new Set(exceptMethodsRaw);
    type Stack =
      | {
          class: null;
          member: null;
          parent: Stack | undefined;
          usesThis: boolean;
        }
      | {
          class: TSESTree.ClassDeclaration | TSESTree.ClassExpression;
          member:
            | TSESTree.AccessorProperty
            | TSESTree.MethodDefinition
            | TSESTree.PropertyDefinition;
          parent: Stack | undefined;
          usesThis: boolean;
        };
    let stack: Stack | undefined;

    function pushContext(
      member?:
        | TSESTree.AccessorProperty
        | TSESTree.MethodDefinition
        | TSESTree.PropertyDefinition,
    ): void {
      if (member?.parent.type === AST_NODE_TYPES.ClassBody) {
        stack = {
          class: member.parent.parent,
          member,
          parent: stack,
          usesThis: false,
        };
      } else {
        stack = {
          class: null,
          member: null,
          parent: stack,
          usesThis: false,
        };
      }
    }

    function enterFunction(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ): void {
      if (
        node.parent.type === AST_NODE_TYPES.MethodDefinition ||
        node.parent.type === AST_NODE_TYPES.PropertyDefinition ||
        node.parent.type === AST_NODE_TYPES.AccessorProperty
      ) {
        pushContext(node.parent);
      } else {
        pushContext();
      }
    }

    /**
     * Pop `this` used flag from the stack.
     */
    function popContext(): Stack | undefined {
      const oldStack = stack;
      stack = stack?.parent;
      return oldStack;
    }

    function isPublicField(
      accessibility: TSESTree.Accessibility | undefined,
    ): boolean {
      if (!accessibility || accessibility === 'public') {
        return true;
      }

      return false;
    }

    /**
     * Check if the node is an instance method not excluded by config
     */
    function isIncludedInstanceMethod(
      node: NonNullable<Stack['member']>,
    ): node is NonNullable<Stack['member']> {
      if (
        node.static ||
        (node.type === AST_NODE_TYPES.MethodDefinition &&
          node.kind === 'constructor') ||
        ((node.type === AST_NODE_TYPES.PropertyDefinition ||
          node.type === AST_NODE_TYPES.AccessorProperty) &&
          !enforceForClassFields)
      ) {
        return false;
      }

      if (node.computed || exceptMethods.size === 0) {
        return true;
      }

      const hashIfNeeded =
        node.key.type === AST_NODE_TYPES.PrivateIdentifier ? '#' : '';
      const name = getStaticMemberAccessValue(node, context);

      return (
        typeof name !== 'string' || !exceptMethods.has(hashIfNeeded + name)
      );
    }

    /**
     * Checks if we are leaving a function that is a method, and reports if 'this' has not been used.
     * Static methods and the constructor are exempt.
     * Then pops the context off the stack.
     */
    function exitFunction(
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ): void {
      const stackContext = popContext();
      if (
        stackContext?.member == null ||
        stackContext.usesThis ||
        (ignoreOverrideMethods && stackContext.member.override) ||
        (ignoreClassesThatImplementAnInterface === true &&
          stackContext.class.implements.length > 0) ||
        (ignoreClassesThatImplementAnInterface === 'public-fields' &&
          stackContext.class.implements.length > 0 &&
          isPublicField(stackContext.member.accessibility))
      ) {
        return;
      }

      if (isIncludedInstanceMethod(stackContext.member)) {
        context.report({
          loc: getFunctionHeadLoc(node, context.sourceCode),
          node,
          messageId: 'missingThis',
          data: {
            name: getFunctionNameWithKind(node),
          },
        });
      }
    }

    return {
      // function declarations have their own `this` context
      FunctionDeclaration(): void {
        pushContext();
      },
      'FunctionDeclaration:exit'(): void {
        popContext();
      },

      FunctionExpression(node): void {
        enterFunction(node);
      },
      'FunctionExpression:exit'(node): void {
        exitFunction(node);
      },
      ...(enforceForClassFields
        ? {
            'AccessorProperty > ArrowFunctionExpression.value'(
              node: TSESTree.ArrowFunctionExpression,
            ): void {
              enterFunction(node);
            },
            'AccessorProperty > ArrowFunctionExpression.value:exit'(
              node: TSESTree.ArrowFunctionExpression,
            ): void {
              exitFunction(node);
            },
            'PropertyDefinition > ArrowFunctionExpression.value'(
              node: TSESTree.ArrowFunctionExpression,
            ): void {
              enterFunction(node);
            },
            'PropertyDefinition > ArrowFunctionExpression.value:exit'(
              node: TSESTree.ArrowFunctionExpression,
            ): void {
              exitFunction(node);
            },
          }
        : {}),

      /*
       * Class field value are implicit functions.
       */
      'AccessorProperty:exit'(): void {
        popContext();
      },
      'AccessorProperty > *.key:exit'(): void {
        pushContext();
      },
      'PropertyDefinition:exit'(): void {
        popContext();
      },
      'PropertyDefinition > *.key:exit'(): void {
        pushContext();
      },

      /*
       * Class static blocks are implicit functions. They aren't required to use `this`,
       * but we have to push context so that it captures any use of `this` in the static block
       * separately from enclosing contexts, because static blocks have their own `this` and it
       * shouldn't count as used `this` in enclosing contexts.
       */
      StaticBlock(): void {
        pushContext();
      },
      'StaticBlock:exit'(): void {
        popContext();
      },

      'ThisExpression, Super'(): void {
        if (stack) {
          stack.usesThis = true;
        }
      },
    };
  },
});
