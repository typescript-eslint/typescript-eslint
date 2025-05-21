import type { Props } from '@theme/BlogSidebar/Content';
import type { ReactNode } from 'react';

import { groupBlogSidebarItemsByYear } from '@docusaurus/plugin-content-blog/client';
import { useThemeConfig } from '@docusaurus/theme-common';
import Heading from '@theme/Heading';
import React, { memo } from 'react';
import Markdown from 'react-markdown';

import styles from './styles.module.css';

function BlogSidebarYearGroup({
  children,
  year,
  yearGroupHeadingClassName,
}: {
  children: ReactNode;
  year: string;
  yearGroupHeadingClassName?: string;
}): React.JSX.Element {
  return (
    <div className={styles.blogSidebarContent} role="group">
      <Heading as="h3" className={yearGroupHeadingClassName}>
        {year}
      </Heading>
      {children}
    </div>
  );
}

function BlogSidebarContent({
  items: itemsRaw,
  ListComponent,
  yearGroupHeadingClassName,
}: Props): ReactNode {
  const items = itemsRaw.map(item => ({
    ...item,
    title: (<Markdown>{item.title}</Markdown>) as unknown as string,
  }));

  const themeConfig = useThemeConfig();

  if (themeConfig.blog.sidebar.groupByYear) {
    const itemsByYear = groupBlogSidebarItemsByYear(items);
    return (
      <>
        {itemsByYear.map(([year, yearItems]) => (
          <BlogSidebarYearGroup
            key={year}
            year={year}
            yearGroupHeadingClassName={yearGroupHeadingClassName}
          >
            <ListComponent items={yearItems} />
          </BlogSidebarYearGroup>
        ))}
      </>
    );
  }

  return (
    <div className={styles.blogSidebarContent}>
      <ListComponent items={items} />
    </div>
  );
}

export default memo(BlogSidebarContent);
