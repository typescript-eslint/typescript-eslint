import Link from '@docusaurus/Link';
import React, { useMemo, useState } from 'react';

import styles from './ASTViewer.module.css';
import { objType } from './utils';

export interface PropertyValueProps {
  readonly value: unknown;
}

interface SimpleModel {
  readonly value: string;
  readonly className: string;
  readonly shortValue?: string;
}

function getSimpleModel(data: unknown): SimpleModel {
  if (typeof data === 'string') {
    const value = JSON.stringify(data);
    return {
      value,
      className: styles.propString,
      shortValue: value.length > 250 ? value.substring(0, 200) : undefined,
    };
  } else if (typeof data === 'number') {
    return {
      value: String(data),
      className: styles.propNumber,
    };
  } else if (typeof data === 'bigint') {
    return {
      value: `${data}n`,
      className: styles.propNumber,
    };
  } else if (data instanceof RegExp) {
    return {
      value: String(data),
      className: styles.propRegExp,
    };
  } else if (data == null) {
    return {
      value: String(data),
      className: styles.propEmpty,
    };
  } else if (typeof data === 'boolean') {
    return {
      value: data ? 'true' : 'false',
      className: styles.propBoolean,
    };
  } else if (data instanceof Error) {
    return {
      value: `Error: ${data.message}`,
      className: styles.propError,
    };
  }
  return {
    value: objType(data),
    className: styles.propClass,
  };
}

function PropertyValue({ value }: PropertyValueProps): JSX.Element {
  const [expand, setExpand] = useState(false);

  const model = useMemo(() => getSimpleModel(value), [value]);

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
