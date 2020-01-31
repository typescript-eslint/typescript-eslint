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

const nativelyBoundMembers = [
  ...[
    Promise,
    //    BigInt, // todo: enable when we drop node@8
    Number,
    Object,
    String,
    Symbol,
    Array,
    Proxy,
    Date,
  ].map(x => [x.name, x]),
  ['Atomics', Atomics],
  ['Reflect', Reflect],
  ['console', console],
  ['Math', Math],
  ['JSON', JSON],
  ['Intl', Intl],
]
  .map(([namespace, object]) =>
    Object.getOwnPropertyNames(object)
      .filter(
        name =>
          !name.startsWith('_') &&
          typeof (object as Record<string, unknown>)[name] === 'function',
      )
      .map(name => `${namespace}.${name}`),
  )
  .reduce((arr, names) => arr.concat(names), []);

const isMemberImported = (
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

const getMemberFullName = (
  node: TSESTree.MemberExpression | TSESTree.OptionalMemberExpression,
): string => `${getNodeName(node.object)}.${getNodeName(node.property)}`;

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
      'MemberExpression, OptionalMemberExpression'(
        node: TSESTree.MemberExpression | TSESTree.OptionalMemberExpression,
      ): void {
        if (isSafeUse(node)) {
          return;
        }

        const objectSymbol = checker.getSymbolAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.object),
        );

        if (
          objectSymbol &&
          nativelyBoundMembers.includes(getMemberFullName(node)) &&
          isMemberImported(objectSymbol, currentSourceFile)
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
    case AST_NODE_TYPES.OptionalMemberExpression:
    case AST_NODE_TYPES.SwitchStatement:
    case AST_NODE_TYPES.UpdateExpression:
    case AST_NODE_TYPES.WhileStatement:
      return true;

    case AST_NODE_TYPES.CallExpression:
    case AST_NODE_TYPES.OptionalCallExpression:
      return parent.callee === node;

    case AST_NODE_TYPES.ConditionalExpression:
      return parent.test === node;

    case AST_NODE_TYPES.TaggedTemplateExpression:
      return parent.tag === node;

    case AST_NODE_TYPES.UnaryExpression:
      return parent.operator === 'typeof';

    case AST_NODE_TYPES.BinaryExpression:
      return ['instanceof', '==', '!=', '===', '!=='].includes(parent.operator);

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
