import React, { useCallback } from 'react';

export interface CheckboxProps {
  readonly checked: boolean | undefined;
  readonly className?: string;
  readonly indeterminate?: boolean;
  readonly name: string;
  readonly onChange: (checked: boolean, value: string) => void;
  readonly value?: string;
}

function Checkbox(props: CheckboxProps): React.JSX.Element {
  const { indeterminate } = props;

  const checkboxRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (!node) {
        return;
      }

      node.indeterminate = indeterminate ?? false;
    },
    [indeterminate],
  );

  return (
    <input
      checked={props.checked && !props.indeterminate}
      className={props.className}
      name={props.name}
      onChange={(e): void =>
        props.onChange(e.target.checked, props.value ?? '')
      }
      ref={checkboxRef}
      type="checkbox"
    />
  );
}

export default Checkbox;
