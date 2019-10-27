import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/jsx-generic-with-comment-in-tag.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
