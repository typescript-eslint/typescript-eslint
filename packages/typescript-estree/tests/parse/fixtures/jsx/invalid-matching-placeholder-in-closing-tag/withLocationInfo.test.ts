import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/invalid-matching-placeholder-in-closing-tag.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
