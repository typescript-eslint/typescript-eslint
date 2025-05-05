import type {
  Definition,
  ScopeVariable,
} from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';

import {
  DefinitionType,
  PatternVisitor,
} from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

import type { MakeRequired } from '../util';

import {
  collectVariables,
  createRule,
  getNameLocationInGlobalDirectiveComment,
  isDefinitionFile,
  isFunction,
  nullThrows,
  NullThrowsReasons,
} from '../util';
import { referenceContainsTypeQuery } from '../util/referenceContainsTypeQuery';

export type MessageIds = 'unusedVar' | 'usedIgnoredVar' | 'usedOnlyAsType';
export type Options = [
  | 'all'
  | 'local'
  | {
      args?: 'after-used' | 'all' | 'none';
      argsIgnorePattern?: string;
      caughtErrors?: 'all' | 'none';
      caughtErrorsIgnorePattern?: string;
      destructuredArrayIgnorePattern?: string;
      ignoreClassWithStaticInitBlock?: boolean;
      ignoreRestSiblings?: boolean;
      reportUsedIgnorePattern?: boolean;
      vars?: 'all' | 'local';
      varsIgnorePattern?: string;
    },
];

interface TranslatedOptions {
  args: 'after-used' | 'all' | 'none';
  argsIgnorePattern?: RegExp;
  caughtErrors: 'all' | 'none';
  caughtErrorsIgnorePattern?: RegExp;
  destructuredArrayIgnorePattern?: RegExp;
  ignoreClassWithStaticInitBlock: boolean;
  ignoreRestSiblings: boolean;
  reportUsedIgnorePattern: boolean;
  vars: 'all' | 'local';
  varsIgnorePattern?: RegExp;
}

type VariableType =
  | 'array-destructure'
  | 'catch-clause'
  | 'parameter'
  | 'variable';

type ModuleDeclarationWithBody = MakeRequired<
  TSESTree.TSModuleDeclaration,
  'body'
>;

export default createRule<Options, MessageIds>({
  name: 'no-unused-vars',
  meta: {
    type: 'problem',
    docs: {
      extendsBaseRule: true,
      recommended: 'recommended',
      description: 'Disallow unused variables',
    },
    messages: {
      unusedVar: "'{{varName}}' is {{action}} but never used{{additional}}.",
      usedIgnoredVar:
        "'{{varName}}' is marked as ignored but is used{{additional}}.",
      usedOnlyAsType:
        "'{{varName}}' is {{action}} but only used as a type{{additional}}.",
    },
    schema: [
      {
        oneOf: [
          {
            type: 'string',
            enum: ['all', 'local'],
          },
          {
            type: 'object',
            additionalProperties: false,
            properties: {
              ignoreClassWithStaticInitBlock: {
                type: 'boolean',
                description:
                  'Whether to ignore classes with at least one static initialization block.',
              },
              args: {
                type: 'string',
                description: 'Whether to check all, some, or no arguments.',
                enum: ['all', 'after-used', 'none'],
              },
              argsIgnorePattern: {
                type: 'string',
                description:
                  'Regular expressions of argument names to not check for usage.',
              },
              caughtErrors: {
                type: 'string',
                description: 'Whether to check catch block arguments.',
                enum: ['all', 'none'],
              },
              caughtErrorsIgnorePattern: {
                type: 'string',
                description:
                  'Regular expressions of catch block argument names to not check for usage.',
              },
              destructuredArrayIgnorePattern: {
                type: 'string',
                description:
                  'Regular expressions of destructured array variable names to not check for usage.',
              },
              ignoreRestSiblings: {
                type: 'boolean',
                description:
                  'Whether to ignore sibling properties in `...` destructurings.',
              },
              reportUsedIgnorePattern: {
                type: 'boolean',
                description:
                  'Whether to report variables that match any of the valid ignore pattern options if they have been used.',
              },
              vars: {
                type: 'string',
                description:
                  'Whether to check all variables or only locally-declared variables.',
                enum: ['all', 'local'],
              },
              varsIgnorePattern: {
                type: 'string',
                description:
                  'Regular expressions of variable names to not check for usage.',
              },
            },
          },
        ],
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [firstOption]) {
    const MODULE_DECL_CACHE = new Map<
      ModuleDeclarationWithBody | TSESTree.Program,
      boolean
    >();

    const options = ((): TranslatedOptions => {
      const options: TranslatedOptions = {
        ignoreClassWithStaticInitBlock: false,
        args: 'after-used',
        caughtErrors: 'all',
        ignoreRestSiblings: false,
        reportUsedIgnorePattern: false,
        vars: 'all',
      };

      if (typeof firstOption === 'string') {
        options.vars = firstOption;
      } else {
        options.vars = firstOption.vars ?? options.vars;
        options.args = firstOption.args ?? options.args;
        options.ignoreRestSiblings =
          firstOption.ignoreRestSiblings ?? options.ignoreRestSiblings;
        options.caughtErrors = firstOption.caughtErrors ?? options.caughtErrors;
        options.ignoreClassWithStaticInitBlock =
          firstOption.ignoreClassWithStaticInitBlock ??
          options.ignoreClassWithStaticInitBlock;
        options.reportUsedIgnorePattern =
          firstOption.reportUsedIgnorePattern ??
          options.reportUsedIgnorePattern;

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

      return options;
    })();

    /**
     * Determines what variable type a def is.
     * @param def the declaration to check
     * @returns a simple name for the types of variables that this rule supports
     */
    function defToVariableType(def: Definition): VariableType {
      /*
       * This `destructuredArrayIgnorePattern` error report works differently from the catch
       * clause and parameter error reports. _Both_ the `varsIgnorePattern` and the
       * `destructuredArrayIgnorePattern` will be checked for array destructuring. However,
       * for the purposes of the report, the currently defined behavior is to only inform the
       * user of the `destructuredArrayIgnorePattern` if it's present (regardless of the fact
       * that the `varsIgnorePattern` would also apply). If it's not present, the user will be
       * informed of the `varsIgnorePattern`, assuming that's present.
       */
      if (
        options.destructuredArrayIgnorePattern &&
        def.name.parent.type === AST_NODE_TYPES.ArrayPattern
      ) {
        return 'array-destructure';
      }

      switch (def.type) {
        case DefinitionType.CatchClause:
          return 'catch-clause';
        case DefinitionType.Parameter:
          return 'parameter';
        default:
          return 'variable';
      }
    }

    /**
     * Gets a given variable's description and configured ignore pattern
     * based on the provided variableType
     * @param variableType a simple name for the types of variables that this rule supports
     * @returns the given variable's description and
     * ignore pattern
     */
    function getVariableDescription(variableType: VariableType): {
      pattern: string | undefined;
      variableDescription: string;
    } {
      switch (variableType) {
        case 'array-destructure':
          return {
            pattern: options.destructuredArrayIgnorePattern?.toString(),
            variableDescription: 'elements of array destructuring',
          };

        case 'catch-clause':
          return {
            pattern: options.caughtErrorsIgnorePattern?.toString(),
            variableDescription: 'caught errors',
          };

        case 'parameter':
          return {
            pattern: options.argsIgnorePattern?.toString(),
            variableDescription: 'args',
          };

        case 'variable':
          return {
            pattern: options.varsIgnorePattern?.toString(),
            variableDescription: 'vars',
          };
      }
    }

    /**
     * Generates the message data about the variable being defined and unused,
     * including the ignore pattern if configured.
     * @param unusedVar eslint-scope variable object.
     * @returns The message data to be used with this unused variable.
     */
    function getDefinedMessageData(
      unusedVar: ScopeVariable,
    ): Record<string, unknown> {
      const def = unusedVar.defs.at(0);
      let additionalMessageData = '';

      if (def) {
        const { pattern, variableDescription } = getVariableDescription(
          defToVariableType(def),
        );

        if (pattern && variableDescription) {
          additionalMessageData = `. Allowed unused ${variableDescription} must match ${pattern}`;
        }
      }

      return {
        action: 'defined',
        additional: additionalMessageData,
        varName: unusedVar.name,
      };
    }

    /**
     * Generate the warning message about the variable being
     * assigned and unused, including the ignore pattern if configured.
     * @param unusedVar eslint-scope variable object.
     * @returns The message data to be used with this unused variable.
     */
    function getAssignedMessageData(
      unusedVar: ScopeVariable,
    ): Record<string, unknown> {
      const def = unusedVar.defs.at(0);
      let additionalMessageData = '';

      if (def) {
        const { pattern, variableDescription } = getVariableDescription(
          defToVariableType(def),
        );

        if (pattern && variableDescription) {
          additionalMessageData = `. Allowed unused ${variableDescription} must match ${pattern}`;
        }
      }

      return {
        action: 'assigned a value',
        additional: additionalMessageData,
        varName: unusedVar.name,
      };
    }

    /**
     * Generate the warning message about a variable being used even though
     * it is marked as being ignored.
     * @param variable eslint-scope variable object
     * @param variableType a simple name for the types of variables that this rule supports
     * @returns The message data to be used with this used ignored variable.
     */
    function getUsedIgnoredMessageData(
      variable: ScopeVariable,
      variableType: VariableType,
    ): Record<string, unknown> {
      const { pattern, variableDescription } =
        getVariableDescription(variableType);

      let additionalMessageData = '';

      if (pattern && variableDescription) {
        additionalMessageData = `. Used ${variableDescription} must not match ${pattern}`;
      }

      return {
        additional: additionalMessageData,
        varName: variable.name,
      };
    }

    function collectUnusedVariables(): ScopeVariable[] {
      /**
       * Checks whether a node is a sibling of the rest property or not.
       * @param node a node to check
       * @returns True if the node is a sibling of the rest property, otherwise false.
       */
      function hasRestSibling(node: TSESTree.Node): boolean {
        return (
          node.type === AST_NODE_TYPES.Property &&
          node.parent.type === AST_NODE_TYPES.ObjectPattern &&
          node.parent.properties[node.parent.properties.length - 1].type ===
            AST_NODE_TYPES.RestElement
        );
      }

      /**
       * Determines if a variable has a sibling rest property
       * @param variable eslint-scope variable object.
       * @returns True if the variable is exported, false if not.
       */
      function hasRestSpreadSibling(variable: ScopeVariable): boolean {
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
      function isAfterLastUsedArg(variable: ScopeVariable): boolean {
        const def = variable.defs[0];
        const params = context.sourceCode.getDeclaredVariables(def.node);
        const posteriorParams = params.slice(params.indexOf(variable) + 1);

        // If any used parameters occur after this parameter, do not report.
        return !posteriorParams.some(
          v => v.references.length > 0 || v.eslintUsed,
        );
      }

      const analysisResults = collectVariables(context);
      const variables = [
        ...Array.from(analysisResults.unusedVariables, variable => ({
          used: false,
          variable,
        })),
        ...Array.from(analysisResults.usedVariables, variable => ({
          used: true,
          variable,
        })),
      ];
      const unusedVariablesReturn: ScopeVariable[] = [];
      for (const { used, variable } of variables) {
        // explicit global variables don't have definitions.
        if (variable.defs.length === 0) {
          if (!used) {
            unusedVariablesReturn.push(variable);
          }

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
          ref => ref.identifier.parent.type === AST_NODE_TYPES.ArrayPattern,
        );

        // skip elements of array destructuring patterns
        if (
          (def.name.parent.type === AST_NODE_TYPES.ArrayPattern ||
            refUsedInArrayPatterns) &&
          def.name.type === AST_NODE_TYPES.Identifier &&
          options.destructuredArrayIgnorePattern?.test(def.name.name)
        ) {
          if (options.reportUsedIgnorePattern && used) {
            context.report({
              node: def.name,
              messageId: 'usedIgnoredVar',
              data: getUsedIgnoredMessageData(variable, 'array-destructure'),
            });
          }
          continue;
        }

        if (def.type === TSESLint.Scope.DefinitionType.ClassName) {
          const hasStaticBlock = def.node.body.body.some(
            node => node.type === AST_NODE_TYPES.StaticBlock,
          );

          if (options.ignoreClassWithStaticInitBlock && hasStaticBlock) {
            continue;
          }
        }

        // skip catch variables
        if (def.type === TSESLint.Scope.DefinitionType.CatchClause) {
          if (options.caughtErrors === 'none') {
            continue;
          }
          // skip ignored parameters
          if (
            def.name.type === AST_NODE_TYPES.Identifier &&
            options.caughtErrorsIgnorePattern?.test(def.name.name)
          ) {
            if (options.reportUsedIgnorePattern && used) {
              context.report({
                node: def.name,
                messageId: 'usedIgnoredVar',
                data: getUsedIgnoredMessageData(variable, 'catch-clause'),
              });
            }
            continue;
          }
        } else if (def.type === TSESLint.Scope.DefinitionType.Parameter) {
          // if "args" option is "none", skip any parameter
          if (options.args === 'none') {
            continue;
          }
          // skip ignored parameters
          if (
            def.name.type === AST_NODE_TYPES.Identifier &&
            options.argsIgnorePattern?.test(def.name.name)
          ) {
            if (options.reportUsedIgnorePattern && used) {
              context.report({
                node: def.name,
                messageId: 'usedIgnoredVar',
                data: getUsedIgnoredMessageData(variable, 'parameter'),
              });
            }
            continue;
          }
          // if "args" option is "after-used", skip used variables
          if (
            options.args === 'after-used' &&
            isFunction(def.name.parent) &&
            !isAfterLastUsedArg(variable)
          ) {
            continue;
          }
        }
        // skip ignored variables
        else if (
          def.name.type === AST_NODE_TYPES.Identifier &&
          options.varsIgnorePattern?.test(def.name.name)
        ) {
          if (
            options.reportUsedIgnorePattern &&
            used &&
            /* enum members are always marked as 'used' by `collectVariables`, but in reality they may be used or
               unused. either way, don't complain about their naming. */
            def.type !== TSESLint.Scope.DefinitionType.TSEnumMember
          ) {
            context.report({
              node: def.name,
              messageId: 'usedIgnoredVar',
              data: getUsedIgnoredMessageData(variable, 'variable'),
            });
          }
          continue;
        }

        if (hasRestSpreadSibling(variable)) {
          continue;
        }

        // in case another rule has run and used the collectUnusedVariables,
        // we want to ensure our selectors that marked variables as used are respected
        if (variable.eslintUsed) {
          continue;
        }

        if (!used) {
          unusedVariablesReturn.push(variable);
        }
      }

      return unusedVariablesReturn;
    }

    return {
      // top-level declaration file handling
      [ambientDeclarationSelector(AST_NODE_TYPES.Program)](
        node: DeclarationSelectorNode,
      ): void {
        if (!isDefinitionFile(context.filename)) {
          return;
        }

        const moduleDecl = nullThrows(
          node.parent,
          NullThrowsReasons.MissingParent,
        ) as TSESTree.Program;

        if (checkForOverridingExportStatements(moduleDecl)) {
          return;
        }

        markDeclarationChildAsUsed(node);
      },

      // children of a namespace that is a child of a declared namespace are auto-exported
      [ambientDeclarationSelector(
        'TSModuleDeclaration[declare = true] > TSModuleBlock TSModuleDeclaration > TSModuleBlock',
      )](node: DeclarationSelectorNode): void {
        const moduleDecl = nullThrows(
          node.parent.parent,
          NullThrowsReasons.MissingParent,
        ) as ModuleDeclarationWithBody;

        if (checkForOverridingExportStatements(moduleDecl)) {
          return;
        }

        markDeclarationChildAsUsed(node);
      },

      // declared namespace handling
      [ambientDeclarationSelector(
        'TSModuleDeclaration[declare = true] > TSModuleBlock',
      )](node: DeclarationSelectorNode): void {
        const moduleDecl = nullThrows(
          node.parent.parent,
          NullThrowsReasons.MissingParent,
        ) as ModuleDeclarationWithBody;

        if (checkForOverridingExportStatements(moduleDecl)) {
          return;
        }

        markDeclarationChildAsUsed(node);
      },

      // namespace handling in definition files
      [ambientDeclarationSelector('TSModuleDeclaration > TSModuleBlock')](
        node: DeclarationSelectorNode,
      ): void {
        if (!isDefinitionFile(context.filename)) {
          return;
        }
        const moduleDecl = nullThrows(
          node.parent.parent,
          NullThrowsReasons.MissingParent,
        ) as ModuleDeclarationWithBody;

        if (checkForOverridingExportStatements(moduleDecl)) {
          return;
        }

        markDeclarationChildAsUsed(node);
      },

      // collect
      'Program:exit'(programNode): void {
        const unusedVars = collectUnusedVariables();

        for (const unusedVar of unusedVars) {
          // Report the first declaration.
          if (unusedVar.defs.length > 0) {
            const usedOnlyAsType = unusedVar.references.some(ref =>
              referenceContainsTypeQuery(ref.identifier),
            );

            const isImportUsedOnlyAsType =
              usedOnlyAsType &&
              unusedVar.defs.some(
                def => def.type === DefinitionType.ImportBinding,
              );
            if (isImportUsedOnlyAsType) {
              continue;
            }

            const writeReferences = unusedVar.references.filter(
              ref =>
                ref.isWrite() &&
                ref.from.variableScope === unusedVar.scope.variableScope,
            );

            const id = writeReferences.length
              ? writeReferences[writeReferences.length - 1].identifier
              : unusedVar.identifiers[0];

            const messageId = usedOnlyAsType ? 'usedOnlyAsType' : 'unusedVar';

            const { start } = id.loc;
            const idLength = id.name.length;

            const loc = {
              start,
              end: {
                column: start.column + idLength,
                line: start.line,
              },
            };

            context.report({
              loc,
              messageId,
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
              loc: getNameLocationInGlobalDirectiveComment(
                context.sourceCode,
                directiveComment,
                unusedVar.name,
              ),
              node: programNode,
              messageId: 'unusedVar',
              data: getDefinedMessageData(unusedVar),
            });
          }
        }
      },
    };

    function checkForOverridingExportStatements(
      node: ModuleDeclarationWithBody | TSESTree.Program,
    ): boolean {
      const cached = MODULE_DECL_CACHE.get(node);
      if (cached != null) {
        return cached;
      }

      const body = getStatementsOfNode(node);

      if (hasOverridingExportStatement(body)) {
        MODULE_DECL_CACHE.set(node, true);
        return true;
      }

      MODULE_DECL_CACHE.set(node, false);
      return false;
    }

    type DeclarationSelectorNode =
      | TSESTree.ClassDeclaration
      | TSESTree.FunctionDeclaration
      | TSESTree.TSDeclareFunction
      | TSESTree.TSEnumDeclaration
      | TSESTree.TSInterfaceDeclaration
      | TSESTree.TSModuleDeclaration
      | TSESTree.TSTypeAliasDeclaration
      | TSESTree.VariableDeclaration;
    function ambientDeclarationSelector(parent: string): string {
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
        ].join(', ')})`,
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

      let scope = context.sourceCode.getScope(node);
      const shouldUseUpperScope = [
        AST_NODE_TYPES.TSDeclareFunction,
        AST_NODE_TYPES.TSModuleDeclaration,
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

function hasOverridingExportStatement(
  body: TSESTree.ProgramStatement[],
): boolean {
  for (const statement of body) {
    if (
      (statement.type === AST_NODE_TYPES.ExportNamedDeclaration &&
        statement.declaration == null) ||
      statement.type === AST_NODE_TYPES.ExportAllDeclaration ||
      statement.type === AST_NODE_TYPES.TSExportAssignment
    ) {
      return true;
    }

    if (
      statement.type === AST_NODE_TYPES.ExportDefaultDeclaration &&
      statement.declaration.type === AST_NODE_TYPES.Identifier
    ) {
      return true;
    }
  }

  return false;
}

function getStatementsOfNode(
  block: ModuleDeclarationWithBody | TSESTree.Program,
): TSESTree.ProgramStatement[] {
  if (block.type === AST_NODE_TYPES.Program) {
    return block.body;
  }

  return block.body.body;
}

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

---

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
