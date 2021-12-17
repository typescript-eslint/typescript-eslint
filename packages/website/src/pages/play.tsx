import React, { lazy, Suspense } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Loader from '@site/src/components/layout/Loader';

function Play(): JSX.Element {
  return (
    <Layout title="Playground" description="Playground" noFooter={true}>
      <BrowserOnly fallback={<Loader />}>
        {(): JSX.Element => {
          const Playground = lazy(() => import('../components/Playground'));
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
