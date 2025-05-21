import Link from '@docusaurus/Link';
import React, { useMemo, useState } from 'react';

import styles from './ASTViewer.module.css';
import { objType } from './utils';

export interface PropertyValueProps {
  readonly value: unknown;
}

interface SimpleModel {
  readonly className: string;
  readonly shortValue?: string;
  readonly value: string;
}

function getSimpleModel(data: unknown): SimpleModel {
  if (typeof data === 'string') {
    const value = JSON.stringify(data);
    return {
      className: styles.propString,
      shortValue: value.length > 250 ? value.substring(0, 200) : undefined,
      value,
    };
  }
  if (typeof data === 'number') {
    return {
      className: styles.propNumber,
      value: String(data),
    };
  }
  if (typeof data === 'bigint') {
    return {
      className: styles.propNumber,
      value: `${data}n`,
    };
  }
  if (data instanceof RegExp) {
    return {
      className: styles.propRegExp,
      value: String(data),
    };
  }
  if (data == null) {
    return {
      className: styles.propEmpty,
      value: String(data),
    };
  }
  if (typeof data === 'boolean') {
    return {
      className: styles.propBoolean,
      value: data ? 'true' : 'false',
    };
  }
  if (data instanceof Error) {
    return {
      className: styles.propError,
      value: `Error: ${data.message}`,
    };
  }
  return {
    className: styles.propClass,
    value: objType(data),
  };
}

function PropertyValue({ value }: PropertyValueProps): React.JSX.Element {
  const [expand, setExpand] = useState(false);

  const model = useMemo(() => getSimpleModel(value), [value]);

  if (model.shortValue) {
    return (
      <span className={model.className}>
        {!expand ? `${model.shortValue}...` : model.value}{' '}
        <Link
          className={styles.propEllipsis}
          href="#read-more"
          onClick={(e): void => {
            e.preventDefault();
            setExpand(expand => !expand);
          }}
        >
          {!expand ? '(read more)' : '(read less)'}
        </Link>
      </span>
    );
  }

  return <span className={model.className}>{model.value}</span>;
}

export default PropertyValue;
