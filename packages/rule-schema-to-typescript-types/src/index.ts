import {
  createFSBackedSystem,
  createVirtualTypeScriptEnvironment,
} from '@typescript/vfs';
import { requiresQuoting } from '@typescript-eslint/type-utils';
import type { JSONSchema4, JSONSchema4Type } from 'json-schema';
import path from 'path';
import { format as prettierFormat, resolveConfig } from 'prettier';
import * as ts from 'typescript';

type RefMap = ReadonlyMap<
  // ref path
  string,
  // type name
  string
>;
interface GeneratedResult {
  readonly code: string;
  readonly commentLines?: string[];
}

class NotSupportedError extends Error {
  constructor(thing: string, target: unknown) {
    super(
      `Generating a type for ${thing} is not currently supported:\n${JSON.stringify(
        target,
        null,
        2,
      )}`,
    );
  }
}
class UnexpectedError extends Error {
  constructor(error: string, target: unknown) {
    super(`Unexpected Error: ${error}:\n${JSON.stringify(target, null, 2)}`);
  }
}

const prettierConfig = {
  ...(resolveConfig.sync(__filename) ?? {}),
  filepath: path.join(__dirname, 'schema.ts'),
};

/**
 * If there are more than 20 tuple items then we will not make it a tuple type
 * and instead will just make it an array type for brevity
 */
const MAX_ITEMS_TO_TUPLIZE = 20;

// https://github.com/microsoft/TypeScript/issues/17002
function isArray(arg: unknown): arg is readonly unknown[] {
  return Array.isArray(arg);
}

export function compile(
  schemaIn: JSONSchema4 | readonly JSONSchema4[],
): string {
  const { schema, isArraySchema } = (() => {
    if (isArray(schemaIn)) {
      return {
        schema: schemaIn,
        isArraySchema: true,
      };
    }
    return {
      schema: [schemaIn],
      isArraySchema: false,
    };
  })();

  if (schema.length === 0) {
    return ['/** No options declared */', 'type Options = [];'].join('\n');
  }

  const refTypes: string[] = [];
  const types: GeneratedResult[] = [];
  for (let i = 0; i < schema.length; i += 1) {
    const result = compileSchema(schema[i], i);
    refTypes.push(...result.refTypes);
    types.push(result.type);
  }
  const typeStrings = types.map(t => `${printComment(t)}${t.code}`);

  const optionsType = isArraySchema
    ? `type Options = [${typeStrings.join(',')}]`
    : `type Options = ${typeStrings[0]}`;

  const codeWithUnsimplifiedOptions = [...refTypes, optionsType].join('\n\n');
  const simplifiedOptionsType = useTsToSimplifyOptionsType(
    codeWithUnsimplifiedOptions,
  );
  const codeWithSimplifiedOptions = [...refTypes, simplifiedOptionsType].join(
    '\n\n',
  );

  return prettierFormat(codeWithSimplifiedOptions, prettierConfig);
}
function compileSchema(
  schema: JSONSchema4,
  index: number,
): { type: GeneratedResult; refTypes: string[] } {
  const refTypes: string[] = [];

  const refMap = new Map<string, string>();
  // we only support defs at the top level for simplicity
  const defs = (schema.$defs ?? schema.definitions) as
    | Record<string, JSONSchema4>
    | undefined;
  if (defs) {
    for (const [defKey, defSchema] of Object.entries(defs)) {
      const typeName = toPascalCase(defKey);
      refMap.set(`#/$defs/${defKey}`, typeName);
      refMap.set(`#/items/${index}/$defs/${defKey}`, typeName);

      const type = generateType(defSchema, refMap);
      refTypes.push(`${printComment(type)}type ${typeName} = ${type.code}`);
    }
  }

  return {
    type: generateType(schema, refMap),
    refTypes,
  };
}

function toPascalCase(key: string): string {
  return key[0].toUpperCase() + key.substring(1);
}

// keywords we probably should support but currently do not support
const UNSUPPORTED_KEYWORDS = new Set<string>([
  'allOf',
  'dependencies',
  'extends',
  'maxProperties',
  'minProperties',
  'multipleOf',
  'not',
  'patternProperties',
] satisfies (keyof JSONSchema4)[]);

function generateType(schema: JSONSchema4, refMap: RefMap): GeneratedResult {
  const unsupportedProps = Object.keys(schema).filter(key =>
    UNSUPPORTED_KEYWORDS.has(key),
  );
  if (unsupportedProps.length > 0) {
    throw new NotSupportedError(unsupportedProps.join(','), schema);
  }

  const commentLines = getCommentLines(schema);

  if (schema.$ref) {
    const refName = refMap.get(schema.$ref);
    if (refName == null) {
      throw new UnexpectedError(
        `Could not find definition for $ref ${
          schema.$ref
        }.\nAvailable refs:\n${Array.from(refMap.keys()).join('\n')})`,
        schema,
      );
    }
    return {
      code: refName,
      commentLines,
    };
  }
  if (schema.enum) {
    return {
      code: generateUnionType(schema.enum, refMap),
      commentLines,
    };
  }
  if (schema.anyOf) {
    return {
      // a union isn't *TECHNICALLY* correct - technically anyOf is actually
      // anyOf: [T, U, V] -> T | U | V | T & U | T & V | U & V
      // in practice though it is most used to emulate a oneOf
      code: generateUnionType(schema.anyOf, refMap),
      commentLines,
    };
  }
  if (schema.oneOf) {
    return {
      code: generateUnionType(schema.oneOf, refMap),
      commentLines,
    };
  }

  if (isArray(schema.type)) {
    throw new NotSupportedError('schemas with multiple types', schema);
  }
  if (schema.type == null) {
    throw new NotSupportedError(
      'untyped schemas without one of [$ref, enum, oneOf]',
      schema,
    );
  }

  switch (schema.type) {
    case 'any':
      return {
        code: 'unknown',
        commentLines,
      };

    case 'null':
      return {
        code: 'null',
        commentLines,
      };

    case 'number':
    case 'string':
      return {
        code: schema.type,
        commentLines,
      };

    case 'array':
      return generateArrayType(schema, refMap);

    case 'boolean':
      return {
        code: 'boolean',
        commentLines,
      };

    case 'integer':
      return {
        code: 'number',
        commentLines,
      };

    case 'object':
      return generateObjectType(schema, refMap);
  }
}

function printUnionType(members: (string | GeneratedResult)[]): string {
  return members
    .map(member => {
      if (typeof member === 'string') {
        return `| ${member}`;
      }
      return `${printComment(member)} | (${member.code})`;
    })
    .join('\n');
}
function generateUnionType(
  members: (JSONSchema4 | JSONSchema4Type)[],
  refMap: RefMap,
): string {
  const memberStrings: GeneratedResult[] = [];

  for (const memberSchema of members) {
    memberStrings.push(
      ((): GeneratedResult => {
        switch (typeof memberSchema) {
          case 'string':
            return {
              code: `'${memberSchema.replace(/'/g, "\\'")}'`,
            };

          case 'number':
          case 'boolean':
            return {
              code: `${memberSchema}`,
            };

          case 'object':
            if (memberSchema == null) {
              throw new NotSupportedError('null in an enum', memberSchema);
            }
            if (Array.isArray(memberSchema)) {
              throw new NotSupportedError('array in an enum', memberSchema);
            }
            return generateType(memberSchema, refMap);
        }
      })(),
    );
  }

  return printUnionType(
    memberStrings
      // sort the union members so that we get consistent output regardless
      // of import declaration order
      .sort((a, b) => a.code.localeCompare(b.code)),
  );
}

function generateArrayType(
  schema: JSONSchema4,
  refMap: RefMap,
): GeneratedResult {
  if (!schema.items) {
    // it's technically valid to declare things like {type: 'array'} -> any[]
    // but that's obviously dumb and loose so let's not even bother with it
    throw new UnexpectedError('Unexpected missing items', schema);
  }
  if (schema.items && !isArray(schema.items) && schema.additionalItems) {
    throw new NotSupportedError(
      'singlely-typed array with additionalItems',
      schema,
    );
  }

  const commentLines = getCommentLines(schema);

  const minItems = schema.minItems ?? 0;
  const maxItems =
    schema.maxItems != null && schema.maxItems < MAX_ITEMS_TO_TUPLIZE
      ? schema.maxItems
      : -1;
  const hasMinItems = minItems > 0;
  const hasMaxItems = maxItems >= 0;

  let items: JSONSchema4[];
  let spreadItemSchema: JSONSchema4 | null = null;

  if (!isArray(schema.items)) {
    if (hasMinItems || hasMaxItems) {
      // treat as a tuple
      items = Array<JSONSchema4>(
        (hasMaxItems && maxItems) || minItems || 0,
      ).fill(schema.items);
      if (!hasMaxItems) {
        spreadItemSchema =
          typeof schema.additionalItems === 'object'
            ? schema.additionalItems
            : schema.items;
      }
    } else {
      // treat as an array type
      return {
        code: `(${generateType(schema.items, refMap).code})[]`,
        commentLines,
      };
    }
  } else {
    // treat as a tuple
    items = schema.items;
    if (hasMaxItems && items.length < maxItems) {
      spreadItemSchema =
        typeof schema.additionalItems === 'object'
          ? schema.additionalItems
          : { type: 'any' };
    }
  }

  // quick validation so we generate sensible types
  if (hasMaxItems && maxItems < items.length) {
    throw new UnexpectedError(
      `maxItems (${maxItems}) is smaller than the number of items schemas provided (${items.length})`,
      schema,
    );
  }
  if (maxItems > items.length && spreadItemSchema == null) {
    throw new UnexpectedError(
      'maxItems is larger than the number of items schemas, but there was not an additionalItems schema provided',
      schema,
    );
  }

  const itemTypes = items.map(i => generateType(i, refMap));
  const spreadItem = (() => {
    if (spreadItemSchema == null) {
      return null;
    }
    const type = generateType(spreadItemSchema, refMap);
    return `${printComment(type)}...(${type.code})[]`;
  })();

  const typesToString = (types: (string | GeneratedResult)[]): string => {
    return `[\n${types
      .map(t => {
        if (typeof t === 'string') {
          return t;
        }
        return `${printComment(t)}${t.code}`;
      })
      .join(',\n')}\n]`;
  };
  const addSpreadParam = (
    params: (string | GeneratedResult)[],
  ): (string | GeneratedResult)[] => {
    if (spreadItem) {
      params.push(spreadItem);
    }
    return params;
  };

  if (itemTypes.length > minItems) {
    /*
    if there are more items than the min, we return a union of tuples instead of
    using the optional element operator. This is done because it is more type-safe.

    // optional element operator
    type A = [string, string?, string?]
    const a: A = ['a', undefined, 'c'] // no error

    // union of tuples
    type B = [string] | [string, string] | [string, string, string]
    const b: B = ['a', undefined, 'c'] // TS error
    */
    const cumulativeTypesList: (string | GeneratedResult)[] = itemTypes.slice(
      0,
      minItems,
    );
    const typesToUnion: string[] = [];
    if (cumulativeTypesList.length > 0) {
      // actually has minItems, so add the initial state
      typesToUnion.push(typesToString(cumulativeTypesList));
    } else {
      // no minItems means it's acceptable to have an empty tuple type
      typesToUnion.push(typesToString([]));
    }

    for (let i = minItems; i < itemTypes.length; i += 1) {
      cumulativeTypesList.push(itemTypes[i]);

      if (i === itemTypes.length - 1) {
        // only the last item in the union should have the spread parameter
        addSpreadParam(cumulativeTypesList);
      }

      typesToUnion.push(typesToString(cumulativeTypesList));
    }

    return {
      code: printUnionType(typesToUnion),
      commentLines,
    };
  }

  return {
    code: typesToString(addSpreadParam(itemTypes)),
    commentLines,
  };
}

function generateObjectType(
  schema: JSONSchema4,
  refMap: RefMap,
): GeneratedResult {
  const commentLines = getCommentLines(schema);

  let indexSignature = '';
  if (schema.additionalProperties === true) {
    indexSignature = '[k: string]: unknown';
  } else if (schema.additionalProperties) {
    const indexSigType = generateType(schema.additionalProperties, refMap);
    indexSignature = `${printComment(indexSigType)}[k: string]: ${
      indexSigType.code
    }`;
  }

  const properties: string[] = [];
  const required = new Set(isArray(schema.required) ? schema.required : []);
  if (schema.properties) {
    const propertyDefs = Object.entries(schema.properties)
      // sort the properties so that we get consistent output regardless
      // of import declaration order
      .sort(([a], [b]) => a.localeCompare(b));
    for (const [propName, propSchema] of propertyDefs) {
      const propType = generateType(propSchema, refMap);
      const sanitisedPropName = requiresQuoting(propName)
        ? `'${propName}'`
        : propName;
      properties.push(
        `${printComment(propType)}${sanitisedPropName}${
          required.has(propName) ? '' : '?'
        }: ${propType.code}`,
      );
    }
  }

  return {
    code: ['{', properties.join(';\n'), indexSignature, '}'].join('\n'),
    commentLines,
  };
}

function getCommentLines(schema: JSONSchema4): string[] {
  const lines: string[] = [];
  if (schema.description) {
    lines.push(schema.description);
  }
  return lines;
}
function printComment({
  commentLines: commentLinesIn,
}: GeneratedResult): string {
  if (commentLinesIn == null || commentLinesIn.length === 0) {
    return '';
  }

  const commentLines: string[] = [];
  for (const line of commentLinesIn) {
    commentLines.push(...line.split('\n'));
  }

  if (commentLines.length === 1) {
    return `/** ${commentLines[0]} */\n`;
  }

  return ['/**', ...commentLines.map(l => ` * ${l}`), ' */', ''].join('\n');
}

const COMPILER_OPTIONS: ts.CompilerOptions = {
  isolatedModules: true,
  noEmit: true,
  // don't print `| undefined` for optional props
  exactOptionalPropertyTypes: true,
  target: ts.ScriptTarget.ESNext,
};
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const FAKE_SCHEMA_FILENAME = 'schema.ts';
const PRINTER = ts.createPrinter({
  removeComments: false,
});

/**
 * This function uses TS to analyze and simplify the options type.
 * This is a workaround to simplify union types from
 *
 *   type Options = ([] | [T]) | ([] | [U]);
 *
 * to
 *
 *   type Options = [] | [T] | [U];
 *
 * Which happens when schemas nest `oneOf` with array types
 */
function useTsToSimplifyOptionsType(code: string): string {
  const system = createFSBackedSystem(
    new Map([[FAKE_SCHEMA_FILENAME, code]]),
    PROJECT_ROOT,
    ts,
  );
  const env = createVirtualTypeScriptEnvironment(
    system,
    [FAKE_SCHEMA_FILENAME],
    ts,
    COMPILER_OPTIONS,
  );
  const program = env.languageService.getProgram();
  if (program == null) {
    throw new Error('Unable to get program');
  }

  const sourceFile = program.getSourceFile(FAKE_SCHEMA_FILENAME);
  if (sourceFile == null) {
    throw new Error('Unable to find source file');
  }

  const checker = program.getTypeChecker();
  for (const node of sourceFile.statements) {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === 'Options') {
      const type = checker.getTypeAtLocation(node);
      const typeNode = checker.typeToTypeNode(
        type,
        sourceFile,
        // force print the type, not the type alias name
        ts.NodeBuilderFlags.InTypeAlias |
          // we are okay with []
          ts.NodeBuilderFlags.AllowEmptyTuple |
          // don't truncate the result at all
          ts.NodeBuilderFlags.NoTruncation |
          // force multiline objects so prettier will consistently print multiline objects
          // rather than only multi-lining if it's too long
          ts.NodeBuilderFlags.MultilineObjectLiterals,
      );
      return `type Options = ${PRINTER.printNode(
        ts.EmitHint.Unspecified,
        typeNode!,
        sourceFile,
      )}`;
    }
  }

  throw new Error('Unable to find type alias node');
}
