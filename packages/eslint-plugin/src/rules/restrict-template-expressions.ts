import {
  typeMatchesSomeSpecifier,
  typeOrValueSpecifiersSchema,
} from '@typescript-eslint/type-utils';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { Type, TypeChecker } from 'typescript';
import { TypeFlags } from 'typescript';

import type { TypeOrValueSpecifier } from '../util';
import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getTypeName,
  isTypeAnyType,
  isTypeFlagSet,
  isTypeNeverType,
} from '../util';

type OptionTester = (
  type: Type,
  checker: TypeChecker,
  recursivelyCheckType: (type: Type) => boolean,
) => boolean;

const testTypeFlag =
  (flagsToCheck: TypeFlags): OptionTester =>
  type =>
    isTypeFlagSet(type, flagsToCheck);

const optionTesters = (
  [
    ['Any', isTypeAnyType],
    [
      'Array',
      (type, checker, recursivelyCheckType): boolean =>
        (checker.isArrayType(type) || checker.isTupleType(type)) &&
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        recursivelyCheckType(type.getNumberIndexType()!),
    ],
    // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
    ['Boolean', testTypeFlag(TypeFlags.BooleanLike)],
    ['Nullish', testTypeFlag(TypeFlags.Null | TypeFlags.Undefined)],
    ['Number', testTypeFlag(TypeFlags.NumberLike | TypeFlags.BigIntLike)],
    [
      'RegExp',
      (type, checker): boolean => getTypeName(checker, type) === 'RegExp',
    ],
    ['Never', isTypeNeverType],
  ] as const satisfies [string, OptionTester][]
).map(([type, tester]) => ({
  type,
  option: `allow${type}` as const,
  tester,
}));
type Options = [
  { [Type in (typeof optionTesters)[number]['option']]?: boolean } & {
    allow?: TypeOrValueSpecifier[];
  },
];

type MessageId = 'invalidType';

export default createRule<Options, MessageId>({
  name: 'restrict-template-expressions',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce template literal expressions to be of `string` type',
      recommended: {
        recommended: true,
        strict: [
          {
            allowAny: false,
            allowBoolean: false,
            allowNullish: false,
            allowNumber: false,
            allowRegExp: false,
            allowNever: false,
          },
        ],
      },
      requiresTypeChecking: true,
    },
    messages: {
      invalidType: 'Invalid type "{{type}}" of template literal expression.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ...Object.fromEntries(
            optionTesters.map(({ option, type }) => [
              option,
              {
                description: `Whether to allow \`${type.toLowerCase()}\` typed values in template expressions.`,
                type: 'boolean',
              },
            ]),
          ),
          allow: {
            description: `Types to allow in template expressions.`,
            ...typeOrValueSpecifiersSchema,
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowAny: true,
      allowBoolean: true,
      allowNullish: true,
      allowNumber: true,
      allowRegExp: true,
      allow: [{ from: 'lib', name: ['Error', 'URL', 'URLSearchParams'] }],
    },
  ],
  create(context, [{ allow, ...options }]) {
    const services = getParserServices(context);
    const { program } = services;
    const checker = program.getTypeChecker();
    const enabledOptionTesters = optionTesters.filter(
      ({ option }) => options[option],
    );

    return {
      TemplateLiteral(node: TSESTree.TemplateLiteral): void {
        // don't check tagged template literals
        if (node.parent.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          return;
        }

        for (const expression of node.expressions) {
          const expressionType = getConstrainedTypeAtLocation(
            services,
            expression,
          );

          if (!recursivelyCheckType(expressionType)) {
            context.report({
              node: expression,
              messageId: 'invalidType',
              data: { type: checker.typeToString(expressionType) },
            });
          }
        }
      },
    };

    function recursivelyCheckType(innerType: Type): boolean {
      if (innerType.isUnion()) {
        return innerType.types.every(recursivelyCheckType);
      }

      if (innerType.isIntersection()) {
        return innerType.types.some(recursivelyCheckType);
      }

      return (
        isTypeFlagSet(innerType, TypeFlags.StringLike) ||
        typeMatchesSomeSpecifier(innerType, allow, program) ||
        enabledOptionTesters.some(({ tester }) =>
          tester(innerType, checker, recursivelyCheckType),
        )
      );
    }
  },
});
