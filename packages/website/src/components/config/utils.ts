import type { JSONSchema4 } from 'json-schema';

import type { ConfigOptionsField, ConfigOptionsType } from './ConfigEditor';

export function schemaItemToField(
  name: string,
  item: JSONSchema4,
): ConfigOptionsField | null {
  if (item.type === 'boolean') {
    return {
      key: name,
      type: 'boolean',
      label: item.description,
    };
  } else if (item.type === 'string' && item.enum) {
    return {
      key: name,
      type: 'string',
      label: item.description,
      enum: ['', ...(item.enum as string[])],
    };
  } else if (item.oneOf) {
    return {
      key: name,
      type: 'boolean',
      label: item.description,
      defaults: ['error', 2, 'warn', 1],
    };
  }
  return null;
}

export function schemaToConfigOptions(
  options: Record<string, JSONSchema4>,
): ConfigOptionsType[] {
  const result = Object.entries(options).reduce<
    Record<string, ConfigOptionsType>
  >((group, [name, item]) => {
    const category = item.title!;
    group[category] = group[category] ?? {
      heading: category,
      fields: [],
    };
    const field = schemaItemToField(name, item);
    if (field) {
      group[category].fields.push(field);
    }
    return group;
  }, {});

  return Object.values(result);
}
