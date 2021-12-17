import React, { createRef, useEffect } from 'react';

export interface CheckboxProps {
  readonly name: string;
  readonly value?: string;
  readonly onChange: (checked: boolean, value: string) => void;
  readonly indeterminate?: boolean;
  readonly checked: boolean | undefined;
  readonly className?: string;
}

function Checkbox(props: CheckboxProps): JSX.Element {
  const checkboxRef = createRef<HTMLInputElement>();

  useEffect(() => {
    if (!checkboxRef.current) {
      return;
    }

    if (props.indeterminate !== checkboxRef.current.indeterminate) {
      checkboxRef.current.indeterminate = props.indeterminate ?? false;
    }
  }, [props.indeterminate]);

  return (
    <input
      ref={checkboxRef}
      className={props.className}
      name={props.name}
      checked={props.checked && !props.indeterminate}
      type="checkbox"
      onChange={(e): void =>
        props.onChange(e.target.checked, props.value ?? '')
      }
    />
  );
}

export default Checkbox;
