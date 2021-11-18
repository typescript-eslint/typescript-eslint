import React, { useEffect, useRef } from 'react';

interface CheckboxProps {
  name: string;
  value: string;
  onChange: (checked: boolean, value: string) => void;
  indeterminate?: boolean;
  checked: boolean;
  className?: string;
}

function Checkbox(props: CheckboxProps): JSX.Element {
  const checkboxRef = useRef<HTMLInputElement>();

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
      onChange={(e): void => props.onChange(e.target.checked, props.value)}
    />
  );
}

export default Checkbox;
