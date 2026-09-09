import type { ParseFrontMatter } from '@docusaurus/types';

import { getCard } from './getCard';
import { getOgImageUrl } from './paths';

export const parseFrontMatter: ParseFrontMatter = async params => {
  const result = await params.defaultParseFrontMatter(params);

  if (result.frontMatter.image) {
    return result;
  }

  const image = await getCard(params.filePath, params.fileContent);

  if (!image) {
    return result;
  }

  return {
    ...result,
    frontMatter: {
      ...result.frontMatter,
      image: getOgImageUrl(image.name),
    },
  };
};
