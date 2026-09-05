import * as path from 'node:path';

import { eslintPluginDirectory } from '../utils/rules';

export const baseDocsDirectory = path.resolve(
  path.join(__dirname, '../../../../docs'),
);

export const ruleDocsDirectory = path.join(
  eslintPluginDirectory,
  'docs',
  'rules',
);

export const ogImagesDirectory = path.join(__dirname, '../../static/img/og');

export function getDocOgImageName(filePath: string): string {
  const withoutExtension = path
    .relative(baseDocsDirectory, filePath)
    .replace(/\.mdx?$/, '');

  return `docs/${withoutExtension.split(path.sep).join('/')}`;
}

export function getOgImageFilePath(name: string): string {
  return path.join(ogImagesDirectory, `${name}.png`);
}

export function getOgImageUrl(name: string): string {
  return `/img/og/${name}.png`;
}

export function getRuleOgImageName(ruleName: string): string {
  return `rules/${ruleName}`;
}

export function isInDirectory(directory: string, filePath: string): boolean {
  const relative = path.relative(directory, filePath);

  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}
