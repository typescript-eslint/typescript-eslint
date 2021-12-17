import React from 'react';
import SVGIcon, { IconBaseProps } from './SVGIcon';

function CopyIcon(props: IconBaseProps): JSX.Element {
  return (
    <SVGIcon
      {...props}
      path="M 3 3 L 3 17 L 5 17 L 5 5 L 17 5 L 17 3 L 3 3 z M 7 7 L 7 21 L 21 21 L 21 7 L 7 7 z "
    />
  );
}

export default CopyIcon;
