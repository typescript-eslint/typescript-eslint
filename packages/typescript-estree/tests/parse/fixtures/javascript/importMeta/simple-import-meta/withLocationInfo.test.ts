import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/importMeta/simple-import-meta.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
