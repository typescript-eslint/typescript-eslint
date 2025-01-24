import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';

import { TSUtils } from '@typescript-eslint/utils';
import prettier from 'prettier';

import type { AST } from './types';

import { generateType } from './generateType';
import { optimizeAST } from './optimizeAST';
import { printTypeAlias } from './printAST';

export async function compile(
  schemaIn: JSONSchema4 | readonly JSONSchema4[],
  prettierConfig: Promise<prettier.Options>,
): Promise<string> {
  const { isArraySchema, schema } = (() => {
    if (TSUtils.isArray(schemaIn)) {
      return {
        isArraySchema: true,
        schema: schemaIn,
      };
    }
    return {
      isArraySchema: false,
      schema: [schemaIn],
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
        commentLines: [],
        elements: types,
        spreadType: null,
        type: 'tuple',
      })
    : printTypeAlias('Options', types[0]);

  const unformattedCode = [...refTypes, optionsType].join('\n\n');
  try {
    return await prettier.format(unformattedCode, await prettierConfig);
  } catch (e) {
    if (e instanceof Error) {
      e.message += `\n\nUnformatted Code:\n${unformattedCode}`;
    }
    throw e;
  }
}

function compileSchema(
  schema: JSONSchema4,
  index: number,
): { refTypes: string[]; type: AST } {
  const refTypes: string[] = [];

  const refMap = new Map<string, string>();
  // we only support defs at the top level for simplicity
  const defs = schema.$defs ?? schema.definitions;
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
    refTypes,
    type,
  };
}

function toPascalCase(key: string): string {
  return key[0].toUpperCase() + key.substring(1);
}
