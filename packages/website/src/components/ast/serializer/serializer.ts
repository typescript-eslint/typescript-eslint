import type {
  ASTViewerModelMap,
  ASTViewerModelSimple,
  Serializer,
} from '../types';
import { isRecord, objType } from '../utils';

function getSimpleModel(data: unknown): ASTViewerModelSimple {
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
  } else if (data == null) {
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
): ASTViewerModelMap {
  function processValue(
    data: [string, unknown][],
    tooltip?: (data: ASTViewerModelMap) => string | undefined,
  ): ASTViewerModelMap[] {
    let result = data
      .filter(item => !item[0].startsWith('_') && item[1] !== undefined)
      .map(item => _serialize(item[1], item[0]));
    if (tooltip) {
      result = result.map(item => {
        item.model.tooltip = tooltip(item);
        return item;
      });
    }
    return result;
  }

  function _serialize(data: unknown, key?: string): ASTViewerModelMap {
    if (isRecord(data)) {
      const serialized = serializer
        ? serializer(data, key, processValue)
        : undefined;
      if (serialized) {
        return { key, model: serialized };
      }
      return {
        key,
        model: {
          value: processValue(Object.entries(data)),
          type: 'object',
        },
      };
    } else if (Array.isArray(data)) {
      return {
        key,
        model: {
          value: processValue(Object.entries(data)),
          type: 'array',
        },
      };
    }

    if (typeof data === 'function' && key) {
      return { key: `${key}()`, model: getSimpleModel(data()) };
    }

    return { key, model: getSimpleModel(data) };
  }

  return _serialize(data);
}
