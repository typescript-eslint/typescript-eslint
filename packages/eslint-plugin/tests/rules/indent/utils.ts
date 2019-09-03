// The following code is adapted from the the code in eslint.
// License: https://github.com/eslint/eslint/blob/48700fc8408f394887cdedd071b22b757700fdcb/LICENSE

import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import rule from '../../../src/rules/indent';
import { InferMessageIdsTypeFromRule } from '../../../src/util';

type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;

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
    .map(line => WHITESPACE_REGEX.exec(line)![0].length);
  const minLineIndent = Math.min(...lineIndents);

  return lines.map(line => line.slice(minLineIndent)).join('\n');
}

type ProvidedError = [
  // line number
  number,
  // expected indent
  number | string,
  // actual indent
  number | string,
  // node type
  AST_NODE_TYPES | AST_TOKEN_TYPES,
];

function is2DProvidedErrorArr(
  providedErrors?: ProvidedError | ProvidedError[],
): providedErrors is ProvidedError[] {
  return !!providedErrors && Array.isArray(providedErrors[0]);
}

/**
 * Create error message object for failure cases with a single 'found' indentation type
 * @param providedErrors error info
 * @returns returns the error messages collection
 */
export function expectedErrors(
  providedErrors: ProvidedError | ProvidedError[],
): TSESLint.TestCaseError<MessageIds>[];
/**
 * Create error message object for failure cases with a single 'found' indentation type
 * @param providedIndentType indent type of string or tab
 * @param providedErrors error info
 * @returns returns the error messages collection
 */
export function expectedErrors(
  providedIndentType: string,
  providedErrors: ProvidedError | ProvidedError[],
): TSESLint.TestCaseError<MessageIds>[];
export function expectedErrors(
  providedIndentType: string | ProvidedError | ProvidedError[],
  providedErrors?: ProvidedError | ProvidedError[],
): TSESLint.TestCaseError<MessageIds>[] {
  let indentType: string;
  let errors: ProvidedError[];

  if (Array.isArray(providedIndentType)) {
    errors = is2DProvidedErrorArr(providedIndentType)
      ? providedIndentType
      : [providedIndentType];
    indentType = 'space';
  } else {
    errors = is2DProvidedErrorArr(providedErrors)
      ? providedErrors
      : [providedErrors!];
    indentType = providedIndentType;
  }

  return errors.map(err => {
    const [line, expected, actual, type] = err;

    return {
      messageId: 'wrongIndentation',
      data: {
        expected:
          typeof expected === 'string' && typeof actual === 'string'
            ? expected
            : `${expected} ${indentType}${expected === 1 ? '' : 's'}`,
        actual,
      },
      type,
      line,
    };
  });
}
