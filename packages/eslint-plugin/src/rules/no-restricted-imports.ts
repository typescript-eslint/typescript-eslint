import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import baseRule, {
  ArrayOfStringOrObject,
  ArrayOfStringOrObjectPatterns,
} from 'eslint/lib/rules/no-restricted-imports';
import ignore, { Ignore } from 'ignore';
import {
  createRule,
  deepMerge,
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

const allowTypeImportsOptionSchema = {
  allowTypeImports: {
    type: 'boolean',
    default: false,
  },
};
const schemaForMergeArrayOfStringsOrObjects = {
  items: {
    anyOf: [
      {},
      {
        properties: allowTypeImportsOptionSchema,
      },
    ],
  },
};
const schemaForMergeArrayOfStringsOrObjectPatterns = {
  anyOf: [
    {},
    {
      items: {
        properties: allowTypeImportsOptionSchema,
      },
    },
  ],
};
const schema = deepMerge(
  { ...baseRule.meta.schema },
  {
    anyOf: [
      schemaForMergeArrayOfStringsOrObjects,
      {
        items: {
          properties: {
            paths: schemaForMergeArrayOfStringsOrObjects,
            patterns: schemaForMergeArrayOfStringsOrObjectPatterns,
          },
        },
      },
    ],
  },
);

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
      category: 'Best Practices',
      recommended: false,
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
    const allowedTypeImportPathNameSet: Set<string> = new Set();
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
        allowedImportTypeMatchers.push(ignore().add(restrictedPattern.group));
      }
    }
    function isAllowedTypeImportPattern(importSource: string): boolean {
      return allowedImportTypeMatchers.every(matcher => {
        return matcher.ignores(importSource);
      });
    }

    return {
      ImportDeclaration(node): void {
        if (typeof node.source.value !== 'string') {
          return;
        }
        if (node.importKind === 'type') {
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
      ExportNamedDeclaration(node): void {
        if (
          node.source?.type !== AST_NODE_TYPES.Literal ||
          typeof node.source.value !== 'string'
        ) {
          return;
        }
        if (node.exportKind === 'type') {
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
