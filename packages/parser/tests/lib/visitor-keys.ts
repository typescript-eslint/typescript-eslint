import { AST_NODE_TYPES } from '@typescript-eslint/util';
import { visitorKeys } from '../../src/visitor-keys';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const astTypes = Object.keys(AST_NODE_TYPES);
astTypes.push('TSEmptyBodyFunctionExpression'); // node created by parser.ts

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('visitor-keys', () => {
  for (const type of astTypes) {
    it(`type ${type} should be present in visitor-keys`, () => {
      expect(visitorKeys).toHaveProperty(type);
    });
  }

  it('check if there is no deprecated TS nodes', () => {
    const TSTypes = Object.keys(visitorKeys).filter(type =>
      type.startsWith('TS'),
    );
    expect(astTypes).toEqual(expect.arrayContaining(TSTypes));
  });
});
