import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/invalid-namespace-name-with-docts.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
