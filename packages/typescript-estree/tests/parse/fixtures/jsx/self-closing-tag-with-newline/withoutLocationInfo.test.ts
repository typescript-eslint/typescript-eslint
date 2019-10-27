import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/self-closing-tag-with-newline.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
