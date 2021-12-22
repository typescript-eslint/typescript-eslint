import type { ASTViewerModel, Serializer } from '../types';
import { isRecord, objType } from '../utils';

function getSimpleModel(data: unknown): ASTViewerModel {
  if (typeof data === 'string') {
    return {
      value: JSON.stringify(data),
      type: 'string',
    };
  } else if (typeof data === 'number') {
    return {
      value: String(data),
      type: 'number',
    };
  } else if (typeof data === 'bigint') {
    return {
      value: `${data}n`,
      type: 'bigint',
    };
  } else if (data instanceof RegExp) {
    return {
      value: String(data),
      type: 'regexp',
    };
  } else if (typeof data === 'undefined' || data === null) {
    return {
      value: String(data),
      type: 'undefined',
    };
  } else if (typeof data === 'boolean') {
    return {
      value: data ? 'true' : 'false',
      type: 'boolean',
    };
  }
  return {
    value: objType(data),
    type: 'class',
  };
}

export function serialize(
  data: unknown,
  serializer?: Serializer,
): ASTViewerModel {
  function processValue(data: [string, unknown][]): ASTViewerModel[] {
    return data
      .filter(item => !item[0].startsWith('_') && item[1] !== undefined)
      .map(item => _serialize(item[1], item[0]));
  }

  function _serialize(data: unknown, key?: string): ASTViewerModel {
    if (isRecord(data)) {
      const serialized = serializer
        ? serializer(data, key, processValue)
        : undefined;
      if (serialized) {
        return {
          key,
          ...serialized,
        };
      }
      return {
        key,
        value: processValue(Object.entries(data)),
        type: 'object',
      };
    } else if (Array.isArray(data)) {
      return {
        key,
        value: processValue(Object.entries(data)),
        type: 'array',
      };
    }

    return {
      key,
      ...getSimpleModel(data),
    };
  }

  return _serialize(data);
}
