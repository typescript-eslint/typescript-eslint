import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/modules/invalid-export-named-middle-comma.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
