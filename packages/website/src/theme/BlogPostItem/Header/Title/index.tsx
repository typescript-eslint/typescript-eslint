import type { Props } from '@theme/BlogPostItem/Header/Title';

import Link from '@docusaurus/Link';
import { useBlogPost } from '@docusaurus/plugin-content-blog/client';
import clsx from 'clsx';
import React from 'react';
import Markdown from 'react-markdown';

import styles from './styles.module.css';

export default function BlogPostItemHeaderTitle({
  className,
}: Props): React.JSX.Element {
  const { isBlogPostPage, metadata } = useBlogPost();
  const { permalink, title: titleRaw } = metadata;
  const TitleHeading = isBlogPostPage ? 'h1' : 'h2';
  const title = <Markdown>{titleRaw}</Markdown>;
  return (
    <TitleHeading className={clsx(styles.title, className)}>
      {isBlogPostPage ? title : <Link to={permalink}>{title}</Link>}
    </TitleHeading>
  );
}
