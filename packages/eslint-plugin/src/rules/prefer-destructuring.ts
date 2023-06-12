import type { JSONSchema4 } from 'json-schema';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('prefer-destructuring');

type BaseOptions = InferOptionsTypeFromRule<typeof baseRule>;
type Options = [
  BaseOptions[0],
  BaseOptions[1] & {
    enforceForTypeAnnotatedProperties?: boolean;
  },
];
type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

const destructuringTypeConfig: JSONSchema4 = {
  type: 'object',
  properties: {
    array: {
      type: 'boolean',
    },
    object: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
};

const schema: readonly JSONSchema4[] = [
  {
    oneOf: [
      {
        type: 'object',
        properties: {
          VariableDeclarator: destructuringTypeConfig,
          AssignmentExpression: destructuringTypeConfig,
        },
        additionalProperties: false,
      },
      destructuringTypeConfig,
    ],
  },
  {
    type: 'object',
    properties: {
      enforceForRenamedProperties: {
        type: 'boolean',
      },
      enforceForTypeAnnotatedProperties: {
        type: 'boolean',
      },
    },
  },
];

export default createRule<Options, MessageIds>({
  name: 'prefer-destructuring',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require destructuring from arrays and/or objects',
      recommended: false,
      extendsBaseRule: true,
      requiresTypeChecking: false,
    },
    schema,
    fixable: baseRule.meta?.fixable,
    hasSuggestions: baseRule.meta?.hasSuggestions,
    messages: baseRule.meta?.messages,
  },
  defaultOptions: [
    {
      VariableDeclarator: {
        array: true,
        object: true,
      },
      AssignmentExpression: {
        array: true,
        object: true,
      },
    },
    {
      enforceForRenamedProperties: false,
      enforceForTypeAnnotatedProperties: false,
    },
  ],
  create(context, [, { enforceForTypeAnnotatedProperties = false }]) {
    const rules = baseRule.create(context);
    return {
      VariableDeclarator(node): void {
        if (
          node.id.typeAnnotation !== undefined &&
          !enforceForTypeAnnotatedProperties
        ) {
          return;
        }
        rules.VariableDeclarator(node);
      },
      AssignmentExpression(node): void {
        rules.AssignmentExpression(node);
      },
    };
  },
});
