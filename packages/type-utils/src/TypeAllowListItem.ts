export type TypeAllowlistItem = {
  typeName: string;
} & (
  | { source: 'local' | 'default-lib' }
  | { source: 'package'; package: string }
);

export const typeAllowListItemSchema = {
  type: 'object',
  oneOf: [
    {
      additionalProperties: false,
      properties: {
        typeName: {
          type: 'string',
        },
        source: {
          type: 'string',
          enum: ['local', 'default-lib'],
        },
      },
      required: ['typeName', 'source'],
    },
    {
      additionalProperties: false,
      properties: {
        typeName: {
          type: 'string',
        },
        source: {
          type: 'string',
          enum: ['package'],
        },
        package: {
          type: 'string',
        },
      },
      required: ['typeName', 'source', 'package'],
    },
  ],
};
