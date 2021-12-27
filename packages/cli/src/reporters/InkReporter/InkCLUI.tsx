import * as ink from 'ink';
import useStdoutDimensions from 'ink-use-stdout-dimensions';
import React, { useMemo } from 'react';

import type { LogLevel } from '../../commands/Command';
import { Divider } from './Divider';
import type { Progress } from './ProgressBar';
import { ProgressBar } from './ProgressBar';

function sortEntriesByKey<T>(obj: Record<string, T>): [string, T][] {
  return Object.entries(obj).sort(([a], [b]) => (a < b ? -1 : 1));
}

interface Props {
  hideProgress?: boolean;
  logLevel: LogLevel;
  lintResult: { [id: string]: string };
  logLines: { type: 'log' | 'debug' | 'error'; line: string }[];
  progress: {
    [id: string]: Progress;
  };
}

function InkCLUI(props: Readonly<Props>): JSX.Element {
  const [stdoutWidth] = useStdoutDimensions();
  const lintResult = useMemo(
    () => sortEntriesByKey(props.lintResult),
    [props.lintResult],
  );
  const progress = useMemo(
    () => sortEntriesByKey(props.progress),
    [props.progress],
  );
  return (
    <ink.Box flexDirection="column" width="100%">
      <ink.Static items={props.logLines}>
        {(line, idx): JSX.Element => (
          <ink.Box key={idx}>
            <ink.Text
              {...((): ink.TextProps => {
                switch (line.type) {
                  case 'debug':
                    return {
                      color: 'gray',
                    };

                  case 'error':
                    return {
                      color: 'red',
                    };

                  case 'log':
                    return {
                      color: 'white',
                    };
                }
              })()}
            >
              {line.line}
            </ink.Text>
          </ink.Box>
        )}
      </ink.Static>

      {lintResult.length > 0 && (
        <ink.Box flexDirection="column" width="100%">
          {lintResult.map(([id, result]) => (
            <ink.Box key={id} flexDirection="column" width="100%">
              <ink.Text>{id}</ink.Text>
              <ink.Text>{result}</ink.Text>
            </ink.Box>
          ))}
        </ink.Box>
      )}

      {props.hideProgress !== true && (
        <>
          <Divider stdoutWidth={stdoutWidth} />

          <ink.Box flexDirection="column" width="100%">
            {progress.map(([id, progress]) => (
              <ink.Box key={id} flexDirection="column" width="100%">
                <ink.Text>{id}</ink.Text>
                <ProgressBar stdoutWidth={stdoutWidth} {...progress} />
              </ink.Box>
            ))}
          </ink.Box>
        </>
      )}
    </ink.Box>
  );
}

export type { Props as InkCLUIProps };
export { InkCLUI };
