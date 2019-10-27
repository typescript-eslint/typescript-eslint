import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/jsx-text-with-multiline-non-comment.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
