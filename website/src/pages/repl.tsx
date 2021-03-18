import React, { lazy, Suspense } from 'react';
import Layout from '@theme/Layout';

let Repl;
/**
 * This is a hack for stuff that are bad in docosaurus
 * https://reactjs.org/docs/error-decoder.html?invariant=294
 */
if (process.env.IS_SERVER !== 'true') {
  const Playground = lazy(() => import('../components/playground'));

  Repl = function () {
    return (
      <Layout title="Playground" description="Playground" noFooter={true}>
        <Suspense fallback="loading">
          <Playground />
        </Suspense>
      </Layout>
    );
  };
} else {
  Repl = function () {
    return (
      <Layout title="Playground" description="Playground" noFooter={true}>
        <div />
      </Layout>
    );
  };
}

export default Repl;
