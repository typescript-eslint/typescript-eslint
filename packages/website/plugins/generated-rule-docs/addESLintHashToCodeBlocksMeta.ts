import type * as unist from 'unist';

import { nodeIsCode } from './nodes';
import { convertToPlaygroundHash } from './strings';
import type { VFileWithStem } from './types';

const optionRegex = /option='(?<option>.*?)'/;

export function addESLintHashToCodeBlocksMeta(
  children: unist.Node[],
  eslintrc: string,
  file: VFileWithStem,
): void {
  let insideTab = false;

  for (const node of children) {
    if (
      node.type === 'jsx' &&
      'value' in node &&
      typeof node.value === 'string'
    ) {
      if (node.value.startsWith('<TabItem')) {
        insideTab = true;
      } else if (node.value === '</TabItem>') {
        insideTab = false;
      }
      continue;
    }

    if (
      nodeIsCode(node) &&
      (insideTab || node.meta?.includes('showPlaygroundButton')) &&
      !node.meta?.includes('eslintrcHash=')
    ) {
      let playgroundEslintrc = eslintrc;
      const option = node.meta?.match(optionRegex)?.groups?.option;
      if (option) {
        playgroundEslintrc = playgroundEslintrc.replace(
          '"error"',
          `["error", ${option}]`,
        );
        try {
          playgroundEslintrc = JSON.stringify(
            JSON.parse(playgroundEslintrc),
            null,
            2,
          );
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            `Invalid JSON detected in ${file.basename}. Check the \`option\` in the meta strings of code blocks.`,
          );
          throw err;
        }
      }

      node.meta = [
        node.meta,
        `eslintrcHash="${convertToPlaygroundHash(playgroundEslintrc)}"`,
      ]
        .filter(Boolean)
        .join(' ');
    }
  }
}
