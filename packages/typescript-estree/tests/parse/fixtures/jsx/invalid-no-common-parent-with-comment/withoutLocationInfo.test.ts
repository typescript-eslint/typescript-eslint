import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/jsx/invalid-no-common-parent-with-comment.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
