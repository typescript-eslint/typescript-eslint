import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/defaultParams/not-all-params.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
