import React from 'react';

import { Sponsor } from './types';

interface SponsorExpandedProps {
  className?: string;
  sponsor: Sponsor;
}

export function SponsorExpanded({
  className,
  sponsor,
}: SponsorExpandedProps): JSX.Element {
  return (
    <a
      className={className}
      href={sponsor.website ?? undefined}
      title={sponsor.name}
      target="_blank"
      rel="noopener sponsored"
    >
      <img alt={`${sponsor.name} logo`} src={sponsor.image} />
      {sponsor.name.split(' - ')[0]}
    </a>
  );
}
