// The following code is adapted from the the code in eslint.
// License: https://github.com/eslint/eslint/blob/48700fc8408f394887cdedd071b22b757700fdcb/LICENSE

/**
 * Prevents leading spaces in a multiline template literal from appearing in the resulting string
 * @param strings The strings in the template literal
 * @returns The template literal, with spaces removed from all lines
 */
export function unIndent(strings: TemplateStringsArray): string {
  const WHITESPACE_REGEX = / */u;
  const templateValue = strings[0];
  const lines = templateValue
    .replace(/^\n/u, '')
    .replace(/\n\s*$/u, '')
    .split('\n');
  const lineIndents = lines
    .filter(line => line.trim())
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map(line => WHITESPACE_REGEX.exec(line)![0].length);
  const minLineIndent = Math.min(...lineIndents);

  return lines.map(line => line.slice(minLineIndent)).join('\n');
}
