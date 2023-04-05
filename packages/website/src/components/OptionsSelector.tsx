import {
  NavbarSecondaryMenuFiller,
  useWindowSize,
} from '@docusaurus/theme-common';
import CopyIcon from '@site/src/icons/copy.svg';
import IconExternalLink from '@theme/Icon/ExternalLink';
import React, { useCallback } from 'react';

import { useClipboard } from '../hooks/useClipboard';
import Dropdown from './inputs/Dropdown';
import Tooltip from './inputs/Tooltip';
import ActionLabel from './layout/ActionLabel';
import Expander from './layout/Expander';
import InputLabel from './layout/InputLabel';
import { createMarkdown, createMarkdownParams } from './lib/markdown';
import { fileTypes } from './options';
import type { ConfigModel } from './types';

export interface OptionsSelectorParams {
  readonly state: ConfigModel;
  readonly setState: (cfg: Partial<ConfigModel>) => void;
  readonly tsVersions: readonly string[];
  readonly isLoading: boolean;
}

function OptionsSelectorContent({
  state,
  setState,
  tsVersions,
  isLoading,
}: OptionsSelectorParams): JSX.Element {
  const [copyLink, copyLinkToClipboard] = useClipboard(() =>
    document.location.toString(),
  );
  const [copyMarkdown, copyMarkdownToClipboard] = useClipboard(() =>
    createMarkdown(state),
  );

  const updateTS = useCallback(
    (version: string) => {
      setState({ ts: version });
    },
    [setState],
  );

  const openIssue = useCallback(() => {
    if (isLoading) {
      return;
    }
    window
      .open(
        `https://github.com/typescript-eslint/typescript-eslint/issues/new?${createMarkdownParams(
          state,
        )}`,
        '_blank',
      )
      ?.focus();
  }, [state, isLoading]);

  return (
    <>
      <Expander label="Info">
        <InputLabel name="TypeScript">
          <Dropdown
            name="ts"
            className="text--right"
            value={state.ts}
            disabled={!tsVersions.length}
            onChange={updateTS}
            options={(tsVersions.length && tsVersions) || [state.ts]}
          />
        </InputLabel>
        <InputLabel name="Eslint">{process.env.ESLINT_VERSION}</InputLabel>
        <InputLabel name="TSEslint">{process.env.TS_ESLINT_VERSION}</InputLabel>
      </Expander>
      <Expander label="Options">
        <InputLabel name="File type">
          <Dropdown
            name="fileType"
            value={state.fileType}
            onChange={(fileType): void => setState({ fileType })}
            options={fileTypes}
          />
        </InputLabel>
        <InputLabel name="Source type">
          <Dropdown
            name="sourceType"
            value={state.sourceType}
            onChange={(e): void => setState({ sourceType: e })}
            options={['script', 'module']}
          />
        </InputLabel>
      </Expander>
      <Expander label="Actions">
        <ActionLabel name="Copy link" onClick={copyLinkToClipboard}>
          <Tooltip open={copyLink} text="Copied">
            <CopyIcon width="13.5" height="13.5" />
          </Tooltip>
        </ActionLabel>
        <ActionLabel name="Copy Markdown" onClick={copyMarkdownToClipboard}>
          <Tooltip open={copyMarkdown} text="Copied">
            <CopyIcon width="13.5" height="13.5" />
          </Tooltip>
        </ActionLabel>
        <ActionLabel name="Report as Issue" onClick={openIssue}>
          <IconExternalLink width="13.5" height="13.5" />
        </ActionLabel>
      </Expander>
    </>
  );
}

function OptionsSelector(props: OptionsSelectorParams): JSX.Element {
  const windowSize = useWindowSize();
  if (windowSize === 'mobile') {
    return (
      <NavbarSecondaryMenuFiller
        component={OptionsSelectorContent}
        props={props}
      />
    );
  }
  return <OptionsSelectorContent {...props} />;
}

export default OptionsSelector;
