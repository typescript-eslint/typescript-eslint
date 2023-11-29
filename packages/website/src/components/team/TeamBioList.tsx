import React from 'react';

import type { BioEntry } from './TeamBio';
import { TeamBio } from './TeamBio';

export type BioTier = 'committer' | 'maintainer';

export interface TeamBioListProps {
  bios: Omit<BioEntry, 'tier'>[];
  tier: BioTier;
}

export function TeamBioList({ bios }: TeamBioListProps): React.JSX.Element {
  return (
    <ul>
      {bios.map(bio => (
        <TeamBio {...bio} key={bio.name} />
      ))}
    </ul>
  );
}
