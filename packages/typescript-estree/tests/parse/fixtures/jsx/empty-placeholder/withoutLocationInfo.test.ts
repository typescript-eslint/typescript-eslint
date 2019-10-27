import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/empty-placeholder.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
