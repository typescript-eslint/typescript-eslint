import type { TSESLint } from '@typescript-eslint/utils';

export function getFixOrSuggest<MessageId extends string>({
  fixOrSuggest,
  suggestion,
}: {
  fixOrSuggest: 'fix' | 'none' | 'suggest';
  suggestion: TSESLint.SuggestionReportDescriptor<MessageId>;
}):
  | { fix: TSESLint.ReportFixFunction }
  | { suggest: TSESLint.SuggestionReportDescriptor<MessageId>[] }
  | undefined {
  switch (fixOrSuggest) {
    case 'fix':
      return { fix: suggestion.fix };
    case 'none':
      return undefined;
    case 'suggest':
      return { suggest: [suggestion] };
  }
}
