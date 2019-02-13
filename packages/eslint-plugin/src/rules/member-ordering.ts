/**
 * @fileoverview Enforces a standard member declaration order.
 * @author Patricio Trevino
 */

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

type MessageIds = 'incorrectOrder';
type OrderConfig = string[] | 'never';
type Options = [
  {
    default?: OrderConfig;
    classes?: OrderConfig;
    classExpressions?: OrderConfig;
    interfaces?: OrderConfig;
    typeLiterals?: OrderConfig;
  }
];

const schemaOptions = ['field', 'method', 'constructor'].reduce<string[]>(
  (options, type) => {
    options.push(type);

    ['public', 'protected', 'private'].forEach(accessibility => {
      options.push(`${accessibility}-${type}`);
      if (type !== 'constructor') {
        ['static', 'instance'].forEach(scope => {
          if (options.indexOf(`${scope}-${type}`) === -1) {
            options.push(`${scope}-${type}`);
          }
          options.push(`${accessibility}-${scope}-${type}`);
        });
      }
    });

    return options;
  },
  [],
);

export default util.createRule<Options, MessageIds>({
  name: 'member-ordering',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require a consistent member declaration order',
      tslintRuleName: 'member-ordering',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      incorrectOrder:
        'Member {{name}} should be declared before all {{rank}} definitions.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          default: {
            oneOf: [
              {
                enum: ['never'],
              },
              {
                type: 'array',
                items: {
                  enum: schemaOptions,
                },
              },
            ],
          },
          classes: {
            oneOf: [
              {
                enum: ['never'],
              },
              {
                type: 'array',
                items: {
                  enum: schemaOptions,
                },
              },
            ],
          },
          classExpressions: {
            oneOf: [
              {
                enum: ['never'],
              },
              {
                type: 'array',
                items: {
                  enum: schemaOptions,
                },
              },
            ],
          },
          interfaces: {
            oneOf: [
              {
                enum: ['never'],
              },
              {
                type: 'array',
                items: {
                  enum: ['field', 'method', 'constructor'],
                },
              },
            ],
          },
          typeLiterals: {
            oneOf: [
              {
                enum: ['never'],
              },
              {
                type: 'array',
                items: {
                  enum: ['field', 'method', 'constructor'],
                },
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      default: [
        'public-static-field',
        'protected-static-field',
        'private-static-field',

        'public-instance-field',
        'protected-instance-field',
        'private-instance-field',

        'public-field',
        'protected-field',
        'private-field',

        'static-field',
        'instance-field',

        'field',

        'constructor',

        'public-static-method',
        'protected-static-method',
        'private-static-method',

        'public-instance-method',
        'protected-instance-method',
        'private-instance-method',

        'public-method',
        'protected-method',
        'private-method',

        'static-method',
        'instance-method',

        'method',
      ],
    },
  ],
  create(context, [options]) {
    const functionExpressions = [
      AST_NODE_TYPES.FunctionExpression,
      AST_NODE_TYPES.ArrowFunctionExpression,
    ];

    /**
     * Gets the node type.
     * @param node the node to be evaluated.
     */
    function getNodeType(
      node: TSESTree.ClassElement | TSESTree.TypeElement,
    ): string | null {
      // TODO: add missing TSCallSignatureDeclaration
      switch (node.type) {
        case AST_NODE_TYPES.MethodDefinition:
          return node.kind;
        case AST_NODE_TYPES.TSMethodSignature:
          return 'method';
        case AST_NODE_TYPES.TSConstructSignatureDeclaration:
          return 'constructor';
        case AST_NODE_TYPES.ClassProperty:
          return node.value && functionExpressions.indexOf(node.value.type) > -1
            ? 'method'
            : 'field';
        case AST_NODE_TYPES.TSPropertySignature:
          return 'field';
        default:
          return null;
      }
    }

    /**
     * Gets the member name based on the member type.
     * @param node the node to be evaluated.
     */
    function getMemberName(
      node: TSESTree.ClassElement | TSESTree.TypeElement,
    ): string | null {
      switch (node.type) {
        case AST_NODE_TYPES.TSPropertySignature:
        case AST_NODE_TYPES.TSMethodSignature:
        case AST_NODE_TYPES.ClassProperty:
          return util.getNameFromPropertyName(node.key);
        case AST_NODE_TYPES.MethodDefinition:
          return node.kind === 'constructor'
            ? 'constructor'
            : util.getNameFromPropertyName(node.key);
        case AST_NODE_TYPES.TSConstructSignatureDeclaration:
          return 'new';
        default:
          return null;
      }
    }

    /**
     * Gets the calculated rank using the provided method definition.
     * The algorithm is as follows:
     * - Get the rank based on the accessibility-scope-type name, e.g. public-instance-field
     * - If there is no order for accessibility-scope-type, then strip out the accessibility.
     * - If there is no order for scope-type, then strip out the scope.
     * - If there is no order for type, then return -1
     * @param names the valid names to be validated.
     * @param order the current order to be validated.
     */
    function getRankOrder(names: string[], order: string[]): number {
      let rank = -1;
      const stack = names.slice();

      while (stack.length > 0 && rank === -1) {
        rank = order.indexOf(stack.shift()!);
      }

      return rank;
    }

    /**
     * Gets the rank of the node given the order.
     * @param node the node to be evaluated.
     * @param order the current order to be validated.
     * @param supportsModifiers a flag indicating whether the type supports modifiers or not.
     */
    function getRank(
      node: TSESTree.ClassElement | TSESTree.TypeElement,
      order: string[],
      supportsModifiers: boolean,
    ): number {
      const type = getNodeType(node);
      if (type === null) {
        // shouldn't happen but just in case, put it on the end
        return Number.MAX_SAFE_INTEGER;
      }

      const scope = 'static' in node && node.static ? 'static' : 'instance';
      const accessibility =
        'accessibility' in node && node.accessibility
          ? node.accessibility
          : 'public';

      const names = [];

      if (supportsModifiers) {
        if (type !== 'constructor') {
          names.push(`${accessibility}-${scope}-${type}`);
          names.push(`${scope}-${type}`);
        }
        names.push(`${accessibility}-${type}`);
      }

      names.push(type);

      return getRankOrder(names, order);
    }

    /**
     * Gets the lowest possible rank higher than target.
     * e.g. given the following order:
     *   ...
     *   public-static-method
     *   protected-static-method
     *   private-static-method
     *   public-instance-method
     *   protected-instance-method
     *   private-instance-method
     *   ...
     * and considering that a public-instance-method has already been declared, so ranks contains
     * public-instance-method, then the lowest possible rank for public-static-method is
     * public-instance-method.
     * @param ranks the existing ranks in the object.
     * @param target the target rank.
     * @param order the current order to be validated.
     * @returns the name of the lowest possible rank without dashes (-).
     */
    function getLowestRank(
      ranks: number[],
      target: number,
      order: string[],
    ): string {
      let lowest = ranks[ranks.length - 1];

      ranks.forEach(rank => {
        if (rank > target) {
          lowest = Math.min(lowest, rank);
        }
      });

      return order[lowest].replace(/-/g, ' ');
    }

    /**
     * Validates each member rank.
     * @param members the members to be validated.
     * @param order the current order to be validated.
     * @param supportsModifiers a flag indicating whether the type supports modifiers or not.
     */
    function validateMembers(
      members: (TSESTree.ClassElement | TSESTree.TypeElement)[],
      order: OrderConfig,
      supportsModifiers: boolean,
    ): void {
      if (members && order !== 'never') {
        const previousRanks: number[] = [];

        members.forEach(member => {
          const rank = getRank(member, order, supportsModifiers);

          if (rank !== -1) {
            if (rank < previousRanks[previousRanks.length - 1]) {
              context.report({
                node: member,
                messageId: 'incorrectOrder',
                data: {
                  name: getMemberName(member),
                  rank: getLowestRank(previousRanks, rank, order),
                },
              });
            } else {
              previousRanks.push(rank);
            }
          }
        });
      }
    }

    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        validateMembers(
          node.body.body,
          options.classes || options.default!,
          true,
        );
      },
      ClassExpression(node: TSESTree.ClassExpression) {
        validateMembers(
          node.body.body,
          options.classExpressions || options.default!,
          true,
        );
      },
      TSInterfaceDeclaration(node: TSESTree.TSInterfaceDeclaration) {
        validateMembers(
          node.body.body,
          options.interfaces || options.default!,
          false,
        );
      },
      TSTypeLiteral(node: TSESTree.TSTypeLiteral) {
        validateMembers(
          node.members,
          options.typeLiterals || options.default!,
          false,
        );
      },
    };
  },
});
