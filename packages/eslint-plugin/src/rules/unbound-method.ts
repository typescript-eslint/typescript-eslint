import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getModifiers,
  getParserServices,
  isIdentifier,
} from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

interface Config {
  ignoreStatic: boolean;
}

export type Options = [Config];

export type MessageIds = 'unbound' | 'unboundWithoutThisAnnotation';

/**
 * Static methods on these globals are either not `this`-aware or supported being
 * called without `this`.
 *
 * - `Promise` is not in the list because it supports subclassing by using `this`
 * - `Array` is in the list because although it supports subclassing, the `this`
 *   value defaults to `Array` when unbound
 *
 * This is now a language-design invariant: static methods are never `this`-aware
 * because TC39 wants to make `array.map(Class.method)` work!
 */
const SUPPORTED_GLOBALS = [
  'Number',
  'Object',
  'String', // eslint-disable-line @typescript-eslint/internal/prefer-ast-types-enum
  'RegExp',
  'Symbol',
  'Array',
  'Proxy',
  'Date',
  'Atomics',
  'Reflect',
  'console',
  'Math',
  'JSON',
  'Intl',
] as const;
const nativelyBoundMembers = new Set(
  SUPPORTED_GLOBALS.flatMap(namespace => {
    if (!(namespace in global)) {
      // node.js might not have namespaces like Intl depending on compilation options
      // https://nodejs.org/api/intl.html#intl_options_for_building_node_js
      return [];
    }
    const object = global[namespace];
    return Object.getOwnPropertyNames(object)
      .filter(
        name =>
          !name.startsWith('_') &&
          typeof (object as Record<string, unknown>)[name] === 'function',
      )
      .map(name => `${namespace}.${name}`);
  }),
);

const isNotImported = (
  symbol: ts.Symbol,
  currentSourceFile: ts.SourceFile | undefined,
): boolean => {
  const { valueDeclaration } = symbol;
  if (!valueDeclaration) {
    // working around https://github.com/microsoft/TypeScript/issues/31294
    return false;
  }

  return (
    !!currentSourceFile &&
    currentSourceFile !== valueDeclaration.getSourceFile()
  );
};

const getNodeName = (node: TSESTree.Node): string | null =>
  node.type === AST_NODE_TYPES.Identifier ? node.name : null;

const getMemberFullName = (node: TSESTree.MemberExpression): string =>
  `${getNodeName(node.object)}.${getNodeName(node.property)}`;

const BASE_MESSAGE =
  'Avoid referencing unbound methods which may cause unintentional scoping of `this`.';

export default createRule<Options, MessageIds>({
  name: 'unbound-method',
  meta: {
    docs: {
      description:
        'Enforce unbound methods are called with their expected scope',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      unbound: BASE_MESSAGE,
      unboundWithoutThisAnnotation:
        BASE_MESSAGE +
        '\n' +
        'If your function does not access `this`, you can annotate it with `this: void`, or consider using an arrow function instead.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreStatic: {
            description:
              'Whether to skip checking whether `static` methods are correctly bound.',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem',
  },
  defaultOptions: [
    {
      ignoreStatic: false,
    },
  ],
  create(context, [{ ignoreStatic }]) {
    const services = getParserServices(context);
    const currentSourceFile = services.program.getSourceFile(context.filename);

    function checkIfMethodAndReport(
      node: TSESTree.Node,
      symbol: ts.Symbol | undefined,
    ): void {
      if (!symbol) {
        return;
      }

      const { dangerous, firstParamIsThis } = checkIfMethod(
        symbol,
        ignoreStatic,
      );
      if (dangerous) {
        context.report({
          messageId:
            firstParamIsThis === false
              ? 'unboundWithoutThisAnnotation'
              : 'unbound',
          node,
        });
      }
    }

    return {
      MemberExpression(node: TSESTree.MemberExpression): void {
        if (isSafeUse(node)) {
          return;
        }

        const objectSymbol = services.getSymbolAtLocation(node.object);

        if (
          objectSymbol &&
          nativelyBoundMembers.has(getMemberFullName(node)) &&
          isNotImported(objectSymbol, currentSourceFile)
        ) {
          return;
        }

        checkIfMethodAndReport(node, services.getSymbolAtLocation(node));
      },
      'VariableDeclarator, AssignmentExpression'(
        node: TSESTree.AssignmentExpression | TSESTree.VariableDeclarator,
      ): void {
        const [idNode, initNode] =
          node.type === AST_NODE_TYPES.VariableDeclarator
            ? [node.id, node.init]
            : [node.left, node.right];

        if (initNode && idNode.type === AST_NODE_TYPES.ObjectPattern) {
          const rightSymbol = services.getSymbolAtLocation(initNode);
          const initTypes = services.getTypeAtLocation(initNode);

          const notImported =
            rightSymbol && isNotImported(rightSymbol, currentSourceFile);

          idNode.properties.forEach(property => {
            if (
              property.type === AST_NODE_TYPES.Property &&
              property.key.type === AST_NODE_TYPES.Identifier
            ) {
              if (
                notImported &&
                isIdentifier(initNode) &&
                nativelyBoundMembers.has(
                  `${initNode.name}.${property.key.name}`,
                )
              ) {
                return;
              }

              checkIfMethodAndReport(
                property.key,
                initTypes.getProperty(property.key.name),
              );
            }
          });
        }
      },
    };
  },
});

interface CheckMethodResult {
  dangerous: boolean;
  firstParamIsThis?: boolean;
}

function checkIfMethod(
  symbol: ts.Symbol,
  ignoreStatic: boolean,
): CheckMethodResult {
  const { valueDeclaration } = symbol;
  if (!valueDeclaration) {
    // working around https://github.com/microsoft/TypeScript/issues/31294
    return { dangerous: false };
  }

  switch (valueDeclaration.kind) {
    case ts.SyntaxKind.PropertyDeclaration:
      return {
        dangerous:
          (valueDeclaration as ts.PropertyDeclaration).initializer?.kind ===
          ts.SyntaxKind.FunctionExpression,
      };
    case ts.SyntaxKind.PropertyAssignment: {
      const assignee = (valueDeclaration as ts.PropertyAssignment).initializer;
      if (assignee.kind !== ts.SyntaxKind.FunctionExpression) {
        return {
          dangerous: false,
        };
      }
      return checkMethod(assignee as ts.FunctionExpression, ignoreStatic);
    }
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.MethodSignature: {
      return checkMethod(
        valueDeclaration as ts.MethodDeclaration | ts.MethodSignature,
        ignoreStatic,
      );
    }
  }

  return { dangerous: false };
}

function checkMethod(
  valueDeclaration:
    | ts.MethodDeclaration
    | ts.MethodSignature
    | ts.FunctionExpression,
  ignoreStatic: boolean,
): CheckMethodResult {
  const firstParam = valueDeclaration.parameters.at(0);
  const firstParamIsThis =
    firstParam?.name.kind === ts.SyntaxKind.Identifier &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    firstParam.name.escapedText === 'this';
  const thisArgIsVoid =
    firstParamIsThis && firstParam.type?.kind === ts.SyntaxKind.VoidKeyword;

  return {
    dangerous:
      !thisArgIsVoid &&
      !(
        ignoreStatic &&
        tsutils.includesModifier(
          getModifiers(valueDeclaration),
          ts.SyntaxKind.StaticKeyword,
        )
      ),
    firstParamIsThis,
  };
}

function isSafeUse(node: TSESTree.Node): boolean {
  const parent = node.parent;

  switch (parent?.type) {
    case AST_NODE_TYPES.IfStatement:
    case AST_NODE_TYPES.ForStatement:
    case AST_NODE_TYPES.MemberExpression:
    case AST_NODE_TYPES.SwitchStatement:
    case AST_NODE_TYPES.UpdateExpression:
    case AST_NODE_TYPES.WhileStatement:
      return true;

    case AST_NODE_TYPES.CallExpression:
      return parent.callee === node;

    case AST_NODE_TYPES.ConditionalExpression:
      return parent.test === node;

    case AST_NODE_TYPES.TaggedTemplateExpression:
      return parent.tag === node;

    case AST_NODE_TYPES.UnaryExpression:
      // the first case is safe for obvious
      // reasons. The second one is also fine
      // since we're returning something falsy
      return ['typeof', '!', 'void', 'delete'].includes(parent.operator);

    case AST_NODE_TYPES.BinaryExpression:
      return ['instanceof', '==', '!=', '===', '!=='].includes(parent.operator);

    case AST_NODE_TYPES.AssignmentExpression:
      return (
        parent.operator === '=' &&
        (node === parent.left ||
          (node.type === AST_NODE_TYPES.MemberExpression &&
            node.object.type === AST_NODE_TYPES.Super &&
            parent.left.type === AST_NODE_TYPES.MemberExpression &&
            parent.left.object.type === AST_NODE_TYPES.ThisExpression))
      );

    case AST_NODE_TYPES.ChainExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
      return isSafeUse(parent);

    case AST_NODE_TYPES.LogicalExpression:
      if (parent.operator === '&&' && parent.left === node) {
        // this is safe, as && will return the left if and only if it's falsy
        return true;
      }

      // in all other cases, it's likely the logical expression will return the method ref
      // so make sure the parent is a safe usage
      return isSafeUse(parent);
  }

  return false;
}
