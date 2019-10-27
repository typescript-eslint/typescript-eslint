import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
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
