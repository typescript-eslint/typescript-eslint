import BrowserOnly from '@docusaurus/BrowserOnly';
import Loader from '@site/src/components/layout/Loader';
import Layout from '@theme/Layout';
import React, { lazy, Suspense } from 'react';

function Play(): React.JSX.Element {
  return (
    <Layout title="Playground" description="Playground" noFooter={true}>
      <BrowserOnly fallback={<Loader />}>
        {(): React.JSX.Element => {
          const Playground = lazy(
            () =>
              // @ts-expect-error: This does not follow Node resolution
              import('../components/Playground') as Promise<
                () => React.JSX.Element
              >,
          );
          return (
            <Suspense fallback={<Loader />}>
              <Playground />
            </Suspense>
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}

export default Play;
