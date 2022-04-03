import React from 'react';

import { Sponsor } from './types';

interface SponsorProps {
  className?: string;
  sponsor: Sponsor;
}

export function SponsorBasic({
  className,
  sponsor,
}: SponsorProps): JSX.Element {
  return (
    <div className={className}>
      <img src={sponsor.image} alt={`${sponsor.name} logo`} />
    </div>
  );
}
