import type { JSONSchema4 } from '@typescript-eslint/utils/json-schema';

export function getCommentLines(schema: JSONSchema4): string[] {
  const lines: string[] = [];
  if (schema.description) {
    lines.push(schema.description);
  }
  return lines;
}
