import BrowserOnly from '@docusaurus/BrowserOnly';
import Loader from '@site/src/components/layout/Loader';
import Layout from '@theme/Layout';
import React, { lazy, Suspense } from 'react';

const Playground = lazy(() => import('../components/Playground'));

function Play(): React.JSX.Element {
  return (
    <Layout description="Playground" noFooter={true} title="Playground">
      <BrowserOnly fallback={<Loader />}>
        {(): React.JSX.Element => {
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
