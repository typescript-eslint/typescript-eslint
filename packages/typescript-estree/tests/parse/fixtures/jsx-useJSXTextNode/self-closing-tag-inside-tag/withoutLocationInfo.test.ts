import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
