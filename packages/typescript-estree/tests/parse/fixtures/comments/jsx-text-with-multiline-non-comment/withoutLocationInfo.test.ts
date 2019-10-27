import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
