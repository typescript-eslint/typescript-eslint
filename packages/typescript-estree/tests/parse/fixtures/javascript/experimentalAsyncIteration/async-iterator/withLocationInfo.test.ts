import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/experimentalAsyncIteration/async-iterator.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
