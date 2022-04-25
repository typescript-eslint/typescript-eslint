import { createTestCases } from './createTestCases';

createTestCases([
  {
    code: [
      'function ignored(%) {}',
      '(function (%) {});',
      'declare function ignored(%);',
      'function ignored({%}) {}',
      'function ignored(...%) {}',
      'function ignored({% = 1}) {}',
      'function ignored({...%}) {}',
      'function ignored([%]) {}',
      'function ignored([% = 1]) {}',
      'function ignored([...%]) {}',
    ],
    options: {
      selector: 'parameter',
    },
  },
]);
