// Forked from https://github.com/eslint/eslint/blob/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/lib/shared/config-validator.js

import util from 'node:util';

import { Legacy } from '@eslint/eslintrc';
import type { AnyRuleModule, Linter } from '@typescript-eslint/utils/ts-eslint';
import type {
  AdditionalPropertiesParams,
  ErrorObject as AjvErrorObject,
  ValidateFunction,
} from 'ajv';
import { builtinRules } from 'eslint/use-at-your-own-risk';

import type { TesterConfigWithDefaults } from '../types';
import { ajvBuilder } from './ajv';
import { configSchema } from './config-schema';
import { emitDeprecationWarning } from './deprecation-warnings';
import { getRuleOptionsSchema } from './getRuleOptionsSchema';
import { hasOwnProperty } from './hasOwnProperty';

type GetAdditionalRule = (ruleId: string) => AnyRuleModule | null;

const { ConfigOps, environments: BuiltInEnvironments } = Legacy;
const ajv = ajvBuilder();
const ruleValidators = new WeakMap<AnyRuleModule, ValidateFunction>();

let validateSchema: ValidateFunction;
const severityMap = {
  error: 2,
  warn: 1,
  off: 0,
} as const;

/**
 * Validates a rule's severity and returns the severity value. Throws an error if the severity is invalid.
 * @param options The given options for the rule.
 * @throws {Error} Wrong severity value.
 */
function validateRuleSeverity(options: Linter.RuleEntry): number | string {
  const severity = Array.isArray(options) ? options[0] : options;
  const normSeverity =
    typeof severity === 'string'
      ? severityMap[severity.toLowerCase() as Linter.SeverityString]
      : severity;

  if (normSeverity === 0 || normSeverity === 1 || normSeverity === 2) {
    return normSeverity;
  }

  throw new Error(
    `\tSeverity should be one of the following: 0 = off, 1 = warn, 2 = error (you passed '${util
      .inspect(severity)
      .replace(/'/gu, '"')
      .replace(/\n/gu, '')}').\n`,
  );
}

/**
 * Validates the non-severity options passed to a rule, based on its schema.
 * @param rule The rule to validate
 * @param localOptions The options for the rule, excluding severity
 * @throws {Error} Any rule validation errors.
 */
function validateRuleSchema(
  rule: AnyRuleModule,
  localOptions: unknown[],
): void {
  if (!ruleValidators.has(rule)) {
    const schema = getRuleOptionsSchema(rule);

    if (schema) {
      ruleValidators.set(rule, ajv.compile(schema));
    }
  }

  const validateRule = ruleValidators.get(rule);

  if (validateRule) {
    validateRule(localOptions);
    if (validateRule.errors) {
      throw new Error(
        validateRule.errors
          .map(
            error =>
              `\tValue ${JSON.stringify(error.data)} ${error.message}.\n`,
          )
          .join(''),
      );
    }
  }
}

/**
 * Validates a rule's options against its schema.
 * @param rule The rule that the config is being validated for
 * @param ruleId The rule's unique name.
 * @param {Array|number} options The given options for the rule.
 * @param source The name of the configuration source to report in any errors. If null or undefined,
 * no source is prepended to the message.
 * @throws {Error} Upon any bad rule configuration.
 */
function validateRuleOptions(
  rule: AnyRuleModule,
  ruleId: string,
  options: Linter.RuleEntry,
  source: string | null = null,
): void {
  try {
    const severity = validateRuleSeverity(options);

    if (severity !== 0) {
      validateRuleSchema(rule, Array.isArray(options) ? options.slice(1) : []);
    }
  } catch (err) {
    const enhancedMessage = `Configuration for rule "${ruleId}" is invalid:\n${
      (err as Error).message
    }`;

    if (typeof source === 'string') {
      throw new Error(`${source}:\n\t${enhancedMessage}`);
    } else {
      throw new Error(enhancedMessage);
    }
  }
}

/**
 * Validates an environment object
 * @param environment The environment config object to validate.
 * @param source The name of the configuration source to report in any errors.
 */
function validateEnvironment(
  environment: Linter.EnvironmentConfig | undefined,
  source: string,
): void {
  // not having an environment is ok
  if (!environment) {
    return;
  }

  Object.keys(environment).forEach(id => {
    const env = BuiltInEnvironments.get(id) ?? null;

    if (!env) {
      const message = `${source}:\n\tEnvironment key "${id}" is unknown\n`;

      throw new Error(message);
    }
  });
}

/**
 * Validates a rules config object
 * @param rulesConfig The rules config object to validate.
 * @param source The name of the configuration source to report in any errors.
 * @param getAdditionalRule A map from strings to loaded rules
 */
function validateRules(
  rulesConfig: Linter.RulesRecord | undefined,
  source: string,
  getAdditionalRule: GetAdditionalRule,
): void {
  if (!rulesConfig) {
    return;
  }

  Object.keys(rulesConfig).forEach(id => {
    const rule = getAdditionalRule(id) ?? builtinRules.get(id) ?? null;
    if (rule == null) {
      return;
    }

    validateRuleOptions(rule, id, rulesConfig[id]!, source);
  });
}

/**
 * Validates a `globals` section of a config file
 * @param globalsConfig The `globals` section
 * @param source The name of the configuration source to report in the event of an error.
 */
function validateGlobals(
  globalsConfig: Linter.GlobalsConfig | undefined,
  source: string | null = null,
): void {
  if (!globalsConfig) {
    return;
  }

  Object.entries(globalsConfig).forEach(
    ([configuredGlobal, configuredValue]) => {
      try {
        ConfigOps.normalizeConfigGlobal(configuredValue);
      } catch (err) {
        throw new Error(
          `ESLint configuration of global '${configuredGlobal}' in ${source} is invalid:\n${
            (err as Error).message
          }`,
        );
      }
    },
  );
}

/**
 * Formats an array of schema validation errors.
 */
function formatErrors(errors: AjvErrorObject[]): string {
  return errors
    .map(error => {
      if (error.keyword === 'additionalProperties') {
        const params = error.params as AdditionalPropertiesParams;
        const formattedPropertyPath = error.dataPath.length
          ? `${error.dataPath.slice(1)}.${params.additionalProperty}`
          : params.additionalProperty;

        return `Unexpected top-level property "${formattedPropertyPath}"`;
      }
      if (error.keyword === 'type') {
        const formattedField = error.dataPath.slice(1);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const formattedExpectedType = Array.isArray(error.schema)
          ? error.schema.join('/')
          : error.schema;
        const formattedValue = JSON.stringify(error.data);

        return `Property "${formattedField}" is the wrong type (expected ${formattedExpectedType} but got \`${formattedValue}\`)`;
      }

      const field =
        error.dataPath[0] === '.' ? error.dataPath.slice(1) : error.dataPath;

      return `"${field}" ${error.message}. Value: ${JSON.stringify(
        error.data,
      )}`;
    })
    .map(message => `\t- ${message}.\n`)
    .join('');
}

/**
 * Validates the top level properties of the config object.
 * @param config The config object to validate.
 * @param source The name of the configuration source to report in any errors.
 * @throws {Error} For any config invalid per the schema.
 */
function validateConfigSchema(
  config: TesterConfigWithDefaults,
  source: string,
): void {
  validateSchema = validateSchema || ajv.compile(configSchema);

  if (!validateSchema(config)) {
    throw new Error(
      `ESLint configuration in ${source} is invalid:\n${formatErrors(
        validateSchema.errors!,
      )}`,
    );
  }

  // @ts-expect-error -- intentional deprecated check
  if (hasOwnProperty(config, 'ecmaFeatures')) {
    emitDeprecationWarning(source, 'ESLINT_LEGACY_ECMAFEATURES');
  }
}

/**
 * Validates an entire config object.
 * @param config The config object to validate.
 * @param source The name of the configuration source to report in any errors.
 * @param getAdditionalRule A map from strings to loaded rules.
 */
export function validate(
  config: TesterConfigWithDefaults,
  source: string,
  getAdditionalRule: GetAdditionalRule,
): void {
  validateConfigSchema(config, source);
  validateRules(config.rules, source, getAdditionalRule);
  validateEnvironment(config.env, source);
  validateGlobals(config.globals, source);

  for (const override of config.overrides ?? []) {
    validateRules(override.rules, source, getAdditionalRule);
    validateEnvironment(override.env, source);
    validateGlobals(config.globals, source);
  }
}
