import * as fs from 'fs';
import type * as mdast from 'mdast';
import * as path from 'path';

import type { RuleDocsPage } from '../RuleDocsPage';
import { eslintPluginDirectory } from '../utils';

export function insertSpecialCaseOptions(page: RuleDocsPage): void {
  if (page.file.stem !== 'ban-types') {
    return;
  }

  const detailsElement = page.children.find(
    (node): node is mdast.Parent =>
      (node as mdast.Node & { name: string }).name === 'details' &&
      (node as mdast.Parent).children.length > 0 &&
      ((node as mdast.Parent).children[0] as { name: string }).name ===
        'summary',
  );

  if (!detailsElement) {
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

  detailsElement.children.push({
    lang: 'ts',
    type: 'code',
    value: defaultOptions,
  } as mdast.Code);
}
