import React, { MouseEvent } from 'react';

export interface IconBaseProps {
  className?: string;
  pathClass?: string;
  width?: number;
  height?: number;
  size?: number;
  fill?: string;
  onClick?(e: MouseEvent<SVGSVGElement>): void;
}

export interface IconSVGProps extends IconBaseProps {
  path: string;
}

function SVGIcon(props: IconSVGProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={props.size ?? props.width ?? 18}
      height={props.size ?? props.height ?? 18}
      fill={props.fill ?? 'currentColor'}
      className={props.className}
      onClick={(e): void => {
        props.onClick?.(e);
      }}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path className={props.pathClass} d={props.path} />
    </svg>
  );
}

export default SVGIcon;
