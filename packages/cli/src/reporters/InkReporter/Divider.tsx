import * as ink from 'ink';
import React from 'react';

interface Props {
  readonly stdoutWidth: number;
}
const Divider = React.memo(({ stdoutWidth }: Props): JSX.Element => {
  const bar = ''.padEnd(stdoutWidth, '-');

  return (
    <ink.Box width="100%">
      <ink.Text>{bar}</ink.Text>
    </ink.Box>
  );
});

export type { Props as DividerProps };
export { Divider };
