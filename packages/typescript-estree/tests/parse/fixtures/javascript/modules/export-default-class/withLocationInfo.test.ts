import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/export-default-class.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
