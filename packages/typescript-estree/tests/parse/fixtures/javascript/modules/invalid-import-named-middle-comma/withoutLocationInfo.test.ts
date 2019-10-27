import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/invalid-import-named-middle-comma.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
