import React from 'react';

export interface BioEntry {
  name: string;
  photo: string;
  description: string;
}

export function TeamBio({
  description,
  name,
  photo,
}: BioEntry): React.JSX.Element {
  return (
    <li>
      {name} {description}
    </li>
  );
}
