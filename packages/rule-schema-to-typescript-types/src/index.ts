import type { JSONSchema4 } from 'json-schema';
import path from 'path';
import { format as prettierFormat, resolveConfig } from 'prettier';

import { generateType } from './generateType';
import { isArray } from './isArray';
import { optimizeAST } from './optimizeAST';
import { printTypeAlias } from './printAST';
import type { AST } from './types';

const prettierConfig = {
  ...(resolveConfig.sync(__filename) ?? {}),
  filepath: path.join(__dirname, 'schema.ts'),
};

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
  const types: AST[] = [];
  for (let i = 0; i < schema.length; i += 1) {
    const result = compileSchema(schema[i], i);
    refTypes.push(...result.refTypes);
    types.push(result.type);
  }

  const optionsType = isArraySchema
    ? printTypeAlias('Options', {
        type: 'tuple',
        elements: types,
        spreadType: null,
        commentLines: [],
      })
    : printTypeAlias('Options', types[0]);

  const unformattedCode = [...refTypes, optionsType].join('\n\n');
  try {
    return prettierFormat(unformattedCode, prettierConfig);
  } catch (e) {
    if (e instanceof Error) {
      e.message = e.message + `\n\nUnformatted Code:\n${unformattedCode}`;
    }
    throw e;
  }
}

function compileSchema(
  schema: JSONSchema4,
  index: number,
): { type: AST; refTypes: string[] } {
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
      optimizeAST(type);
      refTypes.push(printTypeAlias(typeName, type));
    }
  }

  const type = generateType(schema, refMap);
  optimizeAST(type);

  return {
    type,
    refTypes,
  };
}

function toPascalCase(key: string): string {
  return key[0].toUpperCase() + key.substring(1);
}
