interface FileSpecifier {
  from: 'file';
  name: string | string[];
  source?: string;
}

interface LibSpecifier {
  from: 'lib';
  name: string | string[];
}

interface PackageSpecifier {
  from: 'package';
  name: string | string[];
  source: string;
}

interface MultiSourceSpecifier {
  from: Array<'file' | 'lib' | 'package'>;
  name: string;
}

export type TypeOrValueSpecifier =
  | string
  | FileSpecifier
  | LibSpecifier
  | PackageSpecifier
  | MultiSourceSpecifier;

export const typeOrValueSpecifierSchema = {
  oneOf: [
    {
      type: 'string',
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'string',
          const: 'file',
        },
        name: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
              },
            },
          ],
        },
        source: {
          type: 'string',
        },
      },
      required: ['from', 'name'],
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'string',
          const: 'lib',
        },
        name: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
              },
            },
          ],
        },
      },
      required: ['from', 'name'],
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'string',
          const: 'package',
        },
        name: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'array',
              minItems: 1,
              uniqueItems: true,
              items: {
                type: 'string',
              },
            },
          ],
        },
        source: {
          type: 'string',
        },
      },
      required: ['from', 'name', 'source'],
    },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        from: {
          type: 'array',
          minItems: 1,
          uniqueItems: true,
          items: {
            type: 'string',
            enum: ['file', 'lib', 'package'],
          },
        },
        name: {
          type: 'string',
        },
      },
      required: ['from', 'name'],
    },
  ],
};
