import type * as mdast from 'mdast';
import type * as unist from 'unist';
import type vfile from 'vfile';

import type { RuleMetaDataWithDocs } from '../utils';

export function insertRuleDescription(
  children: unist.Node[],
  file: vfile.VFile,
  meta: RuleMetaDataWithDocs,
): void {
  children.unshift(
    {
      children: [
        {
          children: meta.docs.description
            .split(/`(.+?)`/)
            .map((value, index, array) => ({
              type: index % 2 === 0 ? 'text' : 'inlineCode',
              value: index === array.length - 1 ? `${value}.` : value,
            })),
          type: 'paragraph',
        },
      ],
      type: 'blockquote',
    } as mdast.Blockquote,
    {
      type: 'jsx',
      value: `<rule-attributes name="${file.stem}" />`,
    } as unist.Node,
  );
}
