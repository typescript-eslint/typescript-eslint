import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx-useJSXTextNode/self-closing-tag-inside-tag.src.js',
  ),
  {
    useJSXTextNode: true,
  },
);
