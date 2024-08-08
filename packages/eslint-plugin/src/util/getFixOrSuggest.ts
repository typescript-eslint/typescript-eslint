import type { TSESLint } from '@typescript-eslint/utils';

export function getFixOrSuggest<MessageId extends string>({
  useFix,
  suggestion,
}: {
  useFix: boolean;
  suggestion: TSESLint.SuggestionReportDescriptor<MessageId>;
}):
  | { fix: TSESLint.ReportFixFunction }
  | { suggest: TSESLint.SuggestionReportDescriptor<MessageId>[] } {
  return useFix ? { fix: suggestion.fix } : { suggest: [suggestion] };
}
