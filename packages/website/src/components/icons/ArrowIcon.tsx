import React from 'react';
import SVGIcon, { IconBaseProps } from './SVGIcon';

function ArrowIcon(props: IconBaseProps): JSX.Element {
  return (
    <SVGIcon {...props} path="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  );
}

export default ArrowIcon;
