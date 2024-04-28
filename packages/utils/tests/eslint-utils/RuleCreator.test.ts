import { ESLintUtils } from '../../src';

describe('RuleCreator', () => {
  interface TestDocs {
    recommended?: 'yes';
  }

  const createRule = ESLintUtils.RuleCreator<TestDocs>(name => `test/${name}`);

  it('createRule should be a function', () => {
    expect(typeof createRule).toBe('function');
  });

  it('should create rule correctly', () => {
    const rule = createRule({
      name: 'test',
      meta: {
        docs: {
          description: 'some description',
          recommended: 'yes',
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
        recommended: 'recommended',
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
