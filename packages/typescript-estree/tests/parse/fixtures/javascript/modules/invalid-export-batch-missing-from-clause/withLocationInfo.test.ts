import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/invalid-export-batch-missing-from-clause.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
