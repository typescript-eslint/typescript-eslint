import React from 'react';

export interface DropdownProps {
  readonly onChange: (value: string) => void;
  readonly value: string;
  readonly name: string;
  readonly className?: string;
  readonly type?: 'text' | 'search';
  readonly placeholder?: string;
}

// eslint-disable-next-line react/display-name
const Text = React.forwardRef<HTMLInputElement, DropdownProps>(
  (props, ref): JSX.Element => {
    return (
      <input
        value={props.value}
        onChange={(e): void => props.onChange(e.target.value)}
        name={props.name}
        className={props.className}
        type={props.type ?? 'text'}
        placeholder={props.placeholder}
        ref={ref}
      />
    );
  },
);

export default Text;
