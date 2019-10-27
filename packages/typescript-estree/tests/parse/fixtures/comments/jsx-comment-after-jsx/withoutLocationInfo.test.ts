import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
