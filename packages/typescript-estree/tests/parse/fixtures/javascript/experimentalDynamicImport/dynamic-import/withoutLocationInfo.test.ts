import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/experimentalDynamicImport/dynamic-import.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
