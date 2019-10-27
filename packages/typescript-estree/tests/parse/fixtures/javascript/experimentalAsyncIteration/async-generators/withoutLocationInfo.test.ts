import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/experimentalAsyncIteration/async-generators.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
