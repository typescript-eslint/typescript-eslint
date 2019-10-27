import path from 'path';
import { testWithLocation } from 'test-fixture';

testWithLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/javascript/experimentalObjectRestSpread/property-spread.src.js',
  ),
  {
    useJSXTextNode: false,
  },
);
