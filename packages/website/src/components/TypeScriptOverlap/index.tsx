import Admonition from '@theme/Admonition';
import React from 'react';

export default function TypeScriptOverlap({
  strict,
}: {
  strict?: string;
}): React.JSX.Element {
  return (
    <div>
      <Admonition type="danger">
        <p>
          The code problem checked by this ESLint rule is automatically checked
          by the TypeScript compiler. Thus, it is not recommended to turn on
          this rule in new TypeScript projects. You only need to enable this
          rule if you prefer the ESLint error messages over the TypeScript
          compiler error messages.
        </p>
        {strict === undefined ? (
          <></>
        ) : (
          <p>
            (Note that technically, TypeScript will only catch this if you have
            the <code>strict</code> or <code>noImplicitThis</code> flags
            enabled. These are enabled in most TypeScript projects, since they
            are considered to be best practice.)
          </p>
        )}
      </Admonition>
    </div>
  );
}
