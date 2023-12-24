import * as fs from 'fs';
import type * as mdast from 'mdast';
import * as path from 'path';
import type * as unist from 'unist';

import type { RuleDocsPage } from '../RuleDocsPage';
import { eslintPluginDirectory } from '../utils';

export function insertSpecialCaseOptions(page: RuleDocsPage): void {
  if (page.file.stem !== 'ban-types') {
    return;
  }

  const placeToInsert = page.children.findIndex(
    node =>
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

  page.spliceChildren(placeToInsert, 1, {
    lang: 'ts',
    type: 'code',
    value: defaultOptions,
  } as mdast.Code);
}
