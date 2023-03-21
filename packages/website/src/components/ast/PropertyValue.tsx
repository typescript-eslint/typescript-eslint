import Link from '@docusaurus/Link';
import React, { useMemo, useState } from 'react';

import styles from './ASTViewer.module.css';
import { objType } from './utils';

export interface PropertyValueProps {
  readonly value: unknown;
}

export type ASTViewerModelTypeSimple =
  | 'ref'
  | 'string'
  | 'number'
  | 'class'
  | 'boolean'
  | 'bigint'
  | 'regexp'
  | 'undefined'
  | 'error';

export interface SimpleModel {
  readonly value: string;
  readonly type: ASTViewerModelTypeSimple;
  readonly className: string;
  shortValue?: string;
}

export function getSimpleModel(data: unknown): SimpleModel {
  if (typeof data === 'string') {
    return {
      value: JSON.stringify(data),
      type: 'string',
      className: styles.propString,
    };
  } else if (typeof data === 'number') {
    return {
      value: String(data),
      type: 'number',
      className: styles.propNumber,
    };
  } else if (typeof data === 'bigint') {
    return {
      value: `${data}n`,
      type: 'bigint',
      className: styles.propNumber,
    };
  } else if (data instanceof RegExp) {
    return {
      value: String(data),
      type: 'regexp',
      className: styles.propRegExp,
    };
  } else if (data == null) {
    return {
      value: String(data),
      type: 'undefined',
      className: styles.propEmpty,
    };
  } else if (typeof data === 'boolean') {
    return {
      value: data ? 'true' : 'false',
      type: 'boolean',
      className: styles.propBoolean,
    };
  } else if (data instanceof Error) {
    return {
      value: `Error: ${data.message}`,
      type: 'error',
      className: styles.propError,
    };
  }
  return {
    value: objType(data),
    type: 'class',
    className: styles.propClass,
  };
}

function PropertyValue({ value }: PropertyValueProps): JSX.Element {
  const [expand, setExpand] = useState(false);

  const model = useMemo(() => {
    const val = getSimpleModel(value);
    if (val.value.length > 250) {
      val.shortValue = val.value.substring(0, 200);
    }
    return val;
  }, [value]);

  if (model.shortValue) {
    return (
      <span className={model.className}>
        {!expand ? `${model.shortValue}...` : model.value}{' '}
        <Link
          onClick={(e): void => {
            e.preventDefault();
            setExpand(expand => !expand);
          }}
          href="#read-more"
          className={styles.propEllipsis}
        >
          {!expand ? '(read more)' : '(read less)'}
        </Link>
      </span>
    );
  }

  return <span className={model.className}>{model.value}</span>;
}

export default PropertyValue;
