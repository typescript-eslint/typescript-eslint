import React from 'react';

import styles from './TeamBio.module.css';

export interface BioEntry {
  description: string;
  links?: [string, string][];
  name: string;
  username: string;
}

export function TeamBio({
  description,
  links = [],
  name,
  username,
}: BioEntry): React.JSX.Element {
  return (
    <li className={styles.teamBio}>
      <img
        alt=""
        className={styles.profilePhoto}
        src={`/img/team/${username}.jpg`}
      />
      <div className={styles.texts}>
        <strong className={styles.name}>{name}</strong>
        <p className={styles.description}> {description}</p>
      </div>
      <ol className={styles.services}>
        {[['github', `https://github.com/${username}`] as const, ...links]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([service, url]) => (
            <li key={service}>
              <a
                className={`image-link ${service}-link social-link-icon ${styles.serviceIconLink}`}
                href={url}
                target="_blank"
                aria-label={`${service}-link`}
              />
            </li>
          ))}
      </ol>
    </li>
  );
}
