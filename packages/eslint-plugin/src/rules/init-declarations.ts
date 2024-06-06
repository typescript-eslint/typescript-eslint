import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('init-declarations');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'init-declarations',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require or disallow initialization in variable declarations',
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: ['always'],
  create(context, [mode]) {
    // Make a custom context to adjust the the loc of reports where the base
    // rule's behavior is a bit too aggressive with TS-specific syntax (namely,
    // type annotations).
    function getBaseContextOverride(): typeof context {
      const reportOverride: typeof context.report = descriptor => {
        if ('node' in descriptor && descriptor.loc == null) {
          const { node, ...rest } = descriptor;
          // We only want to special case the report loc when reporting on
          // variables declarations that are not initialized. Declarations that
          // _are_ initialized get reported by the base rule due to a setting to
          // prohibit initializing variables entirely, in which case underlining
          // the whole node including the type annotation and initializer is
          // appropriate.
          if (
            node.type === AST_NODE_TYPES.VariableDeclarator &&
            node.init == null
          ) {
            context.report({
              ...rest,
              loc: getReportLoc(node),
            });
            return;
          }
        }

        context.report(descriptor);
      };

      // `return { ...context, report: reportOverride }` isn't safe because the
      // `context` object has some getters that need to be preserved.
      //
      // `return new Proxy(context, ...)` doesn't work because `context` has
      // non-configurable properties that throw when constructing a Proxy.
      //
      // So, we'll just use Proxy on a dummy object and use the `get` trap to
      // proxy `context`'s properties.
      return new Proxy({} as typeof context, {
        get: (target, prop, receiver): unknown =>
          prop === 'report'
            ? reportOverride
            : Reflect.get(context, prop, receiver),
      });
    }

    const rules = baseRule.create(getBaseContextOverride());

    return {
      'VariableDeclaration:exit'(node: TSESTree.VariableDeclaration): void {
        if (mode === 'always') {
          if (node.declare) {
            return;
          }
          if (isAncestorNamespaceDeclared(node)) {
            return;
          }
        }

        rules['VariableDeclaration:exit'](node);
      },
    };

    function isAncestorNamespaceDeclared(
      node: TSESTree.VariableDeclaration,
    ): boolean {
      let ancestor: TSESTree.Node | undefined = node.parent;

      while (ancestor) {
        if (
          ancestor.type === AST_NODE_TYPES.TSModuleDeclaration &&
          ancestor.declare
        ) {
          return true;
        }

        ancestor = ancestor.parent;
      }

      return false;
    }
  },
});

/**
 * When reporting an uninitialized variable declarator, get the loc excluding
 * the type annotation.
 */
function getReportLoc(
  node: TSESTree.VariableDeclarator,
): TSESTree.SourceLocation {
  const start: TSESTree.Position = structuredClone(node.loc.start);
  const end: TSESTree.Position = {
    line: node.loc.start.line,
    // `if (id.type === AST_NODE_TYPES.Identifier)` is a condition for
    // reporting in the base rule (as opposed to things like destructuring
    // assignment), so the type assertion should always be valid.
    column:
      node.loc.start.column + (node.id as TSESTree.Identifier).name.length,
  };

  return {
    start,
    end,
  };
}
