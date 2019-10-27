import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/switch-no-default-comment-in-nested-functions.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
