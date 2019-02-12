import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export type MessageIds = 'incorrectGroupOrder' | 'incorrectOrder';

interface SortedOrderConfig {
  memberTypes?: string[] | 'never';
  order: 'alphabetically';
}

type OrderConfig = string[] | SortedOrderConfig | 'never';

export type Options = [
  {
    default?: OrderConfig;
    classes?: OrderConfig;
    classExpressions?: OrderConfig;
    interfaces?: OrderConfig;
    typeLiterals?: OrderConfig;
  },
];

const defaultOrder = [
  'public-static-field',
  'protected-static-field',
  'private-static-field',

  'public-instance-field',
  'protected-instance-field',
  'private-instance-field',

  'public-abstract-field',
  'protected-abstract-field',
  'private-abstract-field',

  'public-field',
  'protected-field',
  'private-field',

  'static-field',
  'instance-field',
  'abstract-field',

  'field',

  'constructor',

  'public-static-method',
  'protected-static-method',
  'private-static-method',

  'public-instance-method',
  'protected-instance-method',
  'private-instance-method',

  'public-abstract-method',
  'protected-abstract-method',
  'private-abstract-method',

  'public-method',
  'protected-method',
  'private-method',

  'static-method',
  'instance-method',
  'abstract-method',

  'method',
];

const allMemberTypes = ['field', 'method', 'constructor'].reduce<string[]>(
  (all, type) => {
    all.push(type);

    ['public', 'protected', 'private'].forEach(accessibility => {
      all.push(`${accessibility}-${type}`); // e.g. `public-field`

      if (type !== 'constructor') {
        // There is no `static-constructor` or `instance-constructor
        ['static', 'instance'].forEach(scope => {
          if (!all.includes(`${scope}-${type}`)) {
            all.push(`${scope}-${type}`);
          }

          all.push(`${accessibility}-${scope}-${type}`);
        });
      }
    });

    return all;
  },
  [],
);

const neverConfig = {
  type: 'string',
  enum: ['never'],
};

const allMemberTypesArrayConfig = {
  type: 'array',
  items: {
    enum: allMemberTypes,
  },
};

const allMemberTypesDefaultConfig = {
  type: 'string',
  enum: ['never'],
};

const allMemberTypesObjectConfig = {
  type: 'object',
  properties: {
    memberTypes: {
      oneOf: [allMemberTypesDefaultConfig, allMemberTypesArrayConfig],
    },
    order: {
      type: 'string',
      enum: ['alphabetically'],
    },
  },
  additionalProperties: false,
};

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
    case AST_NODE_TYPES.TSAbstractMethodDefinition:
    case AST_NODE_TYPES.MethodDefinition:
      return node.kind;
    case AST_NODE_TYPES.TSMethodSignature:
      return 'method';
    case AST_NODE_TYPES.TSConstructSignatureDeclaration:
      return 'constructor';
    case AST_NODE_TYPES.TSAbstractClassProperty:
    case AST_NODE_TYPES.ClassProperty:
      return node.value && functionExpressions.includes(node.value.type)
        ? 'method'
        : 'field';
    case AST_NODE_TYPES.TSPropertySignature:
      return 'field';
    case AST_NODE_TYPES.TSIndexSignature:
      return 'signature';
    default:
      return null;
  }
}

/**
 * Gets the member name based on the member type.
 *
 * @param node the node to be evaluated.
 * @param sourceCode
 */
function getMemberName(
  node: TSESTree.ClassElement | TSESTree.TypeElement,
  sourceCode: TSESLint.SourceCode,
): string | null {
  switch (node.type) {
    case AST_NODE_TYPES.TSPropertySignature:
    case AST_NODE_TYPES.TSMethodSignature:
    case AST_NODE_TYPES.TSAbstractClassProperty:
    case AST_NODE_TYPES.ClassProperty:
      return util.getNameFromMember(node, sourceCode);
    case AST_NODE_TYPES.TSAbstractMethodDefinition:
    case AST_NODE_TYPES.MethodDefinition:
      return node.kind === 'constructor'
        ? 'constructor'
            : util.getNameFromMember(node, sourceCode);
    case AST_NODE_TYPES.TSConstructSignatureDeclaration:
      return 'new';
    case AST_NODE_TYPES.TSIndexSignature:
      return util.getNameFromIndexSignature(node);
    default:
      return null;
  }
}

/**
 * Gets the member identifier (null if there is no identifier).
 *
 * @param node the node to be evaluated.
 * @param sourceCode
 */
function getIdentifier(
  node: TSESTree.ClassElement | TSESTree.TypeElement,
  sourceCode: TSESLint.SourceCode,
): string | null {
  switch (node.type) {
    case AST_NODE_TYPES.TSPropertySignature:
    case AST_NODE_TYPES.TSMethodSignature:
    case AST_NODE_TYPES.ClassProperty:
      return util.getNameFromPropertyName(node.key);
    case AST_NODE_TYPES.MethodDefinition:
      return util.getNameFromClassMember(node, sourceCode);
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
 * @param memberGroups the valid names to be validated.
 * @param orderConfig the current order to be validated.
 *
 * @return Index of the matching member type in the order configuration.
 */
function getRankOrder(memberGroups: string[], orderConfig: string[]): number {
  let rank = -1;
  const stack = memberGroups.slice(); // Get a copy of the member groups

  while (stack.length > 0 && rank === -1) {
    rank = orderConfig.indexOf(stack.shift()!);
  }

  return rank;
}

/**
 * Gets the rank of the node given the order.
 * @param node the node to be evaluated.
 * @param orderConfig the current order to be validated.
 * @param supportsModifiers a flag indicating whether the type supports modifiers (scope or accessibility) or not.
 */
function getRank(
  node: TSESTree.ClassElement | TSESTree.TypeElement,
  orderConfig: string[],
  supportsModifiers: boolean,
): number {
  const type = getNodeType(node);

  if (type === null) {
    // shouldn't happen but just in case, put it on the end
    return orderConfig.length - 1;
  }

      const abstract =
        node.type === AST_NODE_TYPES.TSAbstractClassProperty ||
        node.type === AST_NODE_TYPES.TSAbstractMethodDefinition;

      const scope =
        'static' in node && node.static
          ? 'static'
          : abstract
          ? 'abstract'
          : 'instance';
  const accessibility =
    'accessibility' in node && node.accessibility
      ? node.accessibility
      : 'public';

  // Collect all existing member groups (e.g. 'public-instance-field', 'instance-field', 'public-field', 'constructor' etc.)
  const memberGroups = [];

  if (supportsModifiers) {
    if (type !== 'constructor') {
      // Constructors have no scope
      memberGroups.push(`${accessibility}-${scope}-${type}`);
      memberGroups.push(`${scope}-${type}`);
    }

    memberGroups.push(`${accessibility}-${type}`);
  }

  memberGroups.push(type);

  return getRankOrder(memberGroups, orderConfig);
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

export default util.createRule<Options, MessageIds>({
  name: 'member-ordering',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require a consistent member declaration order',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      incorrectOrder:
        'Member "{{member}}" should be declared before member "{{beforeMember}}".',
      incorrectGroupOrder:
        'Member {{name}} should be declared before all {{rank}} definitions.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          default: {
            oneOf: [
              neverConfig,
              allMemberTypesArrayConfig,
              allMemberTypesObjectConfig,
            ],
          },
          classes: {
            oneOf: [
              neverConfig,
              allMemberTypesArrayConfig,
              allMemberTypesObjectConfig,
            ],
          },
          classExpressions: {
            oneOf: [
              neverConfig,
              allMemberTypesArrayConfig,
              allMemberTypesObjectConfig,
            ],
          },
          interfaces: {
            oneOf: [
              neverConfig,
              allMemberTypesArrayConfig,
              allMemberTypesObjectConfig,
            ],
          },
          typeLiterals: {
            oneOf: [
              neverConfig,
              allMemberTypesArrayConfig,
              allMemberTypesObjectConfig,
            ],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      default: defaultOrder,
    },
  ],
  create(context, [options]) {
    /**
     * Validates if all members are correctly sorted.
     *
     * @param members Members to be validated.
     * @param orderConfig Order config to be validated.
     * @param supportsModifiers A flag indicating whether the type supports modifiers (scope or accessibility) or not.
     */
    function validateMembersOrder(
      members: (TSESTree.ClassElement | TSESTree.TypeElement)[],
      orderConfig: OrderConfig,
      supportsModifiers: boolean,
    ): void {
      if (members.length > 0 && orderConfig !== 'never') {
        if (Array.isArray(orderConfig)) {
          // Sort member groups (= ignore alphabetic order)
          const memberGroupsOrder = orderConfig;

          const previousRanks: number[] = [];

          // Find first member which isn't correctly sorted
          members.forEach(member => {
            const rank = getRank(member, memberGroupsOrder, supportsModifiers);
            const name = getMemberName(member, context.getSourceCode());

            if (rank !== -1) {
              // Make sure member types are correctly grouped
              // Works for 1st item because x < undefined === false for any x (typeof string)
              if (rank < previousRanks[previousRanks.length - 1]) {
                context.report({
                  node: member,
                  messageId: 'incorrectGroupOrder',
                  data: {
                    name,
                    rank: getLowestRank(previousRanks, rank, memberGroupsOrder),
                  },
                });
              } else {
                previousRanks.push(rank);
              }
            }
          });
        } else if (orderConfig.memberTypes === 'never') {
          // Sort members alphabetically + ignore groups

          let previousName = '';

          // console.log(members)

          // Find first member which isn't correctly sorted
          members.forEach(member => {
            const name = getIdentifier(member, context.getSourceCode());

            // Same member group --> Check alphabetic order
            if (name) {
              // Not all members have sortable identifiers
              if (name < previousName) {
                context.report({
                  node: member,
                  messageId: 'incorrectOrder',
                  data: {
                    member: name,
                    beforeMember: previousName,
                  },
                });
              }

              previousName = name;
            }
          });
        } else {
          // Sort groups + sort alphabetically within each group
          const memberGroupsOrder = orderConfig.memberTypes || defaultOrder;

          const previousRanks: number[] = [];
          let previousName = '';

          // Find first member which isn't correctly sorted
          members.forEach(member => {
            const rank = getRank(member, memberGroupsOrder, supportsModifiers);
            const name = getIdentifier(member, context.getSourceCode());

            if (rank !== -1) {
              // Make sure member types are correctly grouped
              // Works for 1st item because x < undefined === false for any x (typeof string)
              if (rank < previousRanks[previousRanks.length - 1]) {
                context.report({
                  node: member,
                  messageId: 'incorrectGroupOrder',
                  data: {
                    name: getMemberName(member, context.getSourceCode()),
                    rank: getLowestRank(previousRanks, rank, memberGroupsOrder),
                  },
                });
              } else if (rank === previousRanks[previousRanks.length - 1]) {
                // Same member group --> Check alphabetic order
                if (name) {
                  // Not all members have sortable identifiers
                  if (previousName) {
                    if (name < previousName) {
                      context.report({
                        node: member,
                        messageId: 'incorrectOrder',
                        data: {
                          member: name,
                          beforeMember: previousName,
                        },
                      });
                    }

                    previousName = name;
                  }
                }
              } else {
                previousRanks.push(rank);

                if (name) {
                  previousName = name;
                }
              }
            }
          });
        }
      }
    }

    return {
      ClassDeclaration(node): void {
        validateMembersOrder(
          node.body.body,
          options.classes ?? options.default!,
          true,
        );
      },
      ClassExpression(node): void {
        validateMembersOrder(
          node.body.body,
          options.classExpressions ?? options.default!,
          true,
        );
      },
      TSInterfaceDeclaration(node): void {
        validateMembersOrder(
          node.body.body,
          options.interfaces ?? options.default!,
          false,
        );
      },
      TSTypeLiteral(node): void {
        validateMembersOrder(
          node.members,
          options.typeLiterals ?? options.default!,
          false,
        );
      },
    };
  },
});
