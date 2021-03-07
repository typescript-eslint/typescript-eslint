import React, { MouseEvent } from 'react';

interface IconBaseProps {
  className?: string;
  pathClass?: string;
  width?: number;
  height?: number;
  fill?: string;
  onClick?(e: MouseEvent<SVGSVGElement>): void;
}

interface IconSVGProps extends IconBaseProps {
  path: string;
}

export function SVGIcon(props: IconSVGProps): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={props.width || 18}
      height={props.height || 18}
      fill={props.fill || 'currentColor'}
      className={props.className}
      onClick={e => {
        props.onClick && props.onClick(e);
      }}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path className={props.pathClass} d={props.path} />
    </svg>
  );
}

export function EditIcon(props: IconBaseProps): JSX.Element {
  return (
    <SVGIcon
      {...props}
      path="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
    />
  );
}

export function DeleteIcon(props: IconBaseProps): JSX.Element {
  return (
    <SVGIcon
      {...props}
      path="M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z"
    />
  );
}

export function ArrowIcon(props: IconBaseProps): JSX.Element {
  return (
    <SVGIcon {...props} path="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  );
}

export function AddIcon(props: IconBaseProps): JSX.Element {
  return (
    <SVGIcon
      {...props}
      path="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
    />
  );
}
