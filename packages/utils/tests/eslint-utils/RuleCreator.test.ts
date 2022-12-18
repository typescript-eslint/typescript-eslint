import { ESLintUtils } from '../../src';

describe('RuleCreator', () => {
  const createRule = ESLintUtils.RuleCreator(name => `test/${name}`);

  it('createRule should be a function', () => {
    expect(typeof createRule).toBe('function');
  });

  it('should create rule correctly', () => {
    const rule = createRule({
      name: 'test',
      meta: {
        docs: {
          description: 'some description',
          recommended: 'recommended',
          requiresTypeChecking: true,
        },
        messages: {
          foo: 'some message',
        },
        schema: [],
        type: 'problem',
      },
      defaultOptions: [],
      create() {
        return {};
      },
    });
    expect(rule.meta).toEqual({
      docs: {
        description: 'some description',
        url: 'test/test',
        recommended: 'error',
        requiresTypeChecking: true,
      },
      messages: {
        foo: 'some message',
      },
      schema: [],
      type: 'problem',
    });
  });
});
