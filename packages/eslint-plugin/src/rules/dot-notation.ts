import { TSESTree } from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import baseRule from 'eslint/lib/rules/dot-notation';
import {
  InferOptionsTypeFromRule,
  InferMessageIdsTypeFromRule,
  createRule,
  getParserServices,
} from '../util';

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'dot-notation',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce dot notation whenever possible',
      category: 'Best Practices',
      recommended: false,
      extendsBaseRule: true,
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowKeywords: {
            type: 'boolean',
            default: true,
          },
          allowPattern: {
            type: 'string',
            default: '',
          },
          allowPrivateClassPropertyAccess: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: baseRule.meta.fixable,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [
    {
      allowPrivateClassPropertyAccess: false,
      allowKeywords: true,
      allowPattern: '',
    },
  ],
  create(context, [options]) {
    const rules = baseRule.create(context);
    const allowPrivateClassPropertyAccess =
      options.allowPrivateClassPropertyAccess;

    const parserServices = getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    return {
      MemberExpression(node: TSESTree.MemberExpression): void {
        if (allowPrivateClassPropertyAccess && node.computed) {
          // for perf reasons - only fetch the symbol if we have to
          const objectSymbol = typeChecker.getSymbolAtLocation(
            parserServices.esTreeNodeToTSNodeMap.get(node.property),
          );
          if (
            objectSymbol?.getDeclarations()?.[0]?.modifiers?.[0].kind ===
            ts.SyntaxKind.PrivateKeyword
          ) {
            return;
          }
        }
        rules.MemberExpression(node);
      },
    };
  },
});
