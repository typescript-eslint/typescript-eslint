import type { TSESLint } from '@typescript-eslint/utils';

export function getFixOrSuggest<MessageId extends string>({
  suggestion,
  useFix,
}: {
  suggestion: TSESLint.SuggestionReportDescriptor<MessageId>;
  useFix: boolean;
}):
  | { fix: TSESLint.ReportFixFunction }
  | { suggest: TSESLint.SuggestionReportDescriptor<MessageId>[] } {
  return useFix ? { fix: suggestion.fix } : { suggest: [suggestion] };
}
