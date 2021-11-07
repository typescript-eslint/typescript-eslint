import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
  JSONSchema,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export type MessageIds = 'incorrectGroupOrder' | 'incorrectOrder';

const classBasicMemberTypes = ['signature', 'call-signature', 'constructor'];
const modifyableMemberTypes = ['field', 'method', 'get', 'set'];
const baseMemberTypes = [
  ...classBasicMemberTypes,
  ...modifyableMemberTypes,
] as const;
type BaseMemberType = typeof baseMemberTypes[number];

const accessabilityTypes = ['public', 'protected', 'private'] as const;
type AccessabilityType = typeof accessabilityTypes[number];
const scopeTypes = ['static', 'instance', 'abstract'] as const;
type ScopeType = typeof scopeTypes[number];

const allBasicMemberTypes = [
  'signature',
  ...['call-signature', 'constructor'].reduce(
    (accessibleBaseTypes: string[], baseMemberType) => [
      ...accessibleBaseTypes,
      baseMemberType,
      ...accessabilityTypes.map(
        accessability => `${accessability}-${baseMemberType}`,
      ),
    ],
    [],
  ),
  ...scopeTypes.map(scope => `${scope}-call-signature`),
  ...accessabilityTypes.reduce(
    (accessibleCallSigs: string[], accessability) => [
      ...accessibleCallSigs,
      ...scopeTypes.reduce(
        (accessibleScopeCallSigs: string[], scope) => [
          ...accessibleScopeCallSigs,
          `${accessability}-${scope}-call-signature`,
        ],
        [],
      ),
    ],
    [],
  ),
];
const allModifiableMemberTypes = [
  ...modifyableMemberTypes.reduce(
    (accessibleMemberTypes: string[], memberType) => [
      ...accessibleMemberTypes,
      memberType,
      `decorated-${memberType}`,
      ...scopeTypes.map(scope => `${scope}-${memberType}`),
      ...accessabilityTypes.reduce(
        (acessibleScopedMemberTypes: string[], accesability) => [
          ...acessibleScopedMemberTypes,
          `${accesability}-${memberType}`,
          `${accesability}-decorated-${memberType}`,
          ...scopeTypes.map(scope => `${accesability}-${scope}-${memberType}`),
        ],
        [],
      ),
    ],
    [],
  ),
];
const allMemberTypes = [...allBasicMemberTypes, ...allModifiableMemberTypes];

const allMemberTypesConst = [
  ...allBasicMemberTypes,
  ...allModifiableMemberTypes,
] as const;
type MemberType = typeof allMemberTypesConst[number];
interface SortedOrderConfig {
  memberTypes?: MemberType[] | 'never';
  order: 'alphabetically' | 'as-written';
}

type OrderConfig = MemberType[] | SortedOrderConfig | 'never';
type Member = TSESTree.ClassElement | TSESTree.TypeElement;

export type Options = [
  {
    default?: OrderConfig;
    classes?: OrderConfig;
    classExpressions?: OrderConfig;
    interfaces?: OrderConfig;
    typeLiterals?: OrderConfig;
  },
];

const neverConfig: JSONSchema.JSONSchema4 = {
  type: 'string',
  enum: ['never'],
};

const arrayConfig = (memberTypes: MemberType[]): JSONSchema.JSONSchema4 => ({
  type: 'array',
  items: {
    enum: memberTypes,
  },
});

const objectConfig = (memberTypes: MemberType[]): JSONSchema.JSONSchema4 => ({
  type: 'object',
  properties: {
    memberTypes: {
      oneOf: [arrayConfig(memberTypes), neverConfig],
    },
    order: {
      type: 'string',
      enum: ['alphabetically', 'as-written'],
    },
  },
  additionalProperties: false,
});

/**
 * Shortcut function to build default order config
 * @param baseType member base type to build default order for
 * @returns array with default order for base type
 */
const defaultMemberTypeOrder = (baseType: BaseMemberType): MemberType[] => [
  ...['-static', '-decorated', '-instance', '-abstract', ''].reduce(
    (acc: string[], scopePart) =>
      acc.concat(
        accessabilityTypes.map(accType => `${accType}${scopePart}-${baseType}`),
      ),
    [],
  ),
  ...scopeTypes.map(scope => `${scope}-${baseType}`),
  `decorated-${baseType}`,
  baseType,
];

export const defaultOrder: MemberType[] = [
  // Index signature
  'signature',
  'call-signature',

  ...defaultMemberTypeOrder('field'), // Fields

  // Constructors
  ...accessabilityTypes.map(accType => `${accType}-constructor`),
  'constructor',

  ...defaultMemberTypeOrder('get'), // Getters
  ...defaultMemberTypeOrder('set'), // Setters
  ...defaultMemberTypeOrder('method'), // Methods
];

const functionExpressions = [
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
];

/**
 * Gets the node type.
 *
 * @param node the node to be evaluated.
 */
function getNodeType(node: Member): BaseMemberType | null {
  switch (node.type) {
    case AST_NODE_TYPES.TSAbstractMethodDefinition:
    case AST_NODE_TYPES.MethodDefinition:
      return node.kind;
    case AST_NODE_TYPES.TSMethodSignature:
      return 'method';
    case AST_NODE_TYPES.TSCallSignatureDeclaration:
      return 'call-signature';
    case AST_NODE_TYPES.TSConstructSignatureDeclaration:
      return 'constructor';
    case AST_NODE_TYPES.TSAbstractPropertyDefinition:
      return 'field';
    case AST_NODE_TYPES.PropertyDefinition:
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
  node: Member,
  sourceCode: TSESLint.SourceCode,
): string | null {
  switch (node.type) {
    case AST_NODE_TYPES.TSPropertySignature:
    case AST_NODE_TYPES.TSMethodSignature:
    case AST_NODE_TYPES.TSAbstractPropertyDefinition:
    case AST_NODE_TYPES.PropertyDefinition:
      return util.getNameFromMember(node, sourceCode).name;
    case AST_NODE_TYPES.TSAbstractMethodDefinition:
    case AST_NODE_TYPES.MethodDefinition:
      return node.kind === 'constructor'
        ? 'constructor'
        : util.getNameFromMember(node, sourceCode).name;
    case AST_NODE_TYPES.TSConstructSignatureDeclaration:
      return 'new';
    case AST_NODE_TYPES.TSCallSignatureDeclaration:
      return 'call';
    case AST_NODE_TYPES.TSIndexSignature:
      return util.getNameFromIndexSignature(node);
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
function getRankOrder(
  memberGroups: MemberType[],
  orderConfig: MemberType[],
): number {
  let rank = -1;
  const stack = memberGroups.slice(); // Get a copy of the member groups

  while (stack.length > 0 && rank === -1) {
    rank = orderConfig.indexOf(stack.shift()!);
  }

  return rank;
}

/**
 * Weather node is abstract
 * @param node the node to be evaluated.
 * @returns true if node is abstract
 */
const isAbstract = (node: Member): boolean =>
  [
    AST_NODE_TYPES.TSAbstractPropertyDefinition,
    AST_NODE_TYPES.TSAbstractMethodDefinition,
  ].includes(node.type);

/**
 * Weather node has a decorator
 * @param node the node to be evaluated.
 * @returns true if node has decorator
 */
const isDecorated = (node: Member): boolean =>
  'decorators' in node && node.decorators!.length > 0;

/**
 * Extract member nodes scope
 * @param node the node to be evaluated.
 * @returns the nodes scope type
 */
const getNodeScope = (node: Member): ScopeType => {
  if ('static' in node && node.static) {
    return 'static';
  }
  return isAbstract(node) ? 'abstract' : 'instance';
};

/**
 * Extract accessability of member
 * @param node the node to be evaluated.
 * @returns the nodes accessability.
 */
const getNodeAccessability = (node: Member): AccessabilityType =>
  'accessibility' in node && node.accessibility ? node.accessibility : 'public';

/**
 * Extract member type groups from node that supports modifiers
 * @param node the node to be evaluated.
 * @param type the nodes base member type
 * @returns the member nodes accessability, scope and decorated MemberTypes
 */
const getNodeMemberGroups = (
  node: Member,
  type: BaseMemberType,
): MemberType[] => {
  const accessibility = getNodeAccessability(node);
  const scope = getNodeScope(node);

  const decoratedGroups = (): MemberType[] =>
    isDecorated(node) && modifyableMemberTypes.includes(type)
      ? [`${accessibility}-decorated-${type}`, `decorated-${type}`]
      : [];
  const scopeGroups = (): MemberType[] =>
    type === 'constructor'
      ? []
      : [`${accessibility}-${scope}-${type}`, `${scope}-${type}`];

  return [
    ...decoratedGroups(),
    ...scopeGroups(),
    `${accessibility}-${type}`,
    type,
  ];
};

/**
 * Gets the rank of the node given the order.
 * @param node the node to be evaluated.
 * @param orderConfig the current order to be validated.
 * @param supportsModifiers a flag indicating whether the type supports modifiers (scope or accessibility) or not.
 * @returns Index of the matching member type in the order configuration.
 */
function getRank(
  node: Member,
  orderConfig: MemberType[],
  supportsModifiers: boolean,
): number {
  const type = getNodeType(node);
  if (type === null) {
    // shouldn't happen but just in case, put it on the end
    return orderConfig.length - 1;
  }
  const memberGroups = supportsModifiers
    ? getNodeMemberGroups(node, type)
    : [type];
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
  order: MemberType[],
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
      recommended: false,
    },
    messages: {
      incorrectOrder:
        'Member {{member}} should be declared before member {{beforeMember}}.',
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
              arrayConfig(allMemberTypes),
              objectConfig(allMemberTypes),
            ],
          },
          classes: {
            oneOf: [
              neverConfig,
              arrayConfig(allMemberTypes),
              objectConfig(allMemberTypes),
            ],
          },
          classExpressions: {
            oneOf: [
              neverConfig,
              arrayConfig(allMemberTypes),
              objectConfig(allMemberTypes),
            ],
          },
          interfaces: {
            oneOf: [
              neverConfig,
              arrayConfig(['signature', 'field', 'method', 'constructor']),
              objectConfig(['signature', 'field', 'method', 'constructor']),
            ],
          },
          typeLiterals: {
            oneOf: [
              neverConfig,
              arrayConfig(['signature', 'field', 'method', 'constructor']),
              objectConfig(['signature', 'field', 'method', 'constructor']),
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
     * Checks if the member groups are correctly sorted.
     *
     * @param members Members to be validated.
     * @param groupOrder Group order to be validated.
     * @param supportsModifiers A flag indicating whether the type supports modifiers (scope or accessibility) or not.
     *
     * @return Array of member groups or null if one of the groups is not correctly sorted.
     */
    function checkGroupSort(
      members: Member[],
      groupOrder: MemberType[],
      supportsModifiers: boolean,
    ): Array<Member[]> | null {
      const previousRanks: number[] = [];
      const memberGroups: Array<Member[]> = [];
      let isCorrectlySorted = true;

      // Find first member which isn't correctly sorted
      members.forEach(member => {
        const rank = getRank(member, groupOrder, supportsModifiers);
        const name = getMemberName(member, context.getSourceCode());
        const rankLastMember = previousRanks[previousRanks.length - 1];

        if (rank === -1) {
          return;
        }

        // Works for 1st item because x < undefined === false for any x (typeof string)
        if (rank < rankLastMember) {
          context.report({
            node: member,
            messageId: 'incorrectGroupOrder',
            data: {
              name,
              rank: getLowestRank(previousRanks, rank, groupOrder),
            },
          });

          isCorrectlySorted = false;
        } else if (rank === rankLastMember) {
          // Same member group --> Push to existing member group array
          memberGroups[memberGroups.length - 1].push(member);
        } else {
          // New member group --> Create new member group array
          previousRanks.push(rank);
          memberGroups.push([member]);
        }
      });

      return isCorrectlySorted ? memberGroups : null;
    }

    /**
     * Checks if the members are alphabetically sorted.
     *
     * @param members Members to be validated.
     *
     * @return True if all members are correctly sorted.
     */
    function checkAlphaSort(members: Member[]): boolean {
      let previousName = '';
      let isCorrectlySorted = true;

      // Find first member which isn't correctly sorted
      members.forEach(member => {
        const name = getMemberName(member, context.getSourceCode());

        // Note: Not all members have names
        if (name) {
          if (name < previousName) {
            context.report({
              node: member,
              messageId: 'incorrectOrder',
              data: {
                member: name,
                beforeMember: previousName,
              },
            });

            isCorrectlySorted = false;
          }

          previousName = name;
        }
      });

      return isCorrectlySorted;
    }

    /**
     * Validates if all members are correctly sorted.
     *
     * @param members Members to be validated.
     * @param orderConfig Order config to be validated.
     * @param supportsModifiers A flag indicating whether the type supports modifiers (scope or accessibility) or not.
     */
    function validateMembersOrder(
      members: Member[],
      orderConfig: OrderConfig,
      supportsModifiers: boolean,
    ): void {
      if (orderConfig === 'never') {
        return;
      }

      // Standardize config
      let order = null;
      let memberTypes;

      if (Array.isArray(orderConfig)) {
        memberTypes = orderConfig;
      } else {
        order = orderConfig.order;
        memberTypes = orderConfig.memberTypes;
      }

      // Check order
      if (Array.isArray(memberTypes)) {
        const grouped = checkGroupSort(members, memberTypes, supportsModifiers);

        if (grouped === null) {
          return;
        }

        if (order === 'alphabetically') {
          grouped.some(groupMember => !checkAlphaSort(groupMember));
        }
      } else if (order === 'alphabetically') {
        checkAlphaSort(members);
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
