import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type {
  JSONSchema4AnyOfSchema,
  JSONSchema4ArraySchema,
  JSONSchema4ObjectSchema,
} from '@typescript-eslint/utils/json-schema';
import type {
  ArrayOfStringOrObject,
  ArrayOfStringOrObjectPatterns,
} from 'eslint/lib/rules/no-restricted-imports';
import type { Ignore } from 'ignore';
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
      type: 'array';
      items: [
        {
          type: 'object';
          properties: {
            paths: {
              type: 'array';
              items: {
                anyOf: [
                  { type: 'string' },
                  {
                    type: 'object';
                    properties: JSONSchema4ObjectSchema['properties'];
                    required: string[];
                  },
                ];
              };
            };
            patterns: {
              anyOf: [
                { type: 'array'; items: { type: 'string' } },
                {
                  type: 'array';
                  items: {
                    type: 'object';
                    properties: JSONSchema4ObjectSchema['properties'];
                    required: string[];
                  };
                },
              ];
            };
          };
        },
      ];
    },
  ];
};

const allowTypeImportsOptionSchema: JSONSchema4ObjectSchema['properties'] = {
  allowTypeImports: {
    type: 'boolean',
    description: 'Disallow value imports, but allow type-only imports.',
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
      items: [
        {
          type: 'object',
          properties: {
            paths: arrayOfStringsOrObjects,
            patterns: arrayOfStringsOrObjectPatterns,
          },
          additionalProperties: false,
        },
      ],
      additionalItems: false,
    },
  ],
};

function isObjectOfPaths(
  obj: unknown,
): obj is { paths: ArrayOfStringOrObject } {
  return Object.prototype.hasOwnProperty.call(obj, 'paths');
}

function isObjectOfPatterns(
  obj: unknown,
): obj is { patterns: ArrayOfStringOrObjectPatterns } {
  return Object.prototype.hasOwnProperty.call(obj, 'patterns');
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

export default createRule<Options, MessageIds>({
  name: 'no-restricted-imports',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow specified modules when loaded by `import`',
      extendsBaseRule: true,
    },
    messages: baseRule.meta.messages,
    fixable: baseRule.meta.fixable,
    schema,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);
    const { options } = context;

    if (options.length === 0) {
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
    for (const restrictedPattern of restrictedPatterns) {
      if (
        typeof restrictedPattern === 'object' &&
        restrictedPattern.allowTypeImports
      ) {
        // Following how ignore is configured in the base rule
        allowedImportTypeMatchers.push(
          ignore({
            allowRelativePaths: true,
            ignoreCase: !restrictedPattern.caseSensitive,
          }).add(restrictedPattern.group),
        );
      }
    }
    function isAllowedTypeImportPattern(importSource: string): boolean {
      return (
        // As long as there's one matching pattern that allows type import
        allowedImportTypeMatchers.some(matcher => matcher.ignores(importSource))
      );
    }

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration): void {
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
      },
      'ExportNamedDeclaration[source]'(
        node: TSESTree.ExportNamedDeclaration & {
          source: NonNullable<TSESTree.ExportNamedDeclaration['source']>;
        },
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
      ExportAllDeclaration: rules.ExportAllDeclaration,
    };
  },
});
