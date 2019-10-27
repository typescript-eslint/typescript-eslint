import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/jsx-comment-after-self-closing-jsx.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
