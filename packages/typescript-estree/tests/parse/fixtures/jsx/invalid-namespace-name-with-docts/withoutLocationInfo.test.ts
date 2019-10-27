import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
