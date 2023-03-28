// Forked from https://github.com/eslint/eslint/blob/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/conf/config-schema.js

import type { JSONSchema } from '@typescript-eslint/utils';

const baseConfigProperties: JSONSchema.JSONSchema4['properties'] = {
  $schema: { type: 'string' },
  defaultFilenames: {
    type: 'object',
    properties: {
      ts: { type: 'string' },
      tsx: { type: 'string' },
    },
    required: ['ts', 'tsx'],
    additionalProperties: false,
  },
  dependencyConstraints: {
    type: 'object',
    additionalProperties: {
      type: 'string',
    },
  },
  env: { type: 'object' },
  extends: { $ref: '#/definitions/stringOrStrings' },
  globals: { type: 'object' },
  noInlineConfig: { type: 'boolean' },
  overrides: {
    type: 'array',
    items: { $ref: '#/definitions/overrideConfig' },
    additionalItems: false,
  },
  parser: { type: ['string', 'null'] },
  parserOptions: { type: 'object' },
  plugins: { type: 'array' },
  processor: { type: 'string' },
  reportUnusedDisableDirectives: { type: 'boolean' },
  rules: { type: 'object' },
  settings: { type: 'object' },

  ecmaFeatures: { type: 'object' }, // deprecated; logs a warning when used
};

export const configSchema: JSONSchema.JSONSchema4 = {
  definitions: {
    stringOrStrings: {
      oneOf: [
        { type: 'string' },
        {
          type: 'array',
          items: { type: 'string' },
          additionalItems: false,
        },
      ],
    },
    stringOrStringsRequired: {
      oneOf: [
        { type: 'string' },
        {
          type: 'array',
          items: { type: 'string' },
          additionalItems: false,
          minItems: 1,
        },
      ],
    },

    // Config at top-level.
    objectConfig: {
      type: 'object',
      properties: {
        root: { type: 'boolean' },
        ignorePatterns: { $ref: '#/definitions/stringOrStrings' },
        ...baseConfigProperties,
      },
      additionalProperties: false,
    },

    // Config in `overrides`.
    overrideConfig: {
      type: 'object',
      properties: {
        excludedFiles: { $ref: '#/definitions/stringOrStrings' },
        files: { $ref: '#/definitions/stringOrStringsRequired' },
        ...baseConfigProperties,
      },
      required: ['files'],
      additionalProperties: false,
    },
  },

  $ref: '#/definitions/objectConfig',
};
