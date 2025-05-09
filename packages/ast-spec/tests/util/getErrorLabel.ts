import { ErrorLabel } from './parsers/parser-types.js';

/**
 * Get the {@linkcode ErrorLabel | error label} based on the error types.
 *
 * @param isBabelError - Indicates if the error is from **Babel**.
 * @param isTSESTreeError - Indicates if the error is from **TSESTree**.
 * @returns The corresponding {@linkcode ErrorLabel | error label}.
 *
 * @internal
 * @since 8.32.0
 */
export const getErrorLabel = (
  isBabelError: boolean,
  isTSESTreeError: boolean,
): ErrorLabel => {
  if (!isBabelError && isTSESTreeError) {
    return ErrorLabel.TSESTree;
  }

  if (isBabelError && !isTSESTreeError) {
    return ErrorLabel.Babel;
  }

  if (isBabelError && isTSESTreeError) {
    return ErrorLabel.Both;
  }

  return ErrorLabel.None;
};
