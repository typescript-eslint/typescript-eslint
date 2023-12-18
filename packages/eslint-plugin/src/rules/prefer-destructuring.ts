import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';
import * as tsutils from 'ts-api-utils';
import type * as ts from 'typescript';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule, getParserServices, isTypeAnyType } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('prefer-destructuring');

type BaseOptions = InferOptionsTypeFromRule<typeof baseRule>;
type EnforcementOptions = BaseOptions[1] & {
  enforceForDeclarationWithTypeAnnotation?: boolean;
};
type Options = [BaseOptions[0], EnforcementOptions];

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
      enforceForDeclarationWithTypeAnnotation: {
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
      extendsBaseRule: true,
      requiresTypeChecking: true,
    },
    schema,
    fixable: baseRule.meta.fixable,
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
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
    {},
  ],
  create(context, [enabledTypes, options]) {
    const {
      enforceForRenamedProperties = false,
      enforceForDeclarationWithTypeAnnotation = false,
    } = options;
    const { program, esTreeNodeToTSNodeMap } = getParserServices(context);
    const typeChecker = program.getTypeChecker();
    const baseRules = baseRule.create(context);
    let baseRulesWithoutFixCache: typeof baseRules | null = null;

    return {
      VariableDeclarator(node): void {
        performCheck(node.id, node.init, node);
      },
      AssignmentExpression(node): void {
        if (node.operator !== '=') {
          return;
        }
        performCheck(node.left, node.right, node);
      },
    };

    function performCheck(
      leftNode: TSESTree.BindingName | TSESTree.Expression,
      rightNode: TSESTree.Expression | null,
      reportNode: TSESTree.VariableDeclarator | TSESTree.AssignmentExpression,
    ): void {
      const rules =
        leftNode.type === AST_NODE_TYPES.Identifier &&
        leftNode.typeAnnotation === undefined
          ? baseRules
          : baseRulesWithoutFix();
      if (
        'typeAnnotation' in leftNode &&
        leftNode.typeAnnotation !== undefined &&
        !enforceForDeclarationWithTypeAnnotation
      ) {
        return;
      }

      if (
        rightNode != null &&
        isArrayLiteralIntegerIndexAccess(rightNode) &&
        rightNode.object.type !== AST_NODE_TYPES.Super
      ) {
        const tsObj = esTreeNodeToTSNodeMap.get(rightNode.object);
        const objType = typeChecker.getTypeAtLocation(tsObj);
        if (!isTypeAnyOrIterableType(objType, typeChecker)) {
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
      if ('object' in enabledTypes || 'array' in enabledTypes) {
        return enabledTypes[destructuringType];
      }
      return enabledTypes[nodeType as keyof typeof enabledTypes][
        destructuringType as keyof (typeof enabledTypes)[keyof typeof enabledTypes]
      ];
    }

    function baseRulesWithoutFix(): ReturnType<typeof baseRule.create> {
      baseRulesWithoutFixCache ??= baseRule.create(noFixContext(context));
      return baseRulesWithoutFixCache;
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

function isTypeAnyOrIterableType(
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
  return type.types.every(t => isTypeAnyOrIterableType(t, typeChecker));
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
