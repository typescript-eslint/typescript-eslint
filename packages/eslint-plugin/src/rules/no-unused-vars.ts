import { PatternVisitor } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

import * as util from '../util';

export type MessageIds = 'unusedVar';
export type Options = [
  | 'all'
  | 'local'
  | {
      vars?: 'all' | 'local';
      varsIgnorePattern?: string;
      args?: 'all' | 'after-used' | 'none';
      ignoreRestSiblings?: boolean;
      argsIgnorePattern?: string;
      caughtErrors?: 'all' | 'none';
      caughtErrorsIgnorePattern?: string;
      destructuredArrayIgnorePattern?: string;
    },
];

interface TranslatedOptions {
  vars: 'all' | 'local';
  varsIgnorePattern?: RegExp;
  args: 'all' | 'after-used' | 'none';
  ignoreRestSiblings: boolean;
  argsIgnorePattern?: RegExp;
  caughtErrors: 'all' | 'none';
  caughtErrorsIgnorePattern?: RegExp;
  destructuredArrayIgnorePattern?: RegExp;
}

export default util.createRule<Options, MessageIds>({
  name: 'no-unused-vars',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused variables',
      recommended: 'warn',
      extendsBaseRule: true,
    },
    schema: [
      {
        oneOf: [
          {
            enum: ['all', 'local'],
          },
          {
            type: 'object',
            properties: {
              vars: {
                enum: ['all', 'local'],
              },
              varsIgnorePattern: {
                type: 'string',
              },
              args: {
                enum: ['all', 'after-used', 'none'],
              },
              ignoreRestSiblings: {
                type: 'boolean',
              },
              argsIgnorePattern: {
                type: 'string',
              },
              caughtErrors: {
                enum: ['all', 'none'],
              },
              caughtErrorsIgnorePattern: {
                type: 'string',
              },
              destructuredArrayIgnorePattern: {
                type: 'string',
              },
            },
            additionalProperties: false,
          },
        ],
      },
    ],
    messages: {
      unusedVar: "'{{varName}}' is {{action}} but never used{{additional}}.",
    },
  },
  defaultOptions: [{}],
  create(context) {
    const filename = context.getFilename();
    const sourceCode = context.getSourceCode();
    const MODULE_DECL_CACHE = new Map<TSESTree.TSModuleDeclaration, boolean>();

    const options = ((): TranslatedOptions => {
      const options: TranslatedOptions = {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
        caughtErrors: 'none',
      };

      const [firstOption] = context.options;

      if (firstOption) {
        if (typeof firstOption === 'string') {
          options.vars = firstOption;
        } else {
          options.vars = firstOption.vars ?? options.vars;
          options.args = firstOption.args ?? options.args;
          options.ignoreRestSiblings =
            firstOption.ignoreRestSiblings ?? options.ignoreRestSiblings;
          options.caughtErrors =
            firstOption.caughtErrors ?? options.caughtErrors;

          if (firstOption.varsIgnorePattern) {
            options.varsIgnorePattern = new RegExp(
              firstOption.varsIgnorePattern,
              'u',
            );
          }

          if (firstOption.argsIgnorePattern) {
            options.argsIgnorePattern = new RegExp(
              firstOption.argsIgnorePattern,
              'u',
            );
          }

          if (firstOption.caughtErrorsIgnorePattern) {
            options.caughtErrorsIgnorePattern = new RegExp(
              firstOption.caughtErrorsIgnorePattern,
              'u',
            );
          }

          if (firstOption.destructuredArrayIgnorePattern) {
            options.destructuredArrayIgnorePattern = new RegExp(
              firstOption.destructuredArrayIgnorePattern,
              'u',
            );
          }
        }
      }
      return options;
    })();

    function collectUnusedVariables(): TSESLint.Scope.Variable[] {
      /**
       * Checks whether a node is a sibling of the rest property or not.
       * @param {ASTNode} node a node to check
       * @returns {boolean} True if the node is a sibling of the rest property, otherwise false.
       */
      function hasRestSibling(node: TSESTree.Node): boolean {
        return (
          node.type === AST_NODE_TYPES.Property &&
          node.parent?.type === AST_NODE_TYPES.ObjectPattern &&
          node.parent.properties[node.parent.properties.length - 1].type ===
            AST_NODE_TYPES.RestElement
        );
      }

      /**
       * Determines if a variable has a sibling rest property
       * @param variable eslint-scope variable object.
       * @returns True if the variable is exported, false if not.
       */
      function hasRestSpreadSibling(
        variable: TSESLint.Scope.Variable,
      ): boolean {
        if (options.ignoreRestSiblings) {
          const hasRestSiblingDefinition = variable.defs.some(def =>
            hasRestSibling(def.name.parent),
          );
          const hasRestSiblingReference = variable.references.some(ref =>
            hasRestSibling(ref.identifier.parent),
          );

          return hasRestSiblingDefinition || hasRestSiblingReference;
        }

        return false;
      }

      /**
       * Checks whether the given variable is after the last used parameter.
       * @param variable The variable to check.
       * @returns `true` if the variable is defined after the last used parameter.
       */
      function isAfterLastUsedArg(variable: TSESLint.Scope.Variable): boolean {
        const def = variable.defs[0];
        const params = context.getDeclaredVariables(def.node);
        const posteriorParams = params.slice(params.indexOf(variable) + 1);

        // If any used parameters occur after this parameter, do not report.
        return !posteriorParams.some(
          v => v.references.length > 0 || v.eslintUsed,
        );
      }

      const unusedVariablesOriginal = util.collectUnusedVariables(context);
      const unusedVariablesReturn: TSESLint.Scope.Variable[] = [];
      for (const variable of unusedVariablesOriginal) {
        // explicit global variables don't have definitions.
        if (variable.defs.length === 0) {
          unusedVariablesReturn.push(variable);
          continue;
        }
        const def = variable.defs[0];

        if (
          variable.scope.type === TSESLint.Scope.ScopeType.global &&
          options.vars === 'local'
        ) {
          // skip variables in the global scope if configured to
          continue;
        }

        const refUsedInArrayPatterns = variable.references.some(
          ref => ref.identifier.parent?.type === AST_NODE_TYPES.ArrayPattern,
        );

        // skip elements of array destructuring patterns
        if (
          (def.name.parent?.type === AST_NODE_TYPES.ArrayPattern ||
            refUsedInArrayPatterns) &&
          'name' in def.name &&
          options.destructuredArrayIgnorePattern?.test(def.name.name)
        ) {
          continue;
        }

        // skip catch variables
        if (def.type === TSESLint.Scope.DefinitionType.CatchClause) {
          if (options.caughtErrors === 'none') {
            continue;
          }
          // skip ignored parameters
          if (
            'name' in def.name &&
            options.caughtErrorsIgnorePattern?.test(def.name.name)
          ) {
            continue;
          }
        }

        if (def.type === TSESLint.Scope.DefinitionType.Parameter) {
          // if "args" option is "none", skip any parameter
          if (options.args === 'none') {
            continue;
          }
          // skip ignored parameters
          if (
            'name' in def.name &&
            options.argsIgnorePattern?.test(def.name.name)
          ) {
            continue;
          }
          // if "args" option is "after-used", skip used variables
          if (
            options.args === 'after-used' &&
            util.isFunction(def.name.parent) &&
            !isAfterLastUsedArg(variable)
          ) {
            continue;
          }
        } else {
          // skip ignored variables
          if (
            'name' in def.name &&
            options.varsIgnorePattern?.test(def.name.name)
          ) {
            continue;
          }
        }

        if (hasRestSpreadSibling(variable)) {
          continue;
        }

        // in case another rule has run and used the collectUnusedVariables,
        // we want to ensure our selectors that marked variables as used are respected
        if (variable.eslintUsed) {
          continue;
        }

        unusedVariablesReturn.push(variable);
      }

      return unusedVariablesReturn;
    }

    return {
      // declaration file handling
      [ambientDeclarationSelector(AST_NODE_TYPES.Program, true)](
        node: DeclarationSelectorNode,
      ): void {
        if (!util.isDefinitionFile(filename)) {
          return;
        }
        markDeclarationChildAsUsed(node);
      },

      // module declaration in module declaration should not report unused vars error
      // this is workaround as this change should be done in better way
      'TSModuleDeclaration > TSModuleDeclaration'(
        node: TSESTree.TSModuleDeclaration,
      ): void {
        if (node.id.type === AST_NODE_TYPES.Identifier) {
          let scope = context.getScope();
          if (scope.upper) {
            scope = scope.upper;
          }
          const superVar = scope.set.get(node.id.name);
          if (superVar) {
            superVar.eslintUsed = true;
          }
        }
      },

      // children of a namespace that is a child of a declared namespace are auto-exported
      [ambientDeclarationSelector(
        'TSModuleDeclaration[declare = true] > TSModuleBlock TSModuleDeclaration > TSModuleBlock',
        false,
      )](node: DeclarationSelectorNode): void {
        markDeclarationChildAsUsed(node);
      },

      // declared namespace handling
      [ambientDeclarationSelector(
        'TSModuleDeclaration[declare = true] > TSModuleBlock',
        false,
      )](node: DeclarationSelectorNode): void {
        const moduleDecl = util.nullThrows(
          node.parent?.parent,
          util.NullThrowsReasons.MissingParent,
        ) as TSESTree.TSModuleDeclaration;

        // declared ambient modules with an `export =` statement will only export that one thing
        // all other statements are not automatically exported in this case
        if (
          moduleDecl.id.type === AST_NODE_TYPES.Literal &&
          checkModuleDeclForExportEquals(moduleDecl)
        ) {
          return;
        }

        markDeclarationChildAsUsed(node);
      },

      // collect
      'Program:exit'(programNode): void {
        /**
         * Generates the message data about the variable being defined and unused,
         * including the ignore pattern if configured.
         * @param unusedVar eslint-scope variable object.
         * @returns The message data to be used with this unused variable.
         */
        function getDefinedMessageData(
          unusedVar: TSESLint.Scope.Variable,
        ): Record<string, unknown> {
          const defType = unusedVar?.defs[0]?.type;
          let type;
          let pattern;

          if (
            defType === TSESLint.Scope.DefinitionType.CatchClause &&
            options.caughtErrorsIgnorePattern
          ) {
            type = 'args';
            pattern = options.caughtErrorsIgnorePattern.toString();
          } else if (
            defType === TSESLint.Scope.DefinitionType.Parameter &&
            options.argsIgnorePattern
          ) {
            type = 'args';
            pattern = options.argsIgnorePattern.toString();
          } else if (
            defType !== TSESLint.Scope.DefinitionType.Parameter &&
            options.varsIgnorePattern
          ) {
            type = 'vars';
            pattern = options.varsIgnorePattern.toString();
          }

          const additional = type
            ? `. Allowed unused ${type} must match ${pattern}`
            : '';

          return {
            varName: unusedVar.name,
            action: 'defined',
            additional,
          };
        }

        /**
         * Generate the warning message about the variable being
         * assigned and unused, including the ignore pattern if configured.
         * @param unusedVar eslint-scope variable object.
         * @returns The message data to be used with this unused variable.
         */
        function getAssignedMessageData(
          unusedVar: TSESLint.Scope.Variable,
        ): Record<string, unknown> {
          const def = unusedVar.defs[0];
          let additional = '';

          if (
            options.destructuredArrayIgnorePattern &&
            def?.name.parent?.type === AST_NODE_TYPES.ArrayPattern
          ) {
            additional = `. Allowed unused elements of array destructuring patterns must match ${options.destructuredArrayIgnorePattern.toString()}`;
          } else if (options.varsIgnorePattern) {
            additional = `. Allowed unused vars must match ${options.varsIgnorePattern.toString()}`;
          }

          return {
            varName: unusedVar.name,
            action: 'assigned a value',
            additional,
          };
        }

        const unusedVars = collectUnusedVariables();

        for (const unusedVar of unusedVars) {
          // Report the first declaration.
          if (unusedVar.defs.length > 0) {
            const writeReferences = unusedVar.references.filter(
              ref =>
                ref.isWrite() &&
                ref.from.variableScope === unusedVar.scope.variableScope,
            );

            context.report({
              node: writeReferences.length
                ? writeReferences[writeReferences.length - 1].identifier
                : unusedVar.identifiers[0],
              messageId: 'unusedVar',
              data: unusedVar.references.some(ref => ref.isWrite())
                ? getAssignedMessageData(unusedVar)
                : getDefinedMessageData(unusedVar),
            });

            // If there are no regular declaration, report the first `/*globals*/` comment directive.
          } else if (
            'eslintExplicitGlobalComments' in unusedVar &&
            unusedVar.eslintExplicitGlobalComments
          ) {
            const directiveComment = unusedVar.eslintExplicitGlobalComments[0];

            context.report({
              node: programNode,
              loc: util.getNameLocationInGlobalDirectiveComment(
                sourceCode,
                directiveComment,
                unusedVar.name,
              ),
              messageId: 'unusedVar',
              data: getDefinedMessageData(unusedVar),
            });
          }
        }
      },
    };

    function checkModuleDeclForExportEquals(
      node: TSESTree.TSModuleDeclaration,
    ): boolean {
      const cached = MODULE_DECL_CACHE.get(node);
      if (cached != null) {
        return cached;
      }

      if (node.body && node.body.type === AST_NODE_TYPES.TSModuleBlock) {
        for (const statement of node.body.body) {
          if (statement.type === AST_NODE_TYPES.TSExportAssignment) {
            MODULE_DECL_CACHE.set(node, true);
            return true;
          }
        }
      }

      MODULE_DECL_CACHE.set(node, false);
      return false;
    }

    type DeclarationSelectorNode =
      | TSESTree.TSInterfaceDeclaration
      | TSESTree.TSTypeAliasDeclaration
      | TSESTree.ClassDeclaration
      | TSESTree.FunctionDeclaration
      | TSESTree.TSDeclareFunction
      | TSESTree.TSEnumDeclaration
      | TSESTree.TSModuleDeclaration
      | TSESTree.VariableDeclaration;
    function ambientDeclarationSelector(
      parent: string,
      childDeclare: boolean,
    ): string {
      return [
        // Types are ambiently exported
        `${parent} > :matches(${[
          AST_NODE_TYPES.TSInterfaceDeclaration,
          AST_NODE_TYPES.TSTypeAliasDeclaration,
        ].join(', ')})`,
        // Value things are ambiently exported if they are "declare"d
        `${parent} > :matches(${[
          AST_NODE_TYPES.ClassDeclaration,
          AST_NODE_TYPES.TSDeclareFunction,
          AST_NODE_TYPES.TSEnumDeclaration,
          AST_NODE_TYPES.TSModuleDeclaration,
          AST_NODE_TYPES.VariableDeclaration,
        ].join(', ')})${childDeclare ? '[declare = true]' : ''}`,
      ].join(', ');
    }
    function markDeclarationChildAsUsed(node: DeclarationSelectorNode): void {
      const identifiers: TSESTree.Identifier[] = [];
      switch (node.type) {
        case AST_NODE_TYPES.TSInterfaceDeclaration:
        case AST_NODE_TYPES.TSTypeAliasDeclaration:
        case AST_NODE_TYPES.ClassDeclaration:
        case AST_NODE_TYPES.FunctionDeclaration:
        case AST_NODE_TYPES.TSDeclareFunction:
        case AST_NODE_TYPES.TSEnumDeclaration:
        case AST_NODE_TYPES.TSModuleDeclaration:
          if (node.id?.type === AST_NODE_TYPES.Identifier) {
            identifiers.push(node.id);
          }
          break;

        case AST_NODE_TYPES.VariableDeclaration:
          for (const declaration of node.declarations) {
            visitPattern(declaration, pattern => {
              identifiers.push(pattern);
            });
          }
          break;
      }

      let scope = context.getScope();
      const shouldUseUpperScope = [
        AST_NODE_TYPES.TSModuleDeclaration,
        AST_NODE_TYPES.TSDeclareFunction,
      ].includes(node.type);

      if (scope.variableScope !== scope) {
        scope = scope.variableScope;
      } else if (shouldUseUpperScope && scope.upper) {
        scope = scope.upper;
      }

      for (const id of identifiers) {
        const superVar = scope.set.get(id.name);
        if (superVar) {
          superVar.eslintUsed = true;
        }
      }
    }

    function visitPattern(
      node: TSESTree.Node,
      cb: (node: TSESTree.Identifier) => void,
    ): void {
      const visitor = new PatternVisitor({}, node, cb);
      visitor.visit(node);
    }
  },
});

/*

###### TODO ######

Edge cases that aren't currently handled due to laziness and them being super edgy edge cases


--- function params referenced in typeof type refs in the function declaration ---
--- NOTE - TS gets these cases wrong

function _foo(
  arg: number // arg should be unused
): typeof arg {
  return 1 as any;
}

function _bar(
  arg: number, // arg should be unused
  _arg2: typeof arg,
) {}


--- function names referenced in typeof type refs in the function declaration ---
--- NOTE - TS gets these cases right

function foo( // foo should be unused
): typeof foo {
    return 1 as any;
}

function bar( // bar should be unused
  _arg: typeof bar
) {}


--- if an interface is merged into a namespace  ---
--- NOTE - TS gets these cases wrong

namespace Test {
    interface Foo { // Foo should be unused here
        a: string;
    }
    export namespace Foo {
       export type T = 'b';
    }
}
type T = Test.Foo; // Error: Namespace 'Test' has no exported member 'Foo'.


namespace Test {
    export interface Foo {
        a: string;
    }
    namespace Foo { // Foo should be unused here
       export type T = 'b';
    }
}
type T = Test.Foo.T; // Error: Namespace 'Test' has no exported member 'Foo'.

*/

/*

###### TODO ######

We currently extend base `no-unused-vars` implementation because it's easier and lighter-weight.

Because of this, there are a few false-negatives which won't get caught.
We could fix these if we fork the base rule; but that's a lot of code (~650 lines) to add in.
I didn't want to do that just yet without some real-world issues, considering these are pretty rare edge-cases.

These cases are mishandled because the base rule assumes that each variable has one def, but type-value shadowing
creates a variable with two defs

--- type-only or value-only references to type/value shadowed variables ---
--- NOTE - TS gets these cases wrong

type T = 1;
const T = 2; // this T should be unused

type U = T; // this U should be unused
const U = 3;

const _V = U;


--- partially exported type/value shadowed variables ---
--- NOTE - TS gets these cases wrong

export interface Foo {}
const Foo = 1; // this Foo should be unused

interface Bar {} // this Bar should be unused
export const Bar = 1;

*/
