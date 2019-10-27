import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
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
