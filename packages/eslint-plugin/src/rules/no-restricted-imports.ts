import type { TSESTree } from '@typescript-eslint/utils';
import type {
  JSONSchema4AnyOfSchema,
  JSONSchema4ArraySchema,
  JSONSchema4ObjectSchema,
} from '@typescript-eslint/utils/json-schema';
import type {
  ArrayOfStringOrObject,
  ArrayOfStringOrObjectPatterns,
  RuleListener,
} from 'eslint/lib/rules/no-restricted-imports';
import type { Ignore } from 'ignore';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import ignore from 'ignore';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';

import { createRule } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('no-restricted-imports');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

// In some versions of eslint, the base rule has a completely incompatible schema
// This helper function is to safely try to get parts of the schema. If it's not
// possible, we'll fallback to less strict checks.
const tryAccess = <T>(getter: () => T, fallback: T): T => {
  try {
    return getter();
  } catch {
    return fallback;
  }
};

const baseSchema = baseRule.meta.schema as {
  anyOf: [
    unknown,
    {
      items: [
        {
          properties: {
            paths: {
              items: {
                anyOf: [
                  { type: 'string' },
                  {
                    properties: JSONSchema4ObjectSchema['properties'];
                    required: string[];
                    type: 'object';
                  },
                ];
              };
              type: 'array';
            };
            patterns: {
              anyOf: [
                { items: { type: 'string' }; type: 'array' },
                {
                  items: {
                    properties: JSONSchema4ObjectSchema['properties'];
                    required: string[];
                    type: 'object';
                  };
                  type: 'array';
                },
              ];
            };
          };
          type: 'object';
        },
      ];
      type: 'array';
    },
  ];
};

const allowTypeImportsOptionSchema: JSONSchema4ObjectSchema['properties'] = {
  allowTypeImports: {
    type: 'boolean',
    description: 'Whether to allow type-only imports for a path.',
  },
};

const arrayOfStringsOrObjects: JSONSchema4ArraySchema = {
  type: 'array',
  items: {
    anyOf: [
      { type: 'string' },
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ...tryAccess(
            () =>
              baseSchema.anyOf[1].items[0].properties.paths.items.anyOf[1]
                .properties,
            undefined,
          ),
          ...allowTypeImportsOptionSchema,
        },
        required: tryAccess(
          () =>
            baseSchema.anyOf[1].items[0].properties.paths.items.anyOf[1]
              .required,
          undefined,
        ),
      },
    ],
  },
  uniqueItems: true,
};

const arrayOfStringsOrObjectPatterns: JSONSchema4AnyOfSchema = {
  anyOf: [
    {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    },
    {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          ...tryAccess(
            () =>
              baseSchema.anyOf[1].items[0].properties.patterns.anyOf[1].items
                .properties,
            undefined,
          ),
          ...allowTypeImportsOptionSchema,
        },
        required: tryAccess(
          () =>
            baseSchema.anyOf[1].items[0].properties.patterns.anyOf[1].items
              .required,
          [],
        ),
      },
      uniqueItems: true,
    },
  ],
};

const schema: JSONSchema4AnyOfSchema = {
  anyOf: [
    arrayOfStringsOrObjects,
    {
      type: 'array',
      additionalItems: false,
      items: [
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            paths: arrayOfStringsOrObjects,
            patterns: arrayOfStringsOrObjectPatterns,
          },
        },
      ],
    },
  ],
};

function isObjectOfPaths(
  obj: unknown,
): obj is { paths: ArrayOfStringOrObject } {
  return !!obj && Object.hasOwn(obj, 'paths');
}

function isObjectOfPatterns(
  obj: unknown,
): obj is { patterns: ArrayOfStringOrObjectPatterns } {
  return !!obj && Object.hasOwn(obj, 'patterns');
}

function isOptionsArrayOfStringOrObject(
  options: Options,
): options is ArrayOfStringOrObject {
  if (isObjectOfPaths(options[0])) {
    return false;
  }
  if (isObjectOfPatterns(options[0])) {
    return false;
  }
  return true;
}

function getRestrictedPaths(options: Options): ArrayOfStringOrObject {
  if (isOptionsArrayOfStringOrObject(options)) {
    return options;
  }
  if (isObjectOfPaths(options[0])) {
    return options[0].paths;
  }
  return [];
}

function getRestrictedPatterns(
  options: Options,
): ArrayOfStringOrObjectPatterns {
  if (isObjectOfPatterns(options[0])) {
    return options[0].patterns;
  }
  return [];
}

function shouldCreateRule(
  baseRules: RuleListener,
  options: Options,
): baseRules is Exclude<RuleListener, Record<string, never>> {
  if (Object.keys(baseRules).length === 0 || options.length === 0) {
    return false;
  }

  if (!isOptionsArrayOfStringOrObject(options)) {
    return !!(options[0].paths?.length || options[0].patterns?.length);
  }

  return true;
}

export default createRule<Options, MessageIds>({
  name: 'no-restricted-imports',
  meta: {
    type: 'suggestion',
    // defaultOptions, -- base rule does not use defaultOptions
    deprecated: {
      deprecatedSince: '8.45.0',
      replacedBy: [
        {
          rule: {
            name: 'no-restricted-imports',
            url: 'https://eslint.org/docs/latest/rules/no-restricted-imports',
          },
        },
      ],
    },
    docs: {
      description: 'Disallow specified modules when loaded by `import`',
      extendsBaseRule: true,
    },
    fixable: baseRule.meta.fixable,
    messages: baseRule.meta.messages,
    schema,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);
    const { options } = context;

    if (!shouldCreateRule(rules, options)) {
      return {};
    }

    const restrictedPaths = getRestrictedPaths(options);
    const allowedTypeImportPathNameSet = new Set<string>();
    for (const restrictedPath of restrictedPaths) {
      if (
        typeof restrictedPath === 'object' &&
        restrictedPath.allowTypeImports
      ) {
        allowedTypeImportPathNameSet.add(restrictedPath.name);
      }
    }
    function isAllowedTypeImportPath(importSource: string): boolean {
      return allowedTypeImportPathNameSet.has(importSource);
    }

    const restrictedPatterns = getRestrictedPatterns(options);
    const allowedImportTypeMatchers: Ignore[] = [];
    const allowedImportTypeRegexMatchers: RegExp[] = [];
    for (const restrictedPattern of restrictedPatterns) {
      if (
        typeof restrictedPattern === 'object' &&
        restrictedPattern.allowTypeImports
      ) {
        // Following how ignore is configured in the base rule
        if (restrictedPattern.group) {
          allowedImportTypeMatchers.push(
            ignore({
              allowRelativePaths: true,
              ignoreCase: !restrictedPattern.caseSensitive,
            }).add(restrictedPattern.group),
          );
        }
        if (restrictedPattern.regex) {
          allowedImportTypeRegexMatchers.push(
            new RegExp(
              restrictedPattern.regex,
              restrictedPattern.caseSensitive ? 'u' : 'iu',
            ),
          );
        }
      }
    }
    function isAllowedTypeImportPattern(importSource: string): boolean {
      return (
        // As long as there's one matching pattern that allows type import
        allowedImportTypeMatchers.some(matcher =>
          matcher.ignores(importSource),
        ) ||
        allowedImportTypeRegexMatchers.some(regex => regex.test(importSource))
      );
    }

    function checkImportNode(node: TSESTree.ImportDeclaration): void {
      if (
        node.importKind === 'type' ||
        (node.specifiers.length > 0 &&
          node.specifiers.every(
            specifier =>
              specifier.type === AST_NODE_TYPES.ImportSpecifier &&
              specifier.importKind === 'type',
          ))
      ) {
        const importSource = node.source.value.trim();
        if (
          !isAllowedTypeImportPath(importSource) &&
          !isAllowedTypeImportPattern(importSource)
        ) {
          return rules.ImportDeclaration(node);
        }
      } else {
        return rules.ImportDeclaration(node);
      }
    }

    return {
      ExportAllDeclaration: rules.ExportAllDeclaration,
      'ExportNamedDeclaration[source]'(
        node: {
          source: NonNullable<TSESTree.ExportNamedDeclaration['source']>;
        } & TSESTree.ExportNamedDeclaration,
      ): void {
        if (
          node.exportKind === 'type' ||
          (node.specifiers.length > 0 &&
            node.specifiers.every(specifier => specifier.exportKind === 'type'))
        ) {
          const importSource = node.source.value.trim();
          if (
            !isAllowedTypeImportPath(importSource) &&
            !isAllowedTypeImportPattern(importSource)
          ) {
            return rules.ExportNamedDeclaration(node);
          }
        } else {
          return rules.ExportNamedDeclaration(node);
        }
      },
      ImportDeclaration: checkImportNode,
      TSImportEqualsDeclaration(
        node: TSESTree.TSImportEqualsDeclaration,
      ): void {
        if (
          node.moduleReference.type === AST_NODE_TYPES.TSExternalModuleReference
        ) {
          const synthesizedImport: TSESTree.ImportDeclaration = {
            ...node,
            type: AST_NODE_TYPES.ImportDeclaration,
            assertions: [],
            attributes: [],
            source: node.moduleReference.expression,
            specifiers: [
              {
                ...node.id,
                type: AST_NODE_TYPES.ImportDefaultSpecifier,
                local: node.id,
                // @ts-expect-error -- parent types are incompatible but it's fine for the purposes of this extension
                parent: node.id.parent,
              },
            ],
          };
          return checkImportNode(synthesizedImport);
        }
      },
    };
  },
});
