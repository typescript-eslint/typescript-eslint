import type { JSONSchema } from '@typescript-eslint/utils';

import type {
  IndividualAndMetaSelectorsString,
  ModifiersString,
} from './enums';

import { getEnumNames } from '../../util';
import {
  MetaSelectors,
  Modifiers,
  PredefinedFormats,
  Selectors,
  TypeModifiers,
  UnderscoreOptions,
} from './enums';

const $DEFS: Record<string, JSONSchema.JSONSchema4> = {
  // enums
  predefinedFormats: {
    type: 'string',
    enum: getEnumNames(PredefinedFormats),
  },
  typeModifiers: {
    type: 'string',
    enum: getEnumNames(TypeModifiers),
  },
  underscoreOptions: {
    type: 'string',
    enum: getEnumNames(UnderscoreOptions),
  },

  // repeated types
  formatOptionsConfig: {
    oneOf: [
      {
        type: 'array',
        additionalItems: false,
        items: {
          $ref: '#/$defs/predefinedFormats',
        },
      },
      {
        type: 'null',
      },
    ],
  },
  matchRegexConfig: {
    type: 'object',
    additionalProperties: false,
    properties: {
      match: { type: 'boolean' },
      regex: { type: 'string' },
    },
    required: ['match', 'regex'],
  },
  prefixSuffixConfig: {
    type: 'array',
    additionalItems: false,
    items: {
      type: 'string',
      minLength: 1,
    },
  },
};

const UNDERSCORE_SCHEMA: JSONSchema.JSONSchema4 = {
  $ref: '#/$defs/underscoreOptions',
};
const PREFIX_SUFFIX_SCHEMA: JSONSchema.JSONSchema4 = {
  $ref: '#/$defs/prefixSuffixConfig',
};
const MATCH_REGEX_SCHEMA: JSONSchema.JSONSchema4 = {
  $ref: '#/$defs/matchRegexConfig',
};
type JSONSchemaProperties = Record<string, JSONSchema.JSONSchema4>;
const FORMAT_OPTIONS_PROPERTIES: JSONSchemaProperties = {
  custom: MATCH_REGEX_SCHEMA,
  failureMessage: {
    type: 'string',
  },
  format: {
    $ref: '#/$defs/formatOptionsConfig',
  },
  leadingUnderscore: UNDERSCORE_SCHEMA,
  prefix: PREFIX_SUFFIX_SCHEMA,
  suffix: PREFIX_SUFFIX_SCHEMA,
  trailingUnderscore: UNDERSCORE_SCHEMA,
};
function selectorSchema(
  selectorString: IndividualAndMetaSelectorsString,
  allowType: boolean,
  modifiers?: ModifiersString[],
): JSONSchema.JSONSchema4[] {
  const selector: JSONSchemaProperties = {
    filter: {
      oneOf: [
        {
          type: 'string',
          minLength: 1,
        },
        MATCH_REGEX_SCHEMA,
      ],
    },
    selector: {
      type: 'string',
      enum: [selectorString],
    },
  };
  if (modifiers && modifiers.length > 0) {
    selector.modifiers = {
      type: 'array',
      additionalItems: false,
      items: {
        type: 'string',
        enum: modifiers,
      },
    };
  }
  if (allowType) {
    selector.types = {
      type: 'array',
      additionalItems: false,
      items: {
        $ref: '#/$defs/typeModifiers',
      },
    };
  }

  return [
    {
      type: 'object',
      additionalProperties: false,
      description: `Selector '${selectorString}'`,
      properties: {
        ...FORMAT_OPTIONS_PROPERTIES,
        ...selector,
      },
      required: ['selector', 'format'],
    },
  ];
}

function selectorsSchema(): JSONSchema.JSONSchema4 {
  return {
    type: 'object',
    additionalProperties: false,
    description: 'Multiple selectors in one config',
    properties: {
      ...FORMAT_OPTIONS_PROPERTIES,
      filter: {
        oneOf: [
          {
            type: 'string',
            minLength: 1,
          },
          MATCH_REGEX_SCHEMA,
        ],
      },
      modifiers: {
        type: 'array',
        additionalItems: false,
        items: {
          type: 'string',
          enum: getEnumNames(Modifiers),
        },
      },
      selector: {
        type: 'array',
        additionalItems: false,
        items: {
          type: 'string',
          enum: [...getEnumNames(MetaSelectors), ...getEnumNames(Selectors)],
        },
      },
      types: {
        type: 'array',
        additionalItems: false,
        items: {
          $ref: '#/$defs/typeModifiers',
        },
      },
    },
    required: ['selector', 'format'],
  };
}

const SCHEMA: JSONSchema.JSONSchema4 = {
  type: 'array',
  $defs: $DEFS,
  additionalItems: false,
  items: {
    oneOf: [
      selectorsSchema(),
      ...selectorSchema('default', false, getEnumNames(Modifiers)),

      ...selectorSchema('variableLike', false, ['unused', 'async']),
      ...selectorSchema('variable', true, [
        'const',
        'destructured',
        'exported',
        'global',
        'unused',
        'async',
      ]),
      ...selectorSchema('function', false, [
        'exported',
        'global',
        'unused',
        'async',
      ]),
      ...selectorSchema('parameter', true, ['destructured', 'unused']),

      ...selectorSchema('memberLike', false, [
        'abstract',
        'private',
        '#private',
        'protected',
        'public',
        'readonly',
        'requiresQuotes',
        'static',
        'override',
        'async',
      ]),
      ...selectorSchema('classProperty', true, [
        'abstract',
        'private',
        '#private',
        'protected',
        'public',
        'readonly',
        'requiresQuotes',
        'static',
        'override',
      ]),
      ...selectorSchema('objectLiteralProperty', true, [
        'public',
        'requiresQuotes',
      ]),
      ...selectorSchema('typeProperty', true, [
        'public',
        'readonly',
        'requiresQuotes',
      ]),
      ...selectorSchema('parameterProperty', true, [
        'private',
        'protected',
        'public',
        'readonly',
      ]),
      ...selectorSchema('property', true, [
        'abstract',
        'private',
        '#private',
        'protected',
        'public',
        'readonly',
        'requiresQuotes',
        'static',
        'override',
        'async',
      ]),

      ...selectorSchema('classMethod', false, [
        'abstract',
        'private',
        '#private',
        'protected',
        'public',
        'requiresQuotes',
        'static',
        'override',
        'async',
      ]),
      ...selectorSchema('objectLiteralMethod', false, [
        'public',
        'requiresQuotes',
        'async',
      ]),
      ...selectorSchema('typeMethod', false, ['public', 'requiresQuotes']),
      ...selectorSchema('method', false, [
        'abstract',
        'private',
        '#private',
        'protected',
        'public',
        'requiresQuotes',
        'static',
        'override',
        'async',
      ]),
      ...selectorSchema('classicAccessor', true, [
        'abstract',
        'private',
        'protected',
        'public',
        'requiresQuotes',
        'static',
        'override',
      ]),
      ...selectorSchema('autoAccessor', true, [
        'abstract',
        'private',
        'protected',
        'public',
        'requiresQuotes',
        'static',
        'override',
      ]),
      ...selectorSchema('accessor', true, [
        'abstract',
        'private',
        'protected',
        'public',
        'requiresQuotes',
        'static',
        'override',
      ]),
      ...selectorSchema('enumMember', false, ['requiresQuotes']),

      ...selectorSchema('typeLike', false, ['abstract', 'exported', 'unused']),
      ...selectorSchema('class', false, ['abstract', 'exported', 'unused']),
      ...selectorSchema('interface', false, ['exported', 'unused']),
      ...selectorSchema('typeAlias', false, ['exported', 'unused']),
      ...selectorSchema('enum', false, ['exported', 'unused']),
      ...selectorSchema('typeParameter', false, ['unused']),
      ...selectorSchema('import', false, ['default', 'namespace']),
    ],
  },
};

export { SCHEMA };
