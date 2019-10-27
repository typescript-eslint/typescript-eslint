import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/export-var-anonymous-function.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
