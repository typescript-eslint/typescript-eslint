import Npm from '@uiw/react-shields/npm';
import React from 'react';

import packageData from '../../../package.json';
import styles from './PackageLink.module.css';

export interface PackageLinkProps {
  scope?: string;
  packageName: string;
}

export function PackageLink({
  packageName,
  scope,
}: PackageLinkProps): React.JSX.Element {
  const fullPackageName = [scope, packageName].filter(Boolean).join('/');
  const { version } = packageData;

  return (
    <Npm.Version
      alt={`npm: ${fullPackageName} v${version}`}
      anchor={{ target: '_blank' }}
      className={styles.packageLink}
      href={`https://npmjs.com/${fullPackageName}`}
      packageName={packageName}
      scope={scope}
    />
  );
}
