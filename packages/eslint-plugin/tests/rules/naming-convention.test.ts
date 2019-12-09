import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule, {
  MessageIds,
  Options,
  PredefinedFormats,
  Selector,
  Selectors,
  selectorTypeToMessageString,
} from '../../src/rules/naming-convention';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const formatTestNames: Readonly<Record<
  PredefinedFormats,
  Record<'valid' | 'invalid', string[]>
>> = {
  camelCase: {
    valid: ['strictCamelCase', 'lower', 'camelCaseUNSTRICT'],
    invalid: ['snake_case', 'UPPER_CASE', 'UPPER', 'StrictPascalCase'],
  },
  strictCamelCase: {
    valid: ['strictCamelCase', 'lower'],
    invalid: [
      'snake_case',
      'UPPER_CASE',
      'UPPER',
      'StrictPascalCase',
      'camelCaseUNSTRICT',
    ],
  },
  PascalCase: {
    valid: [
      'StrictPascalCase',
      'Pascal',
      'I18n',
      'PascalCaseUNSTRICT',
      'UPPER',
    ],
    invalid: ['snake_case', 'UPPER_CASE', 'strictCamelCase'],
  },
  StrictPascalCase: {
    valid: ['StrictPascalCase', 'Pascal', 'I18n'],
    invalid: [
      'snake_case',
      'UPPER_CASE',
      'UPPER',
      'strictCamelCase',
      'PascalCaseUNSTRICT',
    ],
  },
  UPPER_CASE: {
    valid: ['UPPER_CASE', 'UPPER'],
    invalid: [
      'lower',
      'snake_case',
      'SNAKE_case_UNSTRICT',
      'strictCamelCase',
      'StrictPascalCase',
    ],
  },
  // eslint-disable-next-line @typescript-eslint/camelcase
  snake_case: {
    valid: ['snake_case', 'lower'],
    invalid: [
      'UPPER_CASE',
      'SNAKE_case_UNSTRICT',
      'strictCamelCase',
      'StrictPascalCase',
    ],
  },
};

const REPLACE_REGEX = /%/g;

type Cases = {
  code: string[];
  options: Omit<Options[0], 'format'>;
}[];
function createValidTestCases(cases: Cases): TSESLint.ValidTestCase<Options>[] {
  const newCases: TSESLint.ValidTestCase<Options>[] = [];

  for (const test of cases) {
    for (const [formatLoose, names] of Object.entries(formatTestNames)) {
      const format = [formatLoose as PredefinedFormats];
      for (const name of names.valid) {
        const createCase = (
          preparedName: string,
          options: Selector<Selectors>,
        ): TSESLint.ValidTestCase<Options> => ({
          options: [
            {
              ...(options as Options[0]),
              filter: '[iI]gnored',
            },
          ],
          code: `// ${JSON.stringify(options)}\n${test.code
            .map(code => code.replace(REPLACE_REGEX, preparedName))
            .join('\n')}`,
        });

        newCases.push(
          createCase(name, {
            ...test.options,
            format,
          }),

          // leadingUnderscore
          createCase(name, {
            ...test.options,
            format,
            leadingUnderscore: 'forbid',
          }),
          createCase(`_${name}`, {
            ...test.options,
            format,
            leadingUnderscore: 'require',
          }),
          createCase(`_${name}`, {
            ...test.options,
            format,
            leadingUnderscore: 'allow',
          }),
          createCase(name, {
            ...test.options,
            format,
            leadingUnderscore: 'allow',
          }),

          // trailingUnderscore
          createCase(name, {
            ...test.options,
            format,
            trailingUnderscore: 'forbid',
          }),
          createCase(`${name}_`, {
            ...test.options,
            format,
            trailingUnderscore: 'require',
          }),
          createCase(`${name}_`, {
            ...test.options,
            format,
            trailingUnderscore: 'allow',
          }),
          createCase(name, {
            ...test.options,
            format,
            trailingUnderscore: 'allow',
          }),

          // prefix
          createCase(`MyPrefix${name}`, {
            ...test.options,
            format,
            prefix: ['MyPrefix'],
          }),
          createCase(`MyPrefix2${name}`, {
            ...test.options,
            format,
            prefix: ['MyPrefix1', 'MyPrefix2'],
          }),

          // suffix
          createCase(`${name}MySuffix`, {
            ...test.options,
            format,
            suffix: ['MySuffix'],
          }),
          createCase(`${name}MySuffix2`, {
            ...test.options,
            format,
            suffix: ['MySuffix1', 'MySuffix2'],
          }),
        );
      }
    }
  }

  return newCases;
}
function createInvalidTestCases(
  cases: Cases,
): TSESLint.InvalidTestCase<MessageIds, Options>[] {
  const newCases: TSESLint.InvalidTestCase<MessageIds, Options>[] = [];

  for (const test of cases) {
    for (const [formatLoose, names] of Object.entries(formatTestNames)) {
      const format = [formatLoose as PredefinedFormats];
      for (const name of names.invalid) {
        const createCase = (
          preparedName: string,
          options: Selector<Selectors>,
          messageId: MessageIds,
          data: Record<string, unknown> = {},
        ): TSESLint.InvalidTestCase<MessageIds, Options> => ({
          options: [
            {
              ...(options as Options[0]),
              filter: '[iI]gnored',
            },
          ],
          code: `// ${JSON.stringify(options)}\n${test.code
            .map(code => code.replace(REPLACE_REGEX, preparedName))
            .join('\n')}`,
          errors: test.code.map(() => ({
            messageId,
            ...(test.options.selector !== 'default'
              ? {
                  data: {
                    type: selectorTypeToMessageString(test.options.selector),
                    name: preparedName,
                    ...data,
                  },
                }
              : // default will use the correct selector, so don't assert on data
                {}),
          })),
        });

        const prefixSingle = ['MyPrefix'];
        const prefixMulti = ['MyPrefix1', 'MyPrefix2'];
        const suffixSingle = ['MySuffix'];
        const suffixMulti = ['MySuffix1', 'MySuffix2'];

        newCases.push(
          createCase(
            name,
            {
              ...test.options,
              format,
            },
            'doesNotMatchFormat',
            { formats: format.join(', ') },
          ),

          // leadingUnderscore
          createCase(
            `_${name}`,
            {
              ...test.options,
              format,
              leadingUnderscore: 'forbid',
            },
            'unexpectedUnderscore',
            { position: 'leading' },
          ),
          createCase(
            name,
            {
              ...test.options,
              format,
              leadingUnderscore: 'require',
            },
            'missingUnderscore',
            { position: 'leading' },
          ),

          // trailingUnderscore
          createCase(
            `${name}_`,
            {
              ...test.options,
              format,
              trailingUnderscore: 'forbid',
            },
            'unexpectedUnderscore',
            { position: 'trailing' },
          ),
          createCase(
            name,
            {
              ...test.options,
              format,
              trailingUnderscore: 'require',
            },
            'missingUnderscore',
            { position: 'trailing' },
          ),

          // prefix
          createCase(
            name,
            {
              ...test.options,
              format,
              prefix: prefixSingle,
            },
            'missingAffix',
            { position: 'prefix', affixes: prefixSingle.join(', ') },
          ),
          createCase(
            name,
            {
              ...test.options,
              format,
              prefix: prefixMulti,
            },
            'missingAffix',
            {
              position: 'prefix',
              affixes: prefixMulti.join(', '),
            },
          ),

          // suffix
          createCase(
            name,
            {
              ...test.options,
              format,
              suffix: suffixSingle,
            },
            'missingAffix',
            { position: 'suffix', affixes: suffixSingle.join(', ') },
          ),
          createCase(
            name,
            {
              ...test.options,
              format,
              suffix: suffixMulti,
            },
            'missingAffix',
            {
              position: 'suffix',
              affixes: suffixMulti.join(', '),
            },
          ),
        );
      }
    }
  }

  return newCases;
}

const variableCases = [
  'const % = 1;',
  'let % = 1;',
  'var % = 1;',
  'const {%} = {ignored: 1};',
  'const {% = 2} = {ignored: 1};',
  'const {...%} = {ignored: 1};',
  'const [%] = [1];',
  'const [% = 1] = [1];',
  'const [...%] = [1];',
];
const functionCases = [
  'function % () {}',
  '(function % () {});',
  'declare function % ();',
];
const parameterCases = [
  'function ignored(%) {}',
  '(function (%) {});',
  'declare function ignored(%);',
  'function ignored({%}) {}',
  'function ignored(...%) {}',
  'function ignored({% = 1}) {}',
  'function ignored({...%}) {}',
  'function ignored([%]) {}',
  'function ignored([% = 1]) {}',
  'function ignored([...%]) {}',
];
const propertyCases = [
  'const ignored = { %: 1 };',
  'const ignored = { "%": 1 };',
  'interface Ignored { %: string }',
  'interface Ignored { "%": string }',
  'type Ignored = { %: string }',
  'type Ignored = { "%": string }',
  'class Ignored { private % = 1 }',
  'class Ignored { private "%" = 1 }',
  'class Ignored { private readonly % = 1 }',
  'class Ignored { private static % = 1 }',
  'class Ignored { private static readonly % = 1 }',
];
const parameterPropertyCases = [
  'class Ignored { constructor(private %) {} }',
  'class Ignored { constructor(readonly %) {} }',
  'class Ignored { constructor(private readonly %) {} }',
];

const cases: Cases = [
  {
    code: [
      'const % = 1;',
      'function % () {}',
      '(function (%) {});',
      'class Ignored { constructor(private %) {} }',
      'const ignored = { % };',
      'interface Ignored { %: string }',
      'type Ignored = { %: string }',
      'class Ignored { private % = 1 }',
    ],
    options: {
      selector: 'default',
      filter: '[iI]gnored',
    },
  },
  {
    code: variableCases,
    options: {
      selector: 'variable',
    },
  },
  {
    code: functionCases,
    options: {
      selector: 'function',
    },
  },
  {
    code: parameterCases,
    options: {
      selector: 'parameter',
    },
  },
  {
    code: parameterPropertyCases,
    options: {
      selector: 'parameterProperty',
    },
  },
  {
    code: ['class Ignored { constructor(private readonly %) {} }'],
    options: {
      selector: 'parameterProperty',
      modifiers: ['readonly'],
    },
  },
  {
    code: propertyCases,
    options: {
      selector: 'property',
    },
  },
  {
    code: [
      'class Ignored { abstract private static readonly % = 1; ignoredDueToModifiers = 1; }',
    ],
    options: {
      selector: 'property',
      modifiers: ['static', 'readonly'],
    },
  },
];

ruleTester.run('naming-convention', rule, {
  valid: createValidTestCases(cases),
  invalid: createInvalidTestCases(cases),
});
