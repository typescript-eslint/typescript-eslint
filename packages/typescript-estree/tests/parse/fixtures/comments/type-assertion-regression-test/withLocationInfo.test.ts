import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/comments/type-assertion-regression-test.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
