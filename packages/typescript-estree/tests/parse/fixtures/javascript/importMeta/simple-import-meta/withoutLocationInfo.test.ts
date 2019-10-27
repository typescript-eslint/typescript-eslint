import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
