import Link from '@docusaurus/Link';
import recentPosts from '@site/data/recent-blog-posts.json';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import React from 'react';
import Markdown from 'react-markdown';

import styles from './styles.module.css';

export function RecentBlogPosts(): React.JSX.Element {
  return (
    <section className={styles.blogPosts}>
      <div className="container text--center padding-vert--lg">
        <Heading as="h2" id="financial-contributors">
          Recent Blog Posts
        </Heading>
        <ul className={styles.postsList}>
          {recentPosts.map(post => (
            <li className={styles.post} key={post.title}>
              <a className={styles.postLink} href={`/blog/${post.slug}`}>
                <div className={styles.postTitle}>
                  <Markdown>{post.title}</Markdown>
                </div>
                <Markdown>{post.description}</Markdown>
                <div className={styles.postTiming}>
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                  ·<div>{post.readingTime} minute read</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <Link
          className={clsx('button button--primary', styles.seeAll)}
          to="/blog"
        >
          See all blog posts
        </Link>
      </div>
    </section>
  );
}
