import { schemaToTypes } from '../src/index.js';

describe(schemaToTypes, () => {
  it('returns a [] type when the schema is an empty array', () => {
    const actual = schemaToTypes([]);

    expect(actual).toMatchInlineSnapshot(`
      "/** No options declared */
      type Options = [];"
    `);
  });

  it('returns a single Options type when the schema is not an array', () => {
    const actual = schemaToTypes({ type: 'string' });

    expect(actual).toMatchInlineSnapshot(`"type Options = string"`);
  });

  it('returns an array Options type when the schema is an array', () => {
    const actual = schemaToTypes([{ type: 'string' }]);

    expect(actual).toMatchInlineSnapshot(`"type Options = [string]"`);
  });

  it('returns a complex Options type when the schema contains an array of items', () => {
    const actual = schemaToTypes([
      {
        items: [{ type: 'string' }],
        type: 'array',
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      "type Options = [ | []
 | [string]]"
    `);
  });

  it('returns a complex Options type when the schema is nested', () => {
    const actual = schemaToTypes([
      {
        description: 'My schema items.',
        items: { type: 'string' },
        type: 'array',
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      "type Options = [/** My schema items. */
      string[]]"
    `);
  });

  it('returns a multiline comment when the schema description contains CRLF line terminators', () => {
    const actual = schemaToTypes([
      {
        description: 'My schema items.\r\nMore details.\r\nEven more details.',
        items: { type: 'string' },
        type: 'array',
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      "type Options = [/**
       * My schema items.
       * More details.
       * Even more details.
       */
      string[]]"
    `);
  });

  it('returns a multiline comment when the schema description contains CR line terminators', () => {
    const actual = schemaToTypes([
      {
        description: 'My schema items.\rMore details.\rEven more details.',
        items: { type: 'string' },
        type: 'array',
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      "type Options = [/**
       * My schema items.
       * More details.
       * Even more details.
       */
      string[]]"
    `);
  });

  it('returns a multiline comment when the schema description contains LF line terminators', () => {
    const actual = schemaToTypes([
      {
        description: 'My schema items.\nMore details.\nEven more details.',
        items: { type: 'string' },
        type: 'array',
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      "type Options = [/**
       * My schema items.
       * More details.
       * Even more details.
       */
      string[]]"
    `);
  });

  it('returns a multiline comment when the schema description contains LS line terminators', () => {
    const actual = schemaToTypes([
      {
        description:
          'My schema items.\u2028More details.\u2028Even more details.',
        items: { type: 'string' },
        type: 'array',
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      "type Options = [/**
       * My schema items.
       * More details.
       * Even more details.
       */
      string[]]"
    `);
  });

  it('returns a multiline comment when the schema description contains PS line terminators', () => {
    const actual = schemaToTypes([
      {
        description:
          'My schema items.\u2029More details.\u2029Even more details.',
        items: { type: 'string' },
        type: 'array',
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      "type Options = [/**
       * My schema items.
       * More details.
       * Even more details.
       */
      string[]]"
    `);
  });

  it('factors in one $ref property when a $defs property exists at the top level', () => {
    const actual = schemaToTypes([
      {
        $defs: {
          defOption: {
            enum: ['a', 'b'],
            type: 'string',
          },
        },
        additionalProperties: false,
        properties: {
          one: {
            $ref: '#/items/0/$defs/defOption',
          },
        },
        type: 'object',
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      "type DefOption =  | 'a'
       | 'b'

      type Options = [{
      one?: DefOption}]"
    `);
  });

  it('factors in one $ref property when a definitions property exists at the top level', () => {
    const actual = schemaToTypes([
      {
        additionalProperties: false,
        definitions: {
          defOption: {
            enum: ['a', 'b'],
            type: 'string',
          },
        },
        properties: {
          one: {
            $ref: '#/items/0/$defs/defOption',
          },
        },
        type: 'object',
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      "type DefOption =  | 'a'
       | 'b'

      type Options = [{
      one?: DefOption}]"
    `);
  });

  it('factors in two $ref properties when two $defs properties exist at the top level', () => {
    const actual = schemaToTypes([
      {
        $defs: {
          defOptionOne: {
            enum: ['a', 'b'],
            type: 'string',
          },
          defOptionTwo: {
            enum: ['c', 'd'],
            type: 'string',
          },
        },
        additionalProperties: false,
        properties: {
          one: {
            $ref: '#/items/0/$defs/defOptionOne',
          },
          two: {
            $ref: '#/items/0/$defs/defOptionTwo',
          },
        },
        type: 'object',
      },
    ]);

    expect(actual).toMatchInlineSnapshot(`
      "type DefOptionOne =  | 'a'
       | 'b'

      type DefOptionTwo =  | 'c'
       | 'd'

      type Options = [{
      one?: DefOptionOne;
      two?: DefOptionTwo}]"
    `);
  });
});
