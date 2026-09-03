import type { CodeBlockMetadata } from '@docusaurus/theme-common/internal';

// `code-block-removed-line`s are rendered for context, but shouldn't be copied
// or sent to the playground.
export function getVisibleCodeLines(metadata: CodeBlockMetadata): string[] {
  return metadata.code
    .split('\n')
    .filter(
      (_, i) =>
        !(metadata.lineClassNames[i] as string[] | undefined)?.includes(
          'code-block-removed-line',
        ),
    );
}
