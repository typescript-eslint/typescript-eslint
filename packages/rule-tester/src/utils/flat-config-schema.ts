// Forked from https://github.com/eslint/eslint/blob/4b23ffd6454cfb1a269430f5fe28e7d1c37b9d3e/lib/config/flat-config-schema.js

import type {
  Processor,
  SharedConfig,
} from '@typescript-eslint/utils/ts-eslint';

import { normalizeSeverityToNumber } from './severity';

type PluginMemberName = `${string}/${string}`;

interface ObjectPropertySchema<T = unknown> {
  merge: ((a: T, b: T) => T) | string;
  validate: ((value: unknown) => asserts value is T) | string;
}

const ruleSeverities = new Map<SharedConfig.RuleLevel, SharedConfig.Severity>([
  ['error', 2],
  ['off', 0],
  ['warn', 1],
  [0, 0],
  [1, 1],
  [2, 2],
]);

/**
 * Check if a value is a non-null object.
 * @param value The value to check.
 * @returns `true` if the value is a non-null object.
 */
function isNonNullObject(value: unknown): boolean {
  // eslint-disable-next-line eqeqeq
  return typeof value === 'object' && value !== null;
}

/**
 * Check if a value is a non-null non-array object.
 * @param value The value to check.
 * @returns `true` if the value is a non-null non-array object.
 */
function isNonArrayObject(value: unknown): boolean {
  return isNonNullObject(value) && !Array.isArray(value);
}

/**
 * Deeply merges two non-array objects.
 * @param first The base object.
 * @param second The overrides object.
 * @param mergeMap Maps the combination of first and second arguments to a merged result.
 * @returns An object with properties from both first and second.
 */
function deepMerge<First extends object, Second extends object>(
  first: First,
  second: Second,
  mergeMap = new Map<First | Second, Map<First | Second, First & Second>>(),
): First & Second {
  let secondMergeMap = mergeMap.get(first);

  if (secondMergeMap) {
    const result = secondMergeMap.get(second);

    if (result) {
      // If this combination of first and second arguments has been already visited, return the previously created result.
      return result;
    }
  } else {
    secondMergeMap = new Map();
    mergeMap.set(first, secondMergeMap);
  }

  /*
   * First create a result object where properties from the second object
   * overwrite properties from the first. This sets up a baseline to use
   * later rather than needing to inspect and change every property
   * individually.
   */
  const result = {
    ...first,
    ...second,
  } as First & ObjectLike & Second;

  delete (result as ObjectLike).__proto__; // don't merge own property "__proto__"

  // Store the pending result for this combination of first and second arguments.
  secondMergeMap.set(second, result);

  for (const key of Object.keys(second)) {
    // avoid hairy edge case
    if (
      key === '__proto__' ||
      !Object.prototype.propertyIsEnumerable.call(first, key)
    ) {
      continue;
    }

    const firstValue = (first as ObjectLike)[key] as object | undefined;
    const secondValue = (second as ObjectLike)[key] as object | undefined;

    if (isNonArrayObject(firstValue) && isNonArrayObject(secondValue)) {
      (result as ObjectLike)[key] = deepMerge(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        firstValue!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        secondValue!,
        mergeMap,
      );
    } else if (secondValue === undefined) {
      (result as ObjectLike)[key] = firstValue;
    }
  }

  return result;
}

/**
 * Normalizes the rule options config for a given rule by ensuring that
 * it is an array and that the first item is 0, 1, or 2.
 * @param ruleOptions The rule options config.
 * @returns An array of rule options.
 */
function normalizeRuleOptions(
  ruleOptions: SharedConfig.RuleLevel | SharedConfig.RuleLevelAndOptions,
): SharedConfig.RuleLevelAndOptions {
  const finalOptions = Array.isArray(ruleOptions)
    ? [...ruleOptions]
    : [ruleOptions];

  finalOptions[0] = ruleSeverities.get(
    finalOptions[0] as SharedConfig.RuleLevel,
  );

  return structuredClone(finalOptions as SharedConfig.RuleLevelAndOptions);
}

/**
 * Determines if an object has any methods.
 * @param object The object to check.
 * @returns `true` if the object has any methods.
 */
function hasMethod(object: Record<string, unknown>): boolean {
  for (const key of Object.keys(object)) {
    if (typeof object[key] === 'function') {
      return true;
    }
  }

  return false;
}

/**
 * The error type when a rule's options are configured with an invalid type.
 */
class InvalidRuleOptionsError extends Error {
  readonly messageData: { ruleId: string; value: unknown };
  readonly messageTemplate: string;

  constructor(ruleId: string, value: unknown) {
    super(
      `Key "${ruleId}": Expected severity of "off", 0, "warn", 1, "error", or 2.`,
    );
    this.messageTemplate = 'invalid-rule-options';
    this.messageData = { ruleId, value };
  }
}

/**
 * Validates that a value is a valid rule options entry.
 * @param ruleId Rule name being configured.
 * @param value The value to check.
 * @throws {InvalidRuleOptionsError} If the value isn't a valid rule options.
 */
function assertIsRuleOptions(ruleId: string, value: unknown): void {
  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    !Array.isArray(value)
  ) {
    throw new InvalidRuleOptionsError(ruleId, value);
  }
}

/**
 * The error type when a rule's severity is invalid.
 */
class InvalidRuleSeverityError extends Error {
  readonly messageData: { ruleId: string; value: unknown };
  readonly messageTemplate: string;

  constructor(ruleId: string, value: unknown) {
    super(
      `Key "${ruleId}": Expected severity of "off", 0, "warn", 1, "error", or 2.`,
    );
    this.messageTemplate = 'invalid-rule-severity';
    this.messageData = { ruleId, value };
  }
}

/**
 * Validates that a value is valid rule severity.
 * @param ruleId Rule name being configured.
 * @param value The value to check.
 * @throws {InvalidRuleSeverityError} If the value isn't a valid rule severity.
 */
function assertIsRuleSeverity(ruleId: string, value: unknown): void {
  const severity = ruleSeverities.get(value as SharedConfig.RuleLevel);

  if (severity === undefined) {
    throw new InvalidRuleSeverityError(ruleId, value);
  }
}

/**
 * Validates that a given string is the form pluginName/objectName.
 * @param value The string to check.
 */
function assertIsPluginMemberName(
  value: unknown,
): asserts value is PluginMemberName {
  if (typeof value !== 'string' || !/[@\w$-]+(?:\/[\w$-]+)+$/iu.test(value)) {
    throw new TypeError(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Expected string in the form "pluginName/objectName" but found "${value}".`,
    );
  }
}

/**
 * Validates that a value is an object.
 * @param value The value to check.
 */
function assertIsObject(value: unknown): void {
  if (!isNonNullObject(value)) {
    throw new TypeError('Expected an object.');
  }
}

/**
 * The error type when there's an eslintrc-style options in a flat config.
 */
class IncompatibleKeyError extends Error {
  readonly messageData: { key: string };
  readonly messageTemplate: string;

  /**
   * @param key The invalid key.
   */
  constructor(key: string) {
    super(
      'This appears to be in eslintrc format rather than flat config format.',
    );
    this.messageTemplate = 'eslintrc-incompat';
    this.messageData = { key };
  }
}

/**
 * The error type when there's an eslintrc-style plugins array found.
 */
class IncompatiblePluginsError extends Error {
  readonly messageData: { plugins: string[] };
  readonly messageTemplate: string;

  constructor(plugins: string[]) {
    super(
      'This appears to be in eslintrc format (array of strings) rather than flat config format (object).',
    );
    this.messageTemplate = 'eslintrc-plugins';
    this.messageData = { plugins };
  }
}

const booleanSchema = {
  merge: 'replace',
  validate: 'boolean',
} satisfies ObjectPropertySchema;

const ALLOWED_SEVERITIES = new Set(['error', 'warn', 'off', 2, 1, 0]);

const disableDirectiveSeveritySchema: ObjectPropertySchema<SharedConfig.RuleLevel> =
  {
    merge(
      first: SharedConfig.RuleLevel | boolean | undefined,
      second: SharedConfig.RuleLevel | boolean | undefined,
    ): SharedConfig.RuleLevel {
      const value = second ?? first;

      if (typeof value === 'boolean') {
        return value ? 'warn' : 'off';
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return normalizeSeverityToNumber(value!);
    },
    validate(value: unknown) {
      if (
        !(
          ALLOWED_SEVERITIES.has(value as number | string) ||
          typeof value === 'boolean'
        )
      ) {
        throw new TypeError(
          'Expected one of: "error", "warn", "off", 0, 1, 2, or a boolean.',
        );
      }
    },
  };

const deepObjectAssignSchema = {
  merge<First extends ObjectLike, Second extends ObjectLike>(
    first = {} as First,
    second = {} as Second,
  ): First & Second {
    return deepMerge(first, second);
  },
  validate: 'object',
};

export type ObjectLike = Record<string, unknown>;

const languageOptionsSchema = {
  merge(first: ObjectLike = {}, second: ObjectLike = {}): object {
    const result = deepMerge(first, second);

    for (const [key, value] of Object.entries(result)) {
      /*
       * Special case: Because the `parser` property is an object, it should
       * not be deep merged. Instead, it should be replaced if it exists in
       * the second object. To make this more generic, we just check for
       * objects with methods and replace them if they exist in the second
       * object.
       */
      if (isNonArrayObject(value)) {
        if (hasMethod(value as ObjectLike)) {
          result[key] = second[key] ?? first[key];
          continue;
        }

        // for other objects, make sure we aren't reusing the same object
        result[key] = { ...(result[key] as ObjectLike) };
        continue;
      }
    }

    return result;
  },
  validate: 'object',
};

const languageSchema: ObjectPropertySchema<PluginMemberName> = {
  merge: 'replace',
  validate: assertIsPluginMemberName,
};

const pluginsSchema = {
  merge(first: ObjectLike = {}, second: ObjectLike = {}): object {
    const keys = new Set([...Object.keys(first), ...Object.keys(second)]);
    const result: ObjectLike = {};

    // manually validate that plugins are not redefined
    for (const key of keys) {
      // avoid hairy edge case
      if (key === '__proto__') {
        continue;
      }

      if (key in first && key in second && first[key] !== second[key]) {
        throw new TypeError(`Cannot redefine plugin "${key}".`);
      }

      result[key] = second[key] || first[key];
    }

    return result;
  },
  validate(value: unknown): void {
    // first check the value to be sure it's an object
    if (value == null || typeof value !== 'object') {
      throw new TypeError('Expected an object.');
    }

    // make sure it's not an array, which would mean eslintrc-style is used
    if (Array.isArray(value)) {
      throw new IncompatiblePluginsError(value as string[]);
    }

    // second check the keys to make sure they are objects
    for (const key of Object.keys(value)) {
      // avoid hairy edge case
      if (key === '__proto__') {
        continue;
      }

      if (
        (value as ObjectLike)[key] == null ||
        typeof (value as ObjectLike)[key] !== 'object'
      ) {
        throw new TypeError(`Key "${key}": Expected an object.`);
      }
    }
  },
};

const processorSchema: ObjectPropertySchema<Processor.LooseProcessorModule> = {
  merge: 'replace',
  validate(value: unknown) {
    if (typeof value === 'string') {
      assertIsPluginMemberName(value);
    } else if (value && typeof value === 'object') {
      if (
        typeof (value as Processor.LooseProcessorModule).preprocess !==
          'function' ||
        typeof (value as Processor.LooseProcessorModule).postprocess !==
          'function'
      ) {
        throw new TypeError(
          'Object must have a preprocess() and a postprocess() method.',
        );
      }
    } else {
      throw new TypeError('Expected an object or a string.');
    }
  },
};

type ConfigRules = Record<string, SharedConfig.RuleLevelAndOptions>;

const rulesSchema = {
  merge(first: ConfigRules = {}, second: ConfigRules = {}): ConfigRules {
    const result: ConfigRules = {
      ...first,
      ...second,
    };

    for (const ruleId of Object.keys(result)) {
      try {
        // avoid hairy edge case
        if (ruleId === '__proto__') {
          delete result.__proto__;
          continue;
        }

        result[ruleId] = normalizeRuleOptions(result[ruleId]);

        /*
         * If either rule config is missing, then the correct
         * config is already present and we just need to normalize
         * the severity.
         */
        if (!(ruleId in first) || !(ruleId in second)) {
          continue;
        }

        const firstRuleOptions = normalizeRuleOptions(first[ruleId]);
        const secondRuleOptions = normalizeRuleOptions(second[ruleId]);

        /*
         * If the second rule config only has a severity (length of 1),
         * then use that severity and keep the rest of the options from
         * the first rule config.
         */
        if (secondRuleOptions.length === 1) {
          result[ruleId] = [secondRuleOptions[0], ...firstRuleOptions.slice(1)];
          continue;
        }

        /*
         * In any other situation, then the second rule config takes
         * precedence. That means the value at `result[ruleId]` is
         * already correct and no further work is necessary.
         */
      } catch (ex) {
        throw new Error(`Key "${ruleId}": ${(ex as Error).message}`, {
          cause: ex,
        });
      }
    }

    return result;
  },

  validate(value: ConfigRules): void {
    assertIsObject(value);

    /*
     * We are not checking the rule schema here because there is no
     * guarantee that the rule definition is present at this point. Instead
     * we wait and check the rule schema during the finalization step
     * of calculating a config.
     */
    for (const ruleId of Object.keys(value)) {
      // avoid hairy edge case
      if (ruleId === '__proto__') {
        continue;
      }

      const ruleOptions = value[ruleId];

      assertIsRuleOptions(ruleId, ruleOptions);

      if (Array.isArray(ruleOptions)) {
        assertIsRuleSeverity(ruleId, ruleOptions[0]);
      } else {
        assertIsRuleSeverity(ruleId, ruleOptions);
      }
    }
  },
};

/**
 * Creates a schema that always throws an error. Useful for warning
 * about eslintrc-style keys.
 * @param key The eslintrc key to create a schema for.
 */
function createEslintrcErrorSchema(key: string): ObjectPropertySchema {
  return {
    merge: 'replace',
    validate(): void {
      throw new IncompatibleKeyError(key);
    },
  };
}

const eslintrcKeys = [
  'env',
  'extends',
  'globals',
  'ignorePatterns',
  'noInlineConfig',
  'overrides',
  'parser',
  'parserOptions',
  'reportUnusedDisableDirectives',
  'root',
];

export const flatConfigSchema = {
  $schema: { type: 'string' },

  // Original ESLint schemas from flat-config-schema.js

  // eslintrc-style keys that should always error
  ...Object.fromEntries(
    eslintrcKeys.map(key => [key, createEslintrcErrorSchema(key)]),
  ),

  // flat config keys
  language: languageSchema,
  languageOptions: languageOptionsSchema,
  linterOptions: {
    schema: {
      noInlineConfig: booleanSchema,
      reportUnusedDisableDirectives: disableDirectiveSeveritySchema,
    },
  },
  plugins: pluginsSchema,
  processor: processorSchema,
  rules: rulesSchema,
  settings: deepObjectAssignSchema,

  // not in ESLint source, but seemingly relevant?
  defaultFilenames: {
    additionalProperties: false,
    properties: {
      ts: { type: 'string' },
      tsx: { type: 'string' },
    },
    required: ['ts', 'tsx'],
    type: 'object',
  },

  // @typescript-eslint/rule-tester extensions

  dependencyConstraints: {
    additionalProperties: {
      type: 'string',
    },
    type: 'object',
  },
  files: { items: { type: 'string' }, type: 'array' },
};
