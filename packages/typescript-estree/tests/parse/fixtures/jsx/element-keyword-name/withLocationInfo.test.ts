import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/element-keyword-name.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
