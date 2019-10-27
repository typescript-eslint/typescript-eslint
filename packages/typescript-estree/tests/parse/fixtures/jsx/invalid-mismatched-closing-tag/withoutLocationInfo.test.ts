import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/invalid-mismatched-closing-tag.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
