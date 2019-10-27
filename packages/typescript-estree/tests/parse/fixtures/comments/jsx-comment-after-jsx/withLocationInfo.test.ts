import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/jsx-comment-after-jsx.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
