// Forked from https://github.com/eslint/eslint/blob/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/lib/linter/interpolate.js

import type { ReportDescriptorMessageData } from '@typescript-eslint/utils/ts-eslint';

/**
 * Returns a global expression matching placeholders in messages.
 */
export function getPlaceholderMatcher(): RegExp {
  return /\{\{([^{}]+?)\}\}/gu;
}

export function interpolate(
  text: string,
  data: ReportDescriptorMessageData | undefined,
): string {
  if (!data) {
    return text;
  }

  const matcher = getPlaceholderMatcher();

  // Substitution content for any {{ }} markers.
  return text.replace(matcher, (fullMatch, termWithWhitespace: string) => {
    const term = termWithWhitespace.trim();

    if (term in data) {
      return String(data[term]);
    }

    // Preserve old behavior: If parameter name not provided, don't replace it.
    return fullMatch;
  });
}
