import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';

import { createRule, getModifiers, getParserServices } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('dot-notation');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

const defaultOptions: Options = [
  {
    allowIndexSignaturePropertyAccess: false,
    allowKeywords: true,
    allowPattern: '',
    allowPrivateClassPropertyAccess: false,
    allowProtectedClassPropertyAccess: false,
  },
];

export default createRule<Options, MessageIds>({
  name: 'dot-notation',
  meta: {
    type: 'suggestion',
    defaultOptions,
    docs: {
      description: 'Enforce dot notation whenever possible',
      extendsBaseRule: true,
      frozen: true,
      recommended: 'stylistic',
      requiresTypeChecking: true,
    },
    fixable: baseRule.meta.fixable,
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowIndexSignaturePropertyAccess: {
            type: 'boolean',
            default: false,
            description:
              'Whether to allow accessing properties matching an index signature with array notation.',
          },
          allowKeywords: {
            type: 'boolean',
            default: true,
            description: 'Whether to allow keywords such as ["class"]`.',
          },
          allowPattern: {
            type: 'string',
            default: '',
            description: 'Regular expression of names to allow.',
          },
          allowPrivateClassPropertyAccess: {
            type: 'boolean',
            default: false,
            description:
              'Whether to allow accessing class members marked as `private` with array notation.',
          },
          allowProtectedClassPropertyAccess: {
            type: 'boolean',
            default: false,
            description:
              'Whether to allow accessing class members marked as `protected` with array notation.',
          },
        },
      },
    ],
  },
  defaultOptions,
  create(context, [options]) {
    const rules = baseRule.create(context);
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const allowPrivateClassPropertyAccess =
      options.allowPrivateClassPropertyAccess;
    const allowProtectedClassPropertyAccess =
      options.allowProtectedClassPropertyAccess;
    const allowIndexSignaturePropertyAccess =
      (options.allowIndexSignaturePropertyAccess ?? false) ||
      tsutils.isCompilerOptionEnabled(
        services.program.getCompilerOptions(),
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
          const propertySymbol =
            services.getSymbolAtLocation(node.property) ??
            services
              .getTypeAtLocation(node.object)
              .getNonNullableType()
              .getProperties()
              .find(
                propertySymbol =>
                  node.property.type === AST_NODE_TYPES.Literal &&
                  propertySymbol.escapedName === node.property.value,
              );
          const modifierKind = getModifiers(
            propertySymbol?.getDeclarations()?.[0],
          )?.[0].kind;
          if (
            (allowPrivateClassPropertyAccess &&
              modifierKind === ts.SyntaxKind.PrivateKeyword) ||
            (allowProtectedClassPropertyAccess &&
              modifierKind === ts.SyntaxKind.ProtectedKeyword)
          ) {
            return;
          }
          if (propertySymbol == null && allowIndexSignaturePropertyAccess) {
            const objectType = services
              .getTypeAtLocation(node.object)
              .getNonNullableType();
            const indexInfos = checker.getIndexInfosOfType(objectType);
            if (
              indexInfos.some(
                info => info.keyType.flags & ts.TypeFlags.StringLike,
              )
            ) {
              return;
            }
          }
        }
        rules.MemberExpression(node);
      },
    };
  },
});
