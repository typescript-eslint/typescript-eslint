import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

interface Config {
  ignoreStatic: boolean;
}

export type Options = [Config];

export type MessageIds = 'unbound';

/**
 * The following is a list of exceptions to the rule
 * Generated via the following script.
 * This is statically defined to save making purposely invalid calls every lint run
 * ```
SUPPORTED_GLOBALS.flatMap(namespace => {
  const object = window[namespace];
    return Object.getOwnPropertyNames(object)
      .filter(
        name =>
          !name.startsWith('_') &&
          typeof object[name] === 'function',
      )
      .map(name => {
        try {
          const x = object[name];
          x();
        } catch (e) {
          if (e.message.includes("called on non-object")) {
            return `${namespace}.${name}`;
          }
        }
      });
}).filter(Boolean);
   * ```
 */
const nativelyNotBoundMembers = new Set([
  'Promise.all',
  'Promise.race',
  'Promise.resolve',
  'Promise.reject',
  'Promise.allSettled',
  'Object.defineProperties',
  'Object.defineProperty',
  'Reflect.defineProperty',
  'Reflect.deleteProperty',
  'Reflect.get',
  'Reflect.getOwnPropertyDescriptor',
  'Reflect.getPrototypeOf',
  'Reflect.has',
  'Reflect.isExtensible',
  'Reflect.ownKeys',
  'Reflect.preventExtensions',
  'Reflect.set',
  'Reflect.setPrototypeOf',
]);
const SUPPORTED_GLOBALS = [
  'Number',
  'Object',
  'String', // eslint-disable-line @typescript-eslint/internal/prefer-ast-types-enum
  'RegExp',
  'Symbol',
  'Array',
  'Proxy',
  'Date',
  'Infinity',
  'Atomics',
  'Reflect',
  'console',
  'Math',
  'JSON',
  'Intl',
] as const;
const nativelyBoundMembers = SUPPORTED_GLOBALS.map(namespace => {
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
})
  .reduce((arr, names) => arr.concat(names), [])
  .filter(name => !nativelyNotBoundMembers.has(name));

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

export default util.createRule<Options, MessageIds>({
  name: 'unbound-method',
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Enforces unbound methods are called with their expected scope',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      unbound:
        'Avoid referencing unbound methods which may cause unintentional scoping of `this`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreStatic: {
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
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const currentSourceFile = parserServices.program.getSourceFile(
      context.getFilename(),
    );

    return {
      MemberExpression(node: TSESTree.MemberExpression): void {
        if (isSafeUse(node)) {
          return;
        }

        const objectSymbol = checker.getSymbolAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.object),
        );

        if (
          objectSymbol &&
          nativelyBoundMembers.includes(getMemberFullName(node)) &&
          isNotImported(objectSymbol, currentSourceFile)
        ) {
          return;
        }

        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const symbol = checker.getSymbolAtLocation(originalNode);

        if (symbol && isDangerousMethod(symbol, ignoreStatic)) {
          context.report({
            messageId: 'unbound',
            node,
          });
        }
      },
      'VariableDeclarator, AssignmentExpression'(
        node: TSESTree.VariableDeclarator | TSESTree.AssignmentExpression,
      ): void {
        const [idNode, initNode] =
          node.type === AST_NODE_TYPES.VariableDeclarator
            ? [node.id, node.init]
            : [node.left, node.right];

        if (initNode && idNode.type === AST_NODE_TYPES.ObjectPattern) {
          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(initNode);
          const rightSymbol = checker.getSymbolAtLocation(tsNode);
          const initTypes = checker.getTypeAtLocation(tsNode);

          const notImported =
            rightSymbol && isNotImported(rightSymbol, currentSourceFile);

          idNode.properties.forEach(property => {
            if (
              property.type === AST_NODE_TYPES.Property &&
              property.key.type === AST_NODE_TYPES.Identifier
            ) {
              if (
                notImported &&
                util.isIdentifier(initNode) &&
                nativelyBoundMembers.includes(
                  `${initNode.name}.${property.key.name}`,
                )
              ) {
                return;
              }

              const symbol = initTypes.getProperty(property.key.name);
              if (symbol && isDangerousMethod(symbol, ignoreStatic)) {
                context.report({
                  messageId: 'unbound',
                  node,
                });
              }
            }
          });
        }
      },
    };
  },
});

function isDangerousMethod(symbol: ts.Symbol, ignoreStatic: boolean): boolean {
  const { valueDeclaration } = symbol;
  if (!valueDeclaration) {
    // working around https://github.com/microsoft/TypeScript/issues/31294
    return false;
  }

  switch (valueDeclaration.kind) {
    case ts.SyntaxKind.PropertyDeclaration:
      return (
        (valueDeclaration as ts.PropertyDeclaration).initializer?.kind ===
        ts.SyntaxKind.FunctionExpression
      );
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.MethodSignature:
      return !(
        ignoreStatic &&
        tsutils.hasModifier(
          valueDeclaration.modifiers,
          ts.SyntaxKind.StaticKeyword,
        )
      );
  }

  return false;
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
      return parent.operator === '=' && node === parent.left;

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
