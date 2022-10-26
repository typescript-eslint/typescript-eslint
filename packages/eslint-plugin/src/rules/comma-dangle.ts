import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('comma-dangle');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

type Option = Options[0];
type NormalizedOptions = Required<
  Pick<Exclude<Option, string>, 'enums' | 'generics' | 'tuples'>
>;

const OPTION_VALUE_SCHEME = [
  'always-multiline',
  'always',
  'never',
  'only-multiline',
];

const DEFAULT_OPTION_VALUE = 'never';

function normalizeOptions(options: Option): NormalizedOptions {
  if (typeof options === 'string') {
    return {
      enums: options,
      generics: options,
      tuples: options,
    };
  }
  return {
    enums: options.enums ?? DEFAULT_OPTION_VALUE,
    generics: options.generics ?? DEFAULT_OPTION_VALUE,
    tuples: options.tuples ?? DEFAULT_OPTION_VALUE,
  };
}

export default util.createRule<Options, MessageIds>({
  name: 'comma-dangle',
  meta: {
    type: 'layout',
    docs: {
      description: 'Require or disallow trailing commas',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: {
      $defs: {
        value: {
          enum: OPTION_VALUE_SCHEME,
        },
        valueWithIgnore: {
          enum: [...OPTION_VALUE_SCHEME, 'ignore'],
        },
      },
      type: 'array',
      items: [
        {
          oneOf: [
            {
              $ref: '#/$defs/value',
            },
            {
              type: 'object',
              properties: {
                arrays: { $ref: '#/$defs/valueWithIgnore' },
                objects: { $ref: '#/$defs/valueWithIgnore' },
                imports: { $ref: '#/$defs/valueWithIgnore' },
                exports: { $ref: '#/$defs/valueWithIgnore' },
                functions: { $ref: '#/$defs/valueWithIgnore' },
                enums: { $ref: '#/$defs/valueWithIgnore' },
                generics: { $ref: '#/$defs/valueWithIgnore' },
                tuples: { $ref: '#/$defs/valueWithIgnore' },
              },
              additionalProperties: false,
            },
          ],
        },
      ],
      additionalProperties: false,
    },
    fixable: 'code',
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
  },
  defaultOptions: ['never'],
  create(context, [options]) {
    const rules = baseRule.create(context);
    const sourceCode = context.getSourceCode();
    const normalizedOptions = normalizeOptions(options);

    const predicate = {
      always: forceComma,
      'always-multiline': forceCommaIfMultiline,
      'only-multiline': allowCommaIfMultiline,
      never: forbidComma,
      ignore: (): void => {},
    };

    function last(nodes: TSESTree.Node[]): TSESTree.Node | null {
      return nodes[nodes.length - 1] ?? null;
    }

    function getLastItem(node: TSESTree.Node): TSESTree.Node | null {
      switch (node.type) {
        case AST_NODE_TYPES.TSEnumDeclaration:
          return last(node.members);
        case AST_NODE_TYPES.TSTypeParameterDeclaration:
          return last(node.params);
        case AST_NODE_TYPES.TSTupleType:
          return last(node.elementTypes);
        default:
          return null;
      }
    }

    function getTrailingToken(node: TSESTree.Node): TSESTree.Token | null {
      const last = getLastItem(node);
      const trailing = last && sourceCode.getTokenAfter(last);
      return trailing;
    }

    function isMultiline(node: TSESTree.Node): boolean {
      const last = getLastItem(node);
      const lastToken = sourceCode.getLastToken(node);
      return last?.loc.end.line !== lastToken?.loc.end.line;
    }

    function forbidComma(node: TSESTree.Node): void {
      const last = getLastItem(node);
      const trailing = getTrailingToken(node);
      if (last && trailing && util.isCommaToken(trailing)) {
        context.report({
          node,
          messageId: 'unexpected',
          fix(fixer) {
            return fixer.remove(trailing);
          },
        });
      }
    }

    function forceComma(node: TSESTree.Node): void {
      const last = getLastItem(node);
      const trailing = getTrailingToken(node);
      if (last && trailing && !util.isCommaToken(trailing)) {
        context.report({
          node,
          messageId: 'missing',
          fix(fixer) {
            return fixer.insertTextAfter(last, ',');
          },
        });
      }
    }

    function allowCommaIfMultiline(node: TSESTree.Node): void {
      if (!isMultiline(node)) {
        forbidComma(node);
      }
    }

    function forceCommaIfMultiline(node: TSESTree.Node): void {
      if (isMultiline(node)) {
        forceComma(node);
      } else {
        forbidComma(node);
      }
    }

    return {
      ...rules,
      TSEnumDeclaration: predicate[normalizedOptions.enums],
      TSTypeParameterDeclaration: predicate[normalizedOptions.generics],
      TSTupleType: predicate[normalizedOptions.tuples],
    };
  },
});
