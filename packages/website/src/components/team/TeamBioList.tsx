import React from 'react';

import type { BioEntry } from './TeamBio';
import { TeamBio } from './TeamBio';
import styles from './TeamBioList.module.css';

export interface TeamBioListProps {
  bios: BioEntry[];
  description: string;
  explanation: string;
}

export function TeamBioList({
  bios,
  description,
  explanation,
}: TeamBioListProps): React.JSX.Element {
  return (
    <div className={styles.teamBioList}>
      <div className={styles.texts}>
        <p className={styles.description}>{description}</p>
        <p className={styles.explanation}>{explanation}</p>
      </div>
      <ul className={styles.bios}>
        {bios.map(bio => (
          <TeamBio {...bio} key={bio.name} />
        ))}
      </ul>
    </div>
  );
}
