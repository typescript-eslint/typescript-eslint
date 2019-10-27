import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/namespaces-and-modules/declare-namespace-with-exported-function.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
