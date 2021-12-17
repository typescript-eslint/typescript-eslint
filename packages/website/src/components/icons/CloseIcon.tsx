import React from 'react';
import SVGIcon, { IconBaseProps } from './SVGIcon';

function CloseIcon(props: IconBaseProps): JSX.Element {
  return (
    <SVGIcon
      {...props}
      path="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
    />
  );
}

export default CloseIcon;
