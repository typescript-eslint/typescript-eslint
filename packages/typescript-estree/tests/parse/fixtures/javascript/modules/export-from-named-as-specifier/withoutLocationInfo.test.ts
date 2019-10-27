import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/export-from-named-as-specifier.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
