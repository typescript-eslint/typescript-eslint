import {
  DEFAULT_PARSE_FRONT_MATTER,
  parseMarkdownFile,
} from '@docusaurus/utils';
import * as path from 'node:path';

import type { Card } from './renderCard';

import { baseDocsDirectory } from './paths';

function getLabels(filePath: string): string[] {
  const directory = path.dirname(path.relative(baseDocsDirectory, filePath));

  if (directory === '.') {
    return [];
  }

  const [section] = directory.split(path.sep);

  return [
    section
      .split('-')
      .map(word => `${word[0].toUpperCase()}${word.slice(1)}`)
      .join(' '),
  ];
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export async function getDocCard(
  filePath: string,
  fileContent: string,
): Promise<Card | undefined> {
  const { contentTitle, excerpt, frontMatter } = await parseMarkdownFile({
    fileContent,
    filePath,
    parseFrontMatter: DEFAULT_PARSE_FRONT_MATTER,
    removeContentTitle: true,
  });

  const title = getString(frontMatter.title) ?? contentTitle;

  if (!title) {
    return undefined;
  }

  const description = getString(frontMatter.description) ?? excerpt;

  return {
    // Excerpts starting with a tag are MDX component markup, not prose.
    description: description?.startsWith('<') ? undefined : description,
    labels: getLabels(filePath).filter(label => label !== title),
    title,
  };
}
