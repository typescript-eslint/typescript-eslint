export type TypeAllowlistItem = {
  typeName: string;
} & ({ local: true } | { defaultLib: true } | { package: string });

export const typeAllowListItemSchema = {
  type: 'object',
  oneOf: [
    {
      additionalProperties: false,
      properties: {
        typeName: {
          type: 'string',
        },
        local: {
          type: 'boolean',
        },
      },
      required: ['typeName', 'local'],
    },
    {
      additionalProperties: false,
      properties: {
        typeName: {
          type: 'string',
        },
        defaultLib: {
          type: 'boolean',
        },
      },
      required: ['typeName', 'defaultLib'],
    },
    {
      additionalProperties: false,
      properties: {
        typeName: {
          type: 'string',
        },
        package: {
          type: 'string',
        },
      },
      required: ['typeName', 'package'],
    },
  ],
};
