import type { Plugin } from '@docusaurus/types';

import matter from 'gray-matter';
import * as fs from 'node:fs/promises';
import readingTime from 'reading-time';
import { z } from 'zod';

const storageDirectory = 'data';
const storageFile = `data/recent-blog-posts.json`;

const matterSchema = z.object({
  description: z.string(),
  slug: z.string(),
  title: z.string(),
});

export default async function blogPluginEnhanced(): Promise<Plugin> {
  const blogHandles = (await fs.readdir('blog', { withFileTypes: true }))
    .filter(handle => handle.isFile() && /.mdx?$/.test(handle.name))
    .map(handle => ({
      date: new Date(/\d+-\d+-\d+/.exec(handle.name)?.[0] || '1970-01-01'),
      handle,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  const blogPosts = await Promise.all(
    blogHandles.map(async ({ date, handle }) => {
      const content = await fs.readFile(`blog/${handle.name}`, 'utf-8');
      const data = matterSchema.parse(matter(content).data);

      return {
        date,
        description: data.description,
        readingTime: Math.round(readingTime(content).minutes),
        slug: data.slug,
        title: data.title,
      };
    }),
  );

  await fs.mkdir(storageDirectory, { recursive: true });
  await fs.writeFile(storageFile, JSON.stringify(blogPosts, null, 2));

  return {
    name: 'recent-blog-posts',
  };
}
