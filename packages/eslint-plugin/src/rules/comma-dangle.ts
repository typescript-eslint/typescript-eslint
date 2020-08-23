import * as util from '../util';
import baseRule from 'eslint/lib/rules/comma-dangle';
import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';

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
      description: 'Require or disallow trailing comma',
      category: 'Stylistic Issues',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: {
      definitions: {
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
              $ref: '#/definitions/value',
            },
            {
              type: 'object',
              properties: {
                arrays: { $ref: '#/definitions/valueWithIgnore' },
                objects: { $ref: '#/definitions/valueWithIgnore' },
                imports: { $ref: '#/definitions/valueWithIgnore' },
                exports: { $ref: '#/definitions/valueWithIgnore' },
                functions: { $ref: '#/definitions/valueWithIgnore' },
                enums: { $ref: '#/definitions/valueWithIgnore' },
                generics: { $ref: '#/definitions/valueWithIgnore' },
                tuples: { $ref: '#/definitions/valueWithIgnore' },
              },
              additionalProperties: false,
            },
          ],
        },
      ],
    },
    fixable: 'code',
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
