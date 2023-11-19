import * as fs from 'fs';
import type * as mdast from 'mdast';
import * as path from 'path';
import type * as unist from 'unist';

import type { RequiredHeadingIndices } from './requiredHeadings';
import { spliceChildrenAndAdjustHeadings } from './splicing';
import { eslintPluginDirectory } from './strings';
import type { VFileWithStem } from './types';

export function spliceSpecialCaseOptions(
  children: unist.Node[],
  file: VFileWithStem,
  headingIndices: RequiredHeadingIndices,
): void {
  if (file.stem !== 'ban-types') {
    return;
  }

  const placeToInsert = children.findIndex(
    (node: unist.Node) =>
      node.type === 'comment' &&
      (node as unist.Literal<string>).value.trim() === 'Inject default options',
  );

  if (placeToInsert === -1) {
    throw new Error('Could not find default injection site in ban-types');
  }

  const defaultOptions = fs
    .readFileSync(
      path.join(eslintPluginDirectory, 'src/rules/ban-types.ts'),
      'utf8',
    )
    .match(/^const defaultTypes.+?^\};$/msu)?.[0];

  if (!defaultOptions) {
    throw new Error('Could not find default options for ban-types');
  }

  spliceChildrenAndAdjustHeadings(children, headingIndices, placeToInsert, 1, {
    lang: 'ts',
    type: 'code',
    value: defaultOptions,
  } as mdast.Code);
}
