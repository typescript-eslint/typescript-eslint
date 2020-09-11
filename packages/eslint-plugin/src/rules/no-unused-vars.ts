import {
  TSESTree,
  TSESLint,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { PatternVisitor } from '@typescript-eslint/scope-manager';
import baseRule from 'eslint/lib/rules/no-unused-vars';
import * as util from '../util';

type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;
type Options = util.InferOptionsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-unused-vars',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused variables',
      category: 'Variables',
      recommended: 'warn',
      extendsBaseRule: true,
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages ?? {
      unusedVar: "'{{varName}}' is {{action}} but never used{{additional}}.",
    },
  },
  defaultOptions: [{}],
  create(context) {
    const rules = baseRule.create(context);
    const filename = context.getFilename();
    const MODULE_DECL_CACHE = new Map<TSESTree.TSModuleDeclaration, boolean>();

    /**
     * Gets a list of TS module definitions for a specified variable.
     * @param variable eslint-scope variable object.
     */
    function getModuleNameDeclarations(
      variable: TSESLint.Scope.Variable,
    ): TSESTree.TSModuleDeclaration[] {
      const moduleDeclarations: TSESTree.TSModuleDeclaration[] = [];

      variable.defs.forEach(def => {
        if (def.type === 'TSModuleName') {
          moduleDeclarations.push(def.node);
        }
      });

      return moduleDeclarations;
    }

    /**
     * Determine if an identifier is referencing an enclosing name.
     * This only applies to declarations that create their own scope (modules, functions, classes)
     * @param ref The reference to check.
     * @param nodes The candidate function nodes.
     * @returns True if it's a self-reference, false if not.
     */
    function isBlockSelfReference(
      ref: TSESLint.Scope.Reference,
      nodes: TSESTree.Node[],
    ): boolean {
      let scope: TSESLint.Scope.Scope | null = ref.from;

      while (scope) {
        if (nodes.indexOf(scope.block) >= 0) {
          return true;
        }

        scope = scope.upper;
      }

      return false;
    }

    function isExported(
      variable: TSESLint.Scope.Variable,
      target: AST_NODE_TYPES,
    ): boolean {
      // TS will require that all merged namespaces/interfaces are exported, so we only need to find one
      return variable.defs.some(
        def =>
          def.node.type === target &&
          (def.node.parent?.type === AST_NODE_TYPES.ExportNamedDeclaration ||
            def.node.parent?.type === AST_NODE_TYPES.ExportDefaultDeclaration),
      );
    }

    return {
      ...rules,
      'TSCallSignatureDeclaration, TSConstructorType, TSConstructSignatureDeclaration, TSDeclareFunction, TSEmptyBodyFunctionExpression, TSFunctionType, TSMethodSignature'(
        node:
          | TSESTree.TSCallSignatureDeclaration
          | TSESTree.TSConstructorType
          | TSESTree.TSConstructSignatureDeclaration
          | TSESTree.TSDeclareFunction
          | TSESTree.TSEmptyBodyFunctionExpression
          | TSESTree.TSFunctionType
          | TSESTree.TSMethodSignature,
      ): void {
        // function type signature params create variables because they can be referenced within the signature,
        // but they obviously aren't unused variables for the purposes of this rule.
        for (const param of node.params) {
          visitPattern(param, name => {
            context.markVariableAsUsed(name.name);
          });
        }
      },
      TSEnumDeclaration(): void {
        // enum members create variables because they can be referenced within the enum,
        // but they obviously aren't unused variables for the purposes of this rule.
        const scope = context.getScope();
        for (const variable of scope.variables) {
          context.markVariableAsUsed(variable.name);
        }
      },
      TSMappedType(node): void {
        // mapped types create a variable for their type name, but it's not necessary to reference it,
        // so we shouldn't consider it as unused for the purpose of this rule.
        context.markVariableAsUsed(node.typeParameter.name.name);
      },
      TSModuleDeclaration(): void {
        const childScope = context.getScope();
        const scope = util.nullThrows(
          context.getScope().upper,
          util.NullThrowsReasons.MissingToken(childScope.type, 'upper scope'),
        );
        for (const variable of scope.variables) {
          const moduleNodes = getModuleNameDeclarations(variable);

          if (
            moduleNodes.length === 0 ||
            // ignore unreferenced module definitions, as the base rule will report on them
            variable.references.length === 0 ||
            // ignore exported nodes
            isExported(variable, AST_NODE_TYPES.TSModuleDeclaration)
          ) {
            continue;
          }

          // check if the only reference to a module's name is a self-reference in its body
          // this won't be caught by the base rule because it doesn't understand TS modules
          const isOnlySelfReferenced = variable.references.every(ref => {
            return isBlockSelfReference(ref, moduleNodes);
          });

          if (isOnlySelfReferenced) {
            context.report({
              node: variable.identifiers[0],
              messageId: 'unusedVar',
              data: {
                varName: variable.name,
                action: 'defined',
                additional: '',
              },
            });
          }
        }
      },
      [[
        'TSParameterProperty > AssignmentPattern > Identifier.left',
        'TSParameterProperty > Identifier.parameter',
      ].join(', ')](node: TSESTree.Identifier): void {
        // just assume parameter properties are used as property usage tracking is beyond the scope of this rule
        context.markVariableAsUsed(node.name);
      },
      ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression) > Identifier[name="this"].params'(
        node: TSESTree.Identifier,
      ): void {
        // this parameters should always be considered used as they're pseudo-parameters
        context.markVariableAsUsed(node.name);
      },
      'TSInterfaceDeclaration, TSTypeAliasDeclaration'(
        node: TSESTree.TSInterfaceDeclaration | TSESTree.TSTypeAliasDeclaration,
      ): void {
        const variable = context.getScope().set.get(node.id.name);
        if (!variable) {
          return;
        }
        if (
          variable.references.length === 0 ||
          // ignore exported nodes
          isExported(variable, node.type)
        ) {
          return;
        }

        // check if the type is only self-referenced
        // this won't be caught by the base rule because it doesn't understand self-referencing types
        const isOnlySelfReferenced = variable.references.every(ref => {
          if (
            ref.identifier.range[0] >= node.range[0] &&
            ref.identifier.range[1] <= node.range[1]
          ) {
            return true;
          }
          return false;
        });
        if (isOnlySelfReferenced) {
          context.report({
            node: variable.identifiers[0],
            messageId: 'unusedVar',
            data: {
              varName: variable.name,
              action: 'defined',
              additional: '',
            },
          });
        }
      },

      // declaration file handling
      [ambientDeclarationSelector(AST_NODE_TYPES.Program, true)](
        node: DeclarationSelectorNode,
      ): void {
        if (!util.isDefinitionFile(filename)) {
          return;
        }
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

        // declared modules with an `export =` statement will only export that one thing
        // all other statements are not automatically exported in this case
        if (checkModuleDeclForExportEquals(moduleDecl)) {
          return;
        }

        markDeclarationChildAsUsed(node);
      },
    };

    function checkModuleDeclForExportEquals(
      node: TSESTree.TSModuleDeclaration,
    ): boolean {
      const cached = MODULE_DECL_CACHE.get(node);
      if (cached != null) {
        return cached;
      }

      for (const statement of node.body?.body ?? []) {
        if (statement.type === AST_NODE_TYPES.TSExportAssignment) {
          MODULE_DECL_CACHE.set(node, true);
          return true;
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
        ].join(', ')})${childDeclare ? '[declare=true]' : ''}`,
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

      const scope = context.getScope();
      const { variableScope } = scope;
      if (variableScope !== scope) {
        for (const id of identifiers) {
          const superVar = variableScope.set.get(id.name);
          if (superVar) {
            superVar.eslintUsed = true;
          }
        }
      } else {
        for (const id of identifiers) {
          context.markVariableAsUsed(id.name);
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
