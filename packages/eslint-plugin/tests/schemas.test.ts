import { schemaToTypes } from '@typescript-eslint/rule-schema-to-typescript-types';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as oxfmt from 'oxfmt';

import oxfmtConfig from '../../../.oxfmtrc.json';

import rules from '../src/rules/index.js';
import { areOptionsValid } from './areOptionsValid.js';

const snapshotFolder = path.resolve(__dirname, 'schema-snapshots');

const SKIPPED_RULES_FOR_TYPE_GENERATION = new Set(['indent']);
// Set this to a rule name to only run that rule
const ONLY = 'naming-convention';

const ruleEntries = Object.entries(rules);

describe('Rule schemas should be convertible to TS types for documentation purposes', async () => {
  beforeAll(async () => {
    await fs.mkdir(snapshotFolder, { recursive: true });
  });

  describe.for(ruleEntries)('%s', ([ruleName, ruleDef]) => {
    // skip for documentation purposes
    it.skipIf(SKIPPED_RULES_FOR_TYPE_GENERATION.has(ruleName))(ruleName, () => {
      expect(SKIPPED_RULES_FOR_TYPE_GENERATION).not.toContain(ruleName);
    });

    it(ruleName, { only: ruleName === ONLY }, async ({ expect }) => {
      const schemaString = (
        await oxfmt.format(
          'schema.json',
          JSON.stringify(
            ruleDef.meta.schema,
            (k, v: unknown) => {
              if (k === 'enum' && Array.isArray(v)) {
                // sort enum arrays for consistency regardless of source order
                v.sort();
              } else if (
                typeof v === 'object' &&
                v != null &&
                !Array.isArray(v)
              ) {
                // sort properties for consistency regardless of source order
                return Object.fromEntries(
                  Object.entries(v).sort(([a], [b]) => a.localeCompare(b)),
                );
              }
              return v;
            },
            // use the indent feature as it forces all objects to be multiline
            // if we don't do this then prettier decides what objects are multiline
            // based on what fits on a line - which looks less consistent
            // and makes changes harder to understand as you can have multiple
            // changes per line, or adding a prop can restructure an object
            2,
          ),
          oxfmtConfig as oxfmt.FormatOptions,
        )
      ).code;

      fs.writeFile(
        path.join(snapshotFolder, 'schema.ts'),
        schemaToTypes(ruleDef.meta.schema),
      );

      const compilationResult = (
        await oxfmt.format(
          'schema.ts',
          schemaToTypes(ruleDef.meta.schema),
          oxfmtConfig as oxfmt.FormatOptions,
        )
      ).code;

      const snapshotPath = path.join(snapshotFolder, `${ruleName}.shot`);

      const snapshotContent = [
        '',
        '# SCHEMA:',
        '',
        schemaString,
        '',
        '# TYPES:',
        '',
        compilationResult,
      ].join('\n');

      await expect(snapshotContent).toMatchFileSnapshot(snapshotPath);
    });
  });
});

describe('There should be no old snapshots for rules that have been deleted', async () => {
  const files = await fs.readdir(snapshotFolder, { encoding: 'utf-8' });
  const names = new Set(
    ruleEntries
      .filter(([k]) => !SKIPPED_RULES_FOR_TYPE_GENERATION.has(k))
      .map(([k]) => `${k}.shot`),
  );

  test.for(files)('%s', (file, { expect }) => {
    expect(names).toContain(file);
  });
});

const VALID_SCHEMA_PROPS = new Set([
  '$defs',
  '$ref',
  '$schema',
  'additionalItems',
  'additionalProperties',
  'allOf',
  'anyOf',
  'default',
  'definitions',
  'dependencies',
  'description',
  'enum',
  'exclusiveMaximum',
  'exclusiveMinimum',
  'extends',
  'format',
  'id',
  'items',
  'maximum',
  'maxItems',
  'maxLength',
  'maxProperties',
  'minimum',
  'minItems',
  'minLength',
  'minProperties',
  'multipleOf',
  'not',
  'oneOf',
  'pattern',
  'patternProperties',
  'properties',
  'required',
  'title',
  'type',
  'uniqueItems',
] as const);

describe('Rules should only define valid keys on schemas', () => {
  describe.for(ruleEntries)('%s', ([ruleName, ruleDef]) => {
    it(ruleName, { only: ruleName === ONLY }, () => {
      JSON.stringify(ruleDef.meta.schema, (key, value: unknown) => {
        if (key === '') {
          // the root object will have key ""
          return value;
        }
        if (key === '$defs' || key === 'definitions' || key === 'properties') {
          // definition keys and property keys should not be validated, only the values
          return Object.values(value as object);
        }
        if (`${Number(key)}` === key) {
          // hack to detect arrays as JSON.stringify will traverse them and stringify the number
          return value;
        }

        expect(VALID_SCHEMA_PROPS).toContain(key);
        return value;
      });
    });
  });
});

describe('Rule schemas should validate options correctly', () => {
  // Normally, we use the rule's default options as an example of valid options.
  // However, the defaults might not actually be valid (especially in the case
  // where the defaults have to cover multiple incompatible options).
  // This override allows providing example valid options for rules which don't
  // accept their defaults.
  const overrideValidOptions: Record<string, unknown> = {
    'func-call-spacing': ['never'],
    semi: ['never'],
  };

  test.for(ruleEntries)(
    '%s must accept valid options',
    ([ruleName, rule], { expect }) => {
      expect(
        areOptionsValid(
          rule,
          // Keep accepting deprecated defaultOptions for backward compatibility.
          // eslint-disable-next-line @typescript-eslint/no-deprecated
          overrideValidOptions[ruleName] ?? rule.defaultOptions,
        ),
      ).toBe(true);
    },
  );

  test.for(ruleEntries)(
    '%s rejects arbitrary options',
    ([, rule], { expect }) => {
      expect(
        areOptionsValid(rule, [{ 'arbitrary-schemas.test.ts': true }]),
      ).toBe(false);
    },
  );
});
