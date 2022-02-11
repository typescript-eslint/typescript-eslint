import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
  JSONSchema,
} from '@typescript-eslint/utils';
import * as util from '../util';

export type MessageIds = 'incorrectGroupOrder' | 'incorrectOrder';

type Order =
  | 'alphabetically'
  | 'alphabetically-case-insensitive'
  | 'as-written';

type MemberType = string | string[];

interface SortedOrderConfig {
  memberTypes?: MemberType[] | 'never';
  order: Order;
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
    oneOf: [
      {
        enum: memberTypes,
      },
      {
        type: 'array',
        items: {
          enum: memberTypes,
        },
      },
    ],
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
      enum: ['alphabetically', 'alphabetically-case-insensitive', 'as-written'],
    },
  },
  additionalProperties: false,
});

export const defaultOrder = [
  // Index signature
  'signature',
  'call-signature',

  // Fields
  'public-static-field',
  'protected-static-field',
  'private-static-field',

  'public-decorated-field',
  'protected-decorated-field',
  'private-decorated-field',

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

  'decorated-field',

  'field',

  // Constructors
  'public-constructor',
  'protected-constructor',
  'private-constructor',

  'constructor',

  // Getters
  'public-static-get',
  'protected-static-get',
  'private-static-get',

  'public-decorated-get',
  'protected-decorated-get',
  'private-decorated-get',

  'public-instance-get',
  'protected-instance-get',
  'private-instance-get',

  'public-abstract-get',
  'protected-abstract-get',
  'private-abstract-get',

  'public-get',
  'protected-get',
  'private-get',

  'static-get',
  'instance-get',
  'abstract-get',

  'decorated-get',

  'get',

  // Setters
  'public-static-set',
  'protected-static-set',
  'private-static-set',

  'public-decorated-set',
  'protected-decorated-set',
  'private-decorated-set',

  'public-instance-set',
  'protected-instance-set',
  'private-instance-set',

  'public-abstract-set',
  'protected-abstract-set',
  'private-abstract-set',

  'public-set',
  'protected-set',
  'private-set',

  'static-set',
  'instance-set',
  'abstract-set',

  'decorated-set',

  'set',

  // Methods
  'public-static-method',
  'protected-static-method',
  'private-static-method',

  'public-decorated-method',
  'protected-decorated-method',
  'private-decorated-method',

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

  'decorated-method',

  'method',
];

const allMemberTypes = [
  'signature',
  'field',
  'method',
  'call-signature',
  'constructor',
  'get',
  'set',
].reduce<string[]>((all, type) => {
  all.push(type);

  ['public', 'protected', 'private'].forEach(accessibility => {
    if (type !== 'signature') {
      all.push(`${accessibility}-${type}`); // e.g. `public-field`
    }

    // Only class instance fields, methods, get and set can have decorators attached to them
    if (
      type === 'field' ||
      type === 'method' ||
      type === 'get' ||
      type === 'set'
    ) {
      const decoratedMemberType = `${accessibility}-decorated-${type}`;
      const decoratedMemberTypeNoAccessibility = `decorated-${type}`;
      if (!all.includes(decoratedMemberType)) {
        all.push(decoratedMemberType);
      }
      if (!all.includes(decoratedMemberTypeNoAccessibility)) {
        all.push(decoratedMemberTypeNoAccessibility);
      }
    }

    if (type !== 'constructor' && type !== 'signature') {
      // There is no `static-constructor` or `instance-constructor` or `abstract-constructor`
      ['static', 'instance', 'abstract'].forEach(scope => {
        if (!all.includes(`${scope}-${type}`)) {
          all.push(`${scope}-${type}`);
        }

        all.push(`${accessibility}-${scope}-${type}`);
      });
    }
  });

  return all;
}, []);

const functionExpressions = [
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
];

/**
 * Gets the node type.
 *
 * @param node the node to be evaluated.
 */
function getNodeType(node: Member): string | null {
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
 * Gets the raw string value of a member's name
 */
function getMemberRawName(
  member:
    | TSESTree.MethodDefinition
    | TSESTree.TSMethodSignature
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.PropertyDefinition
    | TSESTree.TSAbstractPropertyDefinition
    | TSESTree.Property
    | TSESTree.TSPropertySignature,
  sourceCode: TSESLint.SourceCode,
): string {
  const { name, type } = util.getNameFromMember(member, sourceCode);

  if (type === util.MemberNameType.Quoted) {
    return name.substr(1, name.length - 2);
  }
  if (type === util.MemberNameType.Private) {
    return name.substr(1);
  }
  return name;
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
      return getMemberRawName(node, sourceCode);
    case AST_NODE_TYPES.TSAbstractMethodDefinition:
    case AST_NODE_TYPES.MethodDefinition:
      return node.kind === 'constructor'
        ? 'constructor'
        : getMemberRawName(node, sourceCode);
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
  memberGroups: string[],
  orderConfig: MemberType[],
): number {
  let rank = -1;
  const stack = memberGroups.slice(); // Get a copy of the member groups

  while (stack.length > 0 && rank === -1) {
    const memberGroup = stack.shift()!;
    rank = orderConfig.findIndex(memberType =>
      Array.isArray(memberType)
        ? memberType.includes(memberGroup)
        : memberType === memberGroup,
    );
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
  node: Member,
  orderConfig: MemberType[],
  supportsModifiers: boolean,
): number {
  const type = getNodeType(node);

  if (type === null) {
    // shouldn't happen but just in case, put it on the end
    return orderConfig.length - 1;
  }

  const abstract =
    node.type === AST_NODE_TYPES.TSAbstractPropertyDefinition ||
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
    const decorated = 'decorators' in node && node.decorators!.length > 0;
    if (
      decorated &&
      (type === 'field' ||
        type === 'method' ||
        type === 'get' ||
        type === 'set')
    ) {
      memberGroups.push(`${accessibility}-decorated-${type}`);
      memberGroups.push(`decorated-${type}`);
    }

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
 * Gets the lowest possible rank(s) higher than target.
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
 * If a lowest possible rank is a member group, a comma separated list of ranks is returned.
 * @param ranks the existing ranks in the object.
 * @param target the target rank.
 * @param order the current order to be validated.
 * @returns the name(s) of the lowest possible rank without dashes (-).
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

  const lowestRank = order[lowest];
  const lowestRanks = Array.isArray(lowestRank) ? lowestRank : [lowestRank];
  return lowestRanks.map(rank => rank.replace(/-/g, ' ')).join(', ');
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
     * @param caseSensitive indicates if the alpha ordering is case sensitive or not.
     *
     * @return True if all members are correctly sorted.
     */
    function checkAlphaSort(
      members: Member[],
      caseSensitive: boolean,
    ): boolean {
      let previousName = '';
      let isCorrectlySorted = true;

      // Find first member which isn't correctly sorted
      members.forEach(member => {
        const name = getMemberName(member, context.getSourceCode());

        // Note: Not all members have names
        if (name) {
          if (
            caseSensitive
              ? name < previousName
              : name.toLowerCase() < previousName.toLowerCase()
          ) {
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
      let order: Order | null = null;
      let memberTypes;

      if (Array.isArray(orderConfig)) {
        memberTypes = orderConfig;
      } else {
        order = orderConfig.order;
        memberTypes = orderConfig.memberTypes;
      }

      const hasAlphaSort = order?.startsWith('alphabetically');
      const alphaSortIsCaseSensitive =
        order !== 'alphabetically-case-insensitive';

      // Check order
      if (Array.isArray(memberTypes)) {
        const grouped = checkGroupSort(members, memberTypes, supportsModifiers);

        if (grouped === null) {
          return;
        }

        if (hasAlphaSort) {
          grouped.some(
            groupMember =>
              !checkAlphaSort(groupMember, alphaSortIsCaseSensitive),
          );
        }
      } else if (hasAlphaSort) {
        checkAlphaSort(members, alphaSortIsCaseSensitive);
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
