import Link from '@docusaurus/Link';
import clsx from 'clsx';
import React from 'react';

import { fileTypes } from '../../components/options';
import styles from './TryInPlayground.module.css';

const fileExtensionsSortedByLength = fileTypes
  .toSorted((a, b) => b.length - a.length)
  .map(fileExtension => {
    const language = fileExtension.replaceAll(/^\./g, '');
    return [language, new RegExp(`^${language}\\b`)] as const;
  });

export function TryInPlayground({
  eslintrcHash,
  children,
  className,
  codeHash,
  language,
}: {
  eslintrcHash: string;
  children?: React.ReactNode;
  className?: string;
  codeHash?: string;
  language?: string;
}): React.ReactNode {
  const params = new URLSearchParams({ eslintrc: eslintrcHash });
  if (codeHash) {
    params.set('code', codeHash);
  }
  if (language) {
    // iterating over sorted array, so the longer extensions will be matched first
    for (const [
      fileExtension,
      fileLanguageRegExp,
    ] of fileExtensionsSortedByLength) {
      if (fileLanguageRegExp.test(language)) {
        params.set('fileType', `.${fileExtension}`);
        break;
      }
    }
  }

  return (
    <Link
      className={clsx(styles.tryInPlaygroundLink, className)}
      to={`/play#${params.toString()}`}
      target="_blank"
    >
      {children}
    </Link>
  );
}
