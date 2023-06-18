import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { JSONSchema4 } from 'json-schema';
import * as tsutils from 'tsutils';
import type * as ts from 'typescript';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule, getParserServices, isTypeAnyType } from '../util';
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
  create(
    context,
    [
      enabledTypes,
      {
        enforceForRenamedProperties = false,
        enforceForTypeAnnotatedProperties = false,
      } = {},
    ],
  ) {
    return {
      VariableDeclarator(node): void {
        performCheck(node.id, node.init, node);
      },
      AssignmentExpression(node): void {
        performCheck(node.left, node.right, node);
      },
    };

    function performCheck(
      leftNode: TSESTree.BindingName | TSESTree.Expression,
      rightNode: TSESTree.Expression | null,
      reportNode: TSESTree.VariableDeclarator | TSESTree.AssignmentExpression,
    ): void {
      const { program, esTreeNodeToTSNodeMap } = getParserServices(context);
      const typeChecker = program.getTypeChecker();
      const baseRules = baseRule.create(context);
      const rules =
        leftNode.type === AST_NODE_TYPES.Identifier &&
        leftNode.typeAnnotation === undefined
          ? baseRules
          : baseRule.create(noFixContext(context));
      if (
        'typeAnnotation' in leftNode &&
        leftNode.typeAnnotation !== undefined &&
        !enforceForTypeAnnotatedProperties
      ) {
        return;
      }

      if (rightNode != null && isArrayLiteralIntegerIndexAccess(rightNode)) {
        const tsObj = esTreeNodeToTSNodeMap.get(rightNode.object);
        const objType = typeChecker.getTypeAtLocation(tsObj);
        if (!isTypeIterableType(objType, typeChecker)) {
          if (
            !enforceForRenamedProperties ||
            !getNormalizedEnabledType(reportNode.type, 'object')
          ) {
            return;
          }
          context.report({
            node: reportNode,
            messageId: 'preferDestructuring',
            data: { type: 'object' },
          });
          return;
        }
      }

      if (reportNode.type === AST_NODE_TYPES.AssignmentExpression) {
        rules.AssignmentExpression(reportNode);
      } else {
        rules.VariableDeclarator(reportNode);
      }
    }

    function getNormalizedEnabledType(
      nodeType:
        | AST_NODE_TYPES.VariableDeclarator
        | AST_NODE_TYPES.AssignmentExpression,
      destructuringType: 'array' | 'object',
    ): boolean | undefined {
      if (enabledTypes === undefined) {
        return true;
      }
      if ('object' in enabledTypes || 'array' in enabledTypes) {
        return enabledTypes[destructuringType];
      }
      return enabledTypes[nodeType as keyof typeof enabledTypes]?.[
        destructuringType as keyof typeof enabledTypes[keyof typeof enabledTypes]
      ];
    }
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

function isTypeIterableType(
  type: ts.Type,
  typeChecker: ts.TypeChecker,
): boolean {
  if (isTypeAnyType(type)) {
    return true;
  }
  if (!type.isUnion()) {
    const iterator = tsutils.getWellKnownSymbolPropertyOfType(
      type,
      'iterator',
      typeChecker,
    );
    return iterator !== undefined;
  }
  return type.types.every(t => isTypeIterableType(t, typeChecker));
}

function isArrayLiteralIntegerIndexAccess(
  node: TSESTree.Expression,
): node is TSESTree.MemberExpression {
  if (node.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }
  if (node.property.type !== AST_NODE_TYPES.Literal) {
    return false;
  }
  return Number.isInteger(node.property.value);
}
