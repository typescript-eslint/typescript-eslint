import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/experimentalObjectRestSpread/function-parameter-object-spread.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
