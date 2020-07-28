import {
  TSESTree,
  TSESLint,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type MessageIds = 'redeclared' | 'redeclaredAsBuiltin' | 'redeclaredBySyntax';
type Options = [
  {
    builtinGlobals?: boolean;
    ignoreDeclarationMerge?: boolean;
  },
];

// https://github.com/lodash/lodash/blob/86a852fe763935bb64c12589df5391fd7d3bb14d/escapeRegExp.js
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
const reHasRegExpChar = RegExp(reRegExpChar.source);
function escapeRegExp(str: string): string {
  return str && reHasRegExpChar.test(str)
    ? str.replace(reRegExpChar, '\\$&')
    : str || '';
}

function getNameLocationInGlobalDirectiveComment(
  sourceCode: TSESLint.SourceCode,
  comment: TSESTree.Comment,
  name: string,
): TSESTree.SourceLocation {
  const namePattern = new RegExp(
    `[\\s,]${escapeRegExp(name)}(?:$|[\\s,:])`,
    'gu',
  );

  // To ignore the first text "global".
  namePattern.lastIndex = comment.value.indexOf('global') + 6;

  // Search a given variable name.
  const match = namePattern.exec(comment.value);

  // Convert the index to loc.
  const start = sourceCode.getLocFromIndex(
    comment.range[0] + '/*'.length + (match ? match.index + 1 : 0),
  );
  const end = {
    line: start.line,
    column: start.column + (match ? name.length : 1),
  };

  return { start, end };
}

export default util.createRule<Options, MessageIds>({
  name: 'no-redeclare',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow variable redeclaration',
      category: 'Best Practices',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          builtinGlobals: {
            type: 'boolean',
          },
          ignoreDeclarationMerge: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      redeclared: "'{{id}}' is already defined.",
      redeclaredAsBuiltin:
        "'{{id}}' is already defined as a built-in global variable.",
      redeclaredBySyntax:
        "'{{id}}' is already defined by a variable declaration.",
    },
  },
  defaultOptions: [
    {
      builtinGlobals: true,
      ignoreDeclarationMerge: true,
    },
  ],
  create(context, [options]) {
    const sourceCode = context.getSourceCode();

    const CLASS_DECLARATION_MERGE_NODES = new Set<AST_NODE_TYPES>([
      AST_NODE_TYPES.TSInterfaceDeclaration,
      AST_NODE_TYPES.TSModuleDeclaration,
      AST_NODE_TYPES.ClassDeclaration,
    ]);
    const FUNCTION_DECLARATION_MERGE_NODES = new Set<AST_NODE_TYPES>([
      AST_NODE_TYPES.TSModuleDeclaration,
      AST_NODE_TYPES.FunctionDeclaration,
    ]);

    function* iterateDeclarations(
      variable: TSESLint.Scope.Variable,
    ): Generator<
      {
        type: 'builtin' | 'syntax' | 'comment';
        node?: TSESTree.Identifier | TSESTree.Comment;
        loc?: TSESTree.SourceLocation;
      },
      void,
      unknown
    > {
      if (
        options?.builtinGlobals &&
        'eslintImplicitGlobalSetting' in variable &&
        (variable.eslintImplicitGlobalSetting === 'readonly' ||
          variable.eslintImplicitGlobalSetting === 'writable')
      ) {
        yield { type: 'builtin' };
      }

      if (
        'eslintExplicitGlobalComments' in variable &&
        variable.eslintExplicitGlobalComments
      ) {
        for (const comment of variable.eslintExplicitGlobalComments) {
          yield {
            type: 'comment',
            node: comment,
            loc: getNameLocationInGlobalDirectiveComment(
              sourceCode,
              comment,
              variable.name,
            ),
          };
        }
      }

      const identifiers = variable.identifiers
        .map(id => ({
          identifier: id,
          parent: id.parent!,
        }))
        // ignore function declarations because TS will treat them as an overload
        .filter(
          ({ parent }) => parent.type !== AST_NODE_TYPES.TSDeclareFunction,
        );

      if (options.ignoreDeclarationMerge && identifiers.length > 1) {
        if (
          // interfaces merging
          identifiers.every(
            ({ parent }) =>
              parent.type === AST_NODE_TYPES.TSInterfaceDeclaration,
          )
        ) {
          return;
        }

        if (
          // namespace/module merging
          identifiers.every(
            ({ parent }) => parent.type === AST_NODE_TYPES.TSModuleDeclaration,
          )
        ) {
          return;
        }

        if (
          // class + interface/namespace merging
          identifiers.every(({ parent }) =>
            CLASS_DECLARATION_MERGE_NODES.has(parent.type),
          )
        ) {
          const classDecls = identifiers.filter(
            ({ parent }) => parent.type === AST_NODE_TYPES.ClassDeclaration,
          );
          if (classDecls.length === 1) {
            // safe declaration merging
            return;
          }

          // there's more than one class declaration, which needs to be reported
          for (const { identifier } of classDecls) {
            yield { type: 'syntax', node: identifier, loc: identifier.loc };
          }
          return;
        }

        if (
          // class + interface/namespace merging
          identifiers.every(({ parent }) =>
            FUNCTION_DECLARATION_MERGE_NODES.has(parent.type),
          )
        ) {
          const functionDecls = identifiers.filter(
            ({ parent }) => parent.type === AST_NODE_TYPES.FunctionDeclaration,
          );
          if (functionDecls.length === 1) {
            // safe declaration merging
            return;
          }

          // there's more than one class declaration, which needs to be reported
          for (const { identifier } of functionDecls) {
            yield { type: 'syntax', node: identifier, loc: identifier.loc };
          }
          return;
        }
      }

      for (const { identifier } of identifiers) {
        yield { type: 'syntax', node: identifier, loc: identifier.loc };
      }
    }

    function findVariablesInScope(scope: TSESLint.Scope.Scope): void {
      for (const variable of scope.variables) {
        const [declaration, ...extraDeclarations] = iterateDeclarations(
          variable,
        );

        if (extraDeclarations.length === 0) {
          continue;
        }

        /*
         * If the type of a declaration is different from the type of
         * the first declaration, it shows the location of the first
         * declaration.
         */
        const detailMessageId =
          declaration.type === 'builtin'
            ? 'redeclaredAsBuiltin'
            : 'redeclaredBySyntax';
        const data = { id: variable.name };

        // Report extra declarations.
        for (const { type, node, loc } of extraDeclarations) {
          const messageId =
            type === declaration.type ? 'redeclared' : detailMessageId;

          if (node) {
            context.report({ node, loc, messageId, data });
          } else if (loc) {
            context.report({ loc, messageId, data });
          }
        }
      }
    }

    /**
     * Find variables in the current scope.
     */
    function checkForBlock(node: TSESTree.Node): void {
      const scope = context.getScope();

      /*
       * In ES5, some node type such as `BlockStatement` doesn't have that scope.
       * `scope.block` is a different node in such a case.
       */
      if (scope.block === node) {
        findVariablesInScope(scope);
      }
    }

    return {
      Program(): void {
        const scope = context.getScope();

        findVariablesInScope(scope);

        // Node.js or ES modules has a special scope.
        if (
          scope.type === 'global' &&
          scope.childScopes[0] &&
          // The special scope's block is the Program node.
          scope.block === scope.childScopes[0].block
        ) {
          findVariablesInScope(scope.childScopes[0]);
        }
      },

      FunctionDeclaration: checkForBlock,
      FunctionExpression: checkForBlock,
      ArrowFunctionExpression: checkForBlock,

      BlockStatement: checkForBlock,
      ForStatement: checkForBlock,
      ForInStatement: checkForBlock,
      ForOfStatement: checkForBlock,
      SwitchStatement: checkForBlock,
    };
  },
});
