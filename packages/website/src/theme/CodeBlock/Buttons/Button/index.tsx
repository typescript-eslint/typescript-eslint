import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import type { Props } from '@theme/CodeBlock/Buttons/Button';

export default function CodeBlockButton({
  className,
  ...props
}: Props): ReactNode {
  return (
    <button type="button" {...props} className={clsx('clean-btn', className)} />
  );
}
