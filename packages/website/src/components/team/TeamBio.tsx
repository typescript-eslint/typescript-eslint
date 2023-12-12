import React from 'react';

export interface BioEntry {
  description: string;
  name: string;
  username: string;
}

export function TeamBio({
  description,
  name,
  username,
}: BioEntry): React.JSX.Element {
  return (
    <li>
      <img alt="" src={`/img/team/${username}.jpg`} />
      {name} {description}
    </li>
  );
}
