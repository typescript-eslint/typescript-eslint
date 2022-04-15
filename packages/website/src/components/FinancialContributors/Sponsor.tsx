import React from 'react';

import { SponsorData, SponsorIncludeOptions } from './types';

interface SponsorProps {
  className?: string;
  include?: SponsorIncludeOptions;
  sponsor: SponsorData;
}

export function Sponsor({
  className,
  include = {},
  sponsor,
}: SponsorProps): JSX.Element {
  let children = <img alt={`${sponsor.name} logo`} src={sponsor.image} />;

  if (include.name) {
    children = (
      <>
        {children}
        {sponsor.name.split(' - ')[0]}
      </>
    );
  }

  if (include.link) {
    children = (
      <a
        className={className}
        href={sponsor.website ?? undefined}
        title={sponsor.name}
        target="_blank"
        rel="noopener sponsored"
      >
        {children}
      </a>
    );
  }

  return children;
}
