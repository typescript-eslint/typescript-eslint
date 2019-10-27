import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/surrounding-return-comments.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
