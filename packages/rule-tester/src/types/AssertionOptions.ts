export interface AssertionOptions {
  /**
   * - If `true`, each error object and each suggestion object must also specify `data` if the message referenced by `messageId` has placeholders.
   * - If `'error'`, each error object must also specify `data` if the message referenced by `messageId` has placeholders.
   * - If `'suggestion'`, each suggestion object must also specify `data` if the message referenced by `messageId` has placeholders.
   * @default `false`
   */
  readonly requireData?: boolean | 'error' | 'suggestion';
  /**
   * If `true`, each `errors` block must contain location properties `line`, `column`, `endLine`, and `endColumn`. Properties `endLine` and `endColumn` may be omitted if the actual error does not contain them.
   * @default `false`
   */
  readonly requireLocation?: boolean;
}
