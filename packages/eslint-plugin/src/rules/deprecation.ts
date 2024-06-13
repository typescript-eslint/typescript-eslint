import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';
import type {
  EntityName,
  JSDocComment,
  JSDocMemberName,
  NodeArray,
  Symbol as TSSymbol,
  TypeChecker,
} from 'typescript';
import {
  getAllJSDocTags,
  isIdentifier,
  isJSDocDeprecatedTag,
  isJSDocLinkLike,
  isJSDocMemberName,
  isQualifiedName,
  isShorthandPropertyAssignment,
  TypeFormatFlags,
} from 'typescript';

import { createRule, getParserServices } from '../util';

type Options = [];
type MessageIds =
  | 'deprecated'
  | 'deprecatedWithReason'
  | 'deprecatedSignature'
  | 'deprecatedSignatureWithReason';

function shouldIgnoreIdentifier(node: TSESTree.Identifier): boolean {
  switch (node.parent.type) {
    case AST_NODE_TYPES.FunctionDeclaration:
    case AST_NODE_TYPES.TSDeclareFunction:
    case AST_NODE_TYPES.ClassDeclaration:
    case AST_NODE_TYPES.TSInterfaceDeclaration:
    case AST_NODE_TYPES.TSTypeAliasDeclaration:
    case AST_NODE_TYPES.Property:
      return true;
    case AST_NODE_TYPES.VariableDeclarator:
      return node.parent.init !== node;
    case AST_NODE_TYPES.TSPropertySignature:
    case AST_NODE_TYPES.PropertyDefinition:
      return node.parent.key === node;
  }
  return false;
}

function formatEntityName(name: EntityName | JSDocMemberName): string {
  let current = '';
  let currentName: EntityName | JSDocMemberName | undefined = name;

  while (currentName) {
    if (isQualifiedName(currentName) || isJSDocMemberName(currentName)) {
      if (current === '') {
        current = currentName.right.text;
      } else {
        current = `${currentName.right.text}#${current}`;
      }
      currentName = currentName.left;
      continue;
    }
    if (isIdentifier(currentName)) {
      if (current === '') {
        return currentName.text;
      }
      current = `${currentName.text}#${current}`;
      currentName = undefined;
      continue;
    }
    break;
  }
  //
  return current;
}

function formatComments(comment: string | NodeArray<JSDocComment>): string {
  if (typeof comment === 'string') {
    return comment;
  }

  // TODO: Implement a detection algorithm to detect "Use X instead", resolve types and give a different error message
  /*
  const links = comment.filter<JSDocLink | JSDocLinkCode | JSDocLinkPlain>(
    isJSDocLinkLike,
  );
  if (links.length === 1) {
    const link = links[0];

    if (link.name !== undefined) {
      return `Use '${formatEntityName(link.name)}' instead.`;
    }
  }
  */

  return comment
    .map(single => {
      if (isJSDocLinkLike(single)) {
        if (single.name) {
          return formatEntityName(single.name);
        }
        return single.text;
      }
      return single.text;
    })
    .join('');
}

function handleMaybeDeprecatedSymbol(
  ctx: Readonly<RuleContext<MessageIds, Options>>,
  services: ParserServicesWithTypeInformation,
  checker: TypeChecker,
  node: TSESTree.Node,
  sym: TSSymbol,
  name: string,
): void {
  if (
    node.type === AST_NODE_TYPES.Identifier &&
    (node.parent.type === AST_NODE_TYPES.CallExpression ||
      node.parent.type === AST_NODE_TYPES.NewExpression) &&
    node.parent.callee === node
  ) {
    /*
     Function call
     We should in this case check the resolved signature instead
     */

    const tsParent = services.esTreeNodeToTSNodeMap.get(node.parent);
    const sig = checker.getResolvedSignature(tsParent);
    if (sig === undefined) {
      return;
    }
    const decl = sig.getDeclaration();
    if ((decl as undefined | typeof decl) === undefined) {
      // May happen if we have an implicit constructor on a class
      return;
    }

    for (const tag of getAllJSDocTags(decl, isJSDocDeprecatedTag)) {
      if (tag.comment) {
        ctx.report({
          messageId: 'deprecatedSignatureWithReason',
          node,
          data: {
            name,
            signature: checker.signatureToString(
              sig,
              tsParent,
              TypeFormatFlags.WriteTypeArgumentsOfSignature,
            ),
            reason: formatComments(tag.comment),
          },
        });
        return;
      }
      ctx.report({
        messageId: 'deprecatedSignature',
        node,
        data: {
          name,
          signature: checker.signatureToString(
            sig,
            tsParent,
            TypeFormatFlags.WriteTypeArgumentsOfSignature,
          ),
        },
      });
    }
    return;
  }

  for (const decl of sym.getDeclarations() ?? []) {
    for (const tag of getAllJSDocTags(decl, isJSDocDeprecatedTag)) {
      if (tag.comment) {
        ctx.report({
          messageId: 'deprecatedWithReason',
          node,
          data: {
            name,
            reason: formatComments(tag.comment),
          },
        });
        return;
      }
      ctx.report({
        messageId: 'deprecated',
        node,
        data: {
          name,
        },
      });
    }
  }
}

export default createRule<Options, MessageIds>({
  name: 'deprecation',
  meta: {
    docs: {
      description: 'Disallow usage of deprecated APIs',
      requiresTypeChecking: true,
      recommended: 'strict',
    },
    messages: {
      deprecated: `'{{name}}' is deprecated.`,
      deprecatedWithReason: `'{{name}}' is deprecated: {{reason}}`,
      deprecatedSignature: `The signature '{{signature}}' of '{{name}}' is deprecated.`,
      deprecatedSignatureWithReason: `The signature '{{signature}}' of '{{name}}' is deprecated: {{reason}}`,
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create(ctx) {
    const services = getParserServices(ctx);
    const checker = services.program.getTypeChecker();

    return {
      // TODO: Support a[b] syntax
      Property(node): void {
        const par = services.esTreeNodeToTSNodeMap.get(node);

        if (node.key.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        if (isShorthandPropertyAssignment(par)) {
          const sym = checker.getTypeAtLocation(par.name).getSymbol();
          if (sym === undefined) {
            return;
          }

          handleMaybeDeprecatedSymbol(
            ctx,
            services,
            checker,
            node,
            sym,
            node.key.name,
          );
        }
        return;
      },
      Identifier(node): void {
        if (shouldIgnoreIdentifier(node)) {
          return;
        }

        const sym = services.getSymbolAtLocation(node);
        if (sym === undefined) {
          // Types unavailable
          return;
        }

        try {
          handleMaybeDeprecatedSymbol(
            ctx,
            services,
            checker,
            node,
            sym,
            node.name,
          );
        } catch {
          return;
        }
      },
      MemberExpression(node): void {
        if (node.property.type === AST_NODE_TYPES.PrivateIdentifier) {
          const identifier = node.property;

          const sym = services.getSymbolAtLocation(identifier);
          if (sym === undefined) {
            // Types unavailable
            return;
          }

          try {
            handleMaybeDeprecatedSymbol(
              ctx,
              services,
              checker,
              identifier,
              sym,
              `#${identifier.name}`,
            );
          } catch {
            return;
          }
        }
      },
    };
  },
});
