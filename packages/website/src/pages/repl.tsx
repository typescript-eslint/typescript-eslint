import React, { lazy, Suspense } from 'react';
import Layout from '@theme/Layout';

/**
 * we do not want to load playground for ssr
 */
const Playground = !process.env.IS_SERVER
  ? lazy(() => import('../components/playground'))
  : (): JSX.Element => <div />;

/**
 * This is a hack for stuff that are bad in docusaurus
 * https://reactjs.org/docs/error-decoder.html?invariant=294
 */
const SSRSuspense = !process.env.IS_SERVER
  ? Suspense
  : (props: { children: JSX.Element }): JSX.Element => props.children;

function Repl(): JSX.Element {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Layout title="Playground" description="Playground" noFooter={true}>
      <SSRSuspense fallback="loading">
        <Playground />
      </SSRSuspense>
    </Layout>
  );
}

export default Repl;
