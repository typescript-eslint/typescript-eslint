import * as ink from 'ink';
import React, { useMemo } from 'react';

interface Progress {
  readonly current: number;
  readonly max: number;
}
interface Props extends Progress {
  readonly stdoutWidth: number;
}
const ProgressBar = React.memo(
  ({ current, max, stdoutWidth }: Props): JSX.Element => {
    const progress = current / max;
    const text = `[${current}/${max} (${(progress * 100).toFixed(1)}%)]`;
    // calculate the "max length" of the text so the progress bar remains a constant width
    const textMaxLength = useMemo(
      () => `[${max}/${max} (100.0%)]`.length,
      [max],
    );
    const bar = ''.padEnd(
      Math.round(progress * stdoutWidth) - textMaxLength,
      '█',
    );

    return (
      <ink.Box width="100%">
        <ink.Text>{bar}</ink.Text>
        <ink.Spacer />
        <ink.Text>{text}</ink.Text>
      </ink.Box>
    );
  },
);

export type { Progress, Props as ProgressBarProps };
export { ProgressBar };
