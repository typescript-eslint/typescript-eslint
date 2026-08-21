import type { Plugin } from '@docusaurus/types';

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { getCard } from './getCard';
import {
  baseDocsDirectory,
  getOgImageFilePath,
  ogImagesDirectory,
  ruleDocsDirectory,
} from './paths';
import { renderCard } from './renderCard';

async function writeCards(directory: string): Promise<void> {
  const entries = await fs.readdir(directory, { recursive: true });

  for (const entry of entries) {
    // Files prefixed with _ are MDX partials, which don't have their own page.
    if (!/\.mdx?$/.test(entry) || path.basename(entry).startsWith('_')) {
      continue;
    }

    const filePath = path.join(directory, entry);
    const image = await getCard(filePath, await fs.readFile(filePath, 'utf8'));

    if (!image) {
      continue;
    }

    const imagePath = getOgImageFilePath(image.name);

    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    await fs.writeFile(imagePath, await renderCard(image.card));
  }
}

export default async function ogImages(): Promise<Plugin> {
  await fs.rm(ogImagesDirectory, { force: true, recursive: true });

  await writeCards(ruleDocsDirectory);
  await writeCards(baseDocsDirectory);

  return {
    name: 'og-images',
  };
}
