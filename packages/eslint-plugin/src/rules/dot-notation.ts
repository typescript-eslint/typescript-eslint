import { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';
import * as tsutils from 'tsutils';
import { getESLintCoreRule } from '../util/getESLintCoreRule';
import {
  createRule,
  getParserServices,
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';

const baseRule = getESLintCoreRule('dot-notation');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'dot-notation',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'enforce dot notation whenever possible',
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
          allowProtectedClassPropertyAccess: {
            type: 'boolean',
            default: false,
          },
          allowIndexSignaturePropertyAccess: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: baseRule.meta.fixable,
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [
    {
      allowPrivateClassPropertyAccess: false,
      allowProtectedClassPropertyAccess: false,
      allowIndexSignaturePropertyAccess: false,
      allowKeywords: true,
      allowPattern: '',
    },
  ],
  create(context, [options]) {
    const rules = baseRule.create(context);

    const { program, esTreeNodeToTSNodeMap } = getParserServices(context);
    const typeChecker = program.getTypeChecker();

    const allowPrivateClassPropertyAccess =
      options.allowPrivateClassPropertyAccess;
    const allowProtectedClassPropertyAccess =
      options.allowProtectedClassPropertyAccess;
    const allowIndexSignaturePropertyAccess =
      (options.allowIndexSignaturePropertyAccess ?? false) ||
      tsutils.isCompilerOptionEnabled(
        program.getCompilerOptions(),
        // @ts-expect-error - TS is refining the type to never for some reason
        'noPropertyAccessFromIndexSignature',
      );

    return {
      MemberExpression(node: TSESTree.MemberExpression): void {
        if (
          (allowPrivateClassPropertyAccess ||
            allowProtectedClassPropertyAccess ||
            allowIndexSignaturePropertyAccess) &&
          node.computed
        ) {
          // for perf reasons - only fetch symbols if we have to
          const propertySymbol = typeChecker.getSymbolAtLocation(
            esTreeNodeToTSNodeMap.get(node.property),
          );
          const modifierKind =
            propertySymbol?.getDeclarations()?.[0]?.modifiers?.[0].kind;
          if (
            (allowPrivateClassPropertyAccess &&
              modifierKind === ts.SyntaxKind.PrivateKeyword) ||
            (allowProtectedClassPropertyAccess &&
              modifierKind === ts.SyntaxKind.ProtectedKeyword)
          ) {
            return;
          }
          if (
            propertySymbol === undefined &&
            allowIndexSignaturePropertyAccess
          ) {
            const objectType = typeChecker.getTypeAtLocation(
              esTreeNodeToTSNodeMap.get(node.object),
            );
            const indexType = objectType
              .getNonNullableType()
              .getStringIndexType();
            if (indexType != undefined) {
              return;
            }
          }
        }
        rules.MemberExpression(node);
      },
    };
  },
});
