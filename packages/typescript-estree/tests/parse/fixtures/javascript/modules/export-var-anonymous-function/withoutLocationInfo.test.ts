import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
