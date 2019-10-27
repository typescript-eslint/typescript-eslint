import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/jsx-with-greather-than.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
