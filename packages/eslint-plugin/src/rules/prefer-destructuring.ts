import type { TSESLint } from '@typescript-eslint/utils';
import type { JSONSchema4 } from 'json-schema';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('prefer-destructuring');

type BaseOptions = InferOptionsTypeFromRule<typeof baseRule>;
type FullBaseOptions = BaseOptions & [unknown, unknown];
type Options0 = FullBaseOptions[0];
type Options1 = FullBaseOptions[1] & {
  enforceForTypeAnnotatedProperties?: boolean;
};
type Options = [] | [Options0] | [Options0, Options1];

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
  create(context, [, { enforceForTypeAnnotatedProperties = false } = {}]) {
    const rules = baseRule.create(context);
    return {
      VariableDeclarator(node): void {
        if (node.id.typeAnnotation === undefined) {
          rules.VariableDeclarator(node);
          return;
        }
        if (!enforceForTypeAnnotatedProperties) {
          return;
        }
        const noFixRules = baseRule.create(noFixContext(context));
        noFixRules.VariableDeclarator(node);
      },
      AssignmentExpression(node): void {
        rules.AssignmentExpression(node);
      },
    };
  },
});

type Context = TSESLint.RuleContext<MessageIds, Options>;

function noFixContext(context: Context): Context {
  const customContext: {
    report: Context['report'];
  } = {
    report: (descriptor): void => {
      context.report({
        ...descriptor,
        fix: undefined,
      });
    },
  };

  // we can't directly proxy `context` because its `report` property is non-configurable
  // and non-writable. So we proxy `customContext` and redirect all
  // property access to the original context except for `report`
  return new Proxy<Context>(customContext as typeof context, {
    get(target, path, receiver): unknown {
      if (path !== 'report') {
        return Reflect.get(context, path, receiver);
      }
      return Reflect.get(target, path, receiver);
    },
  });
}
