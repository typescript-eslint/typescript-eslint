import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

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
  type: ts.Type,
  checker: ts.TypeChecker,
  recursivelyCheckType: (type: ts.Type) => boolean,
) => boolean;

const optionTesters = (
  [
    ['Any', isTypeAnyType],
    [
      'Array',
      (type, checker, recursivelyCheckType): boolean => {
        const maybeNumberIndexType =
          checker.isArrayType(type) && type.getNumberIndexType();
        return (
          !maybeNumberIndexType || recursivelyCheckType(maybeNumberIndexType)
        );
      },
    ],
    [
      'Boolean', // eslint-disable-line @typescript-eslint/internal/prefer-ast-types-enum
      (type): boolean => isTypeFlagSet(type, ts.TypeFlags.BooleanLike),
    ],
    [
      'Nullish',
      (type): boolean =>
        isTypeFlagSet(type, ts.TypeFlags.Null | ts.TypeFlags.Undefined),
    ],
    [
      'Number',
      (type): boolean =>
        isTypeFlagSet(type, ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike),
    ],
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
  { [Type in (typeof optionTesters)[number]['option']]?: boolean },
];

type MessageId = 'invalidType';

export default createRule<Options, MessageId>({
  name: 'restrict-template-expressions',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce template literal expressions to be of `string` type',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      invalidType: 'Invalid type "{{type}}" of template literal expression.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: Object.fromEntries(
          optionTesters.map(({ option, type }) => [
            option,
            {
              description: `Whether to allow \`${type.toLowerCase()}\` typed values in template expressions.`,
              type: 'boolean',
            },
          ]),
        ),
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
    },
  ],
  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
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

    function recursivelyCheckType(innerType: ts.Type): boolean {
      if (innerType.isUnion()) {
        return innerType.types.every(recursivelyCheckType);
      }

      if (innerType.isIntersection()) {
        return innerType.types.some(recursivelyCheckType);
      }

      return (
        isTypeFlagSet(innerType, ts.TypeFlags.StringLike) ||
        enabledOptionTesters.some(({ tester }) =>
          tester(innerType, checker, recursivelyCheckType),
        )
      );
    }
  },
});
