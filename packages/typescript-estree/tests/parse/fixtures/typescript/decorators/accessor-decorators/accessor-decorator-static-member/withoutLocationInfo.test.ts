import path from 'path';
import { testWithoutLocation } from 'test-fixture';

testWithoutLocation(
  path.resolve(
    process.cwd(),
    '..',
    'shared-fixtures',
    'fixtures/typescript/decorators/accessor-decorators/accessor-decorator-static-member.src.ts',
  ),
  {
    useJSXTextNode: false,
  },
);
