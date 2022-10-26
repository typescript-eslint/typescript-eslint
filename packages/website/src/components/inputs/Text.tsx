import React from 'react';

export interface DropdownProps {
  readonly onChange: (value: string) => void;
  readonly value: string;
  readonly name: string;
  readonly className?: string;
  readonly type?: 'text' | 'search';
}

// eslint-disable-next-line react/display-name
const Text = React.forwardRef((props: DropdownProps, ref): JSX.Element => {
  return (
    <input
      value={props.value}
      onChange={(e): void => props.onChange(e.target.value)}
      name={props.name}
      className={props.className}
      type={props.type ?? 'text'}
      // @ts-expect-error: not sure why react has an error here
      ref={ref}
    />
  );
});

export default Text;
