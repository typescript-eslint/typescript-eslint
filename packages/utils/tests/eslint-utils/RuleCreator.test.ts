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
      create() {
        return {};
      },
      defaultOptions: [],
      meta: {
        defaultOptions: [],
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
      name: 'test',
    });
    expect(rule.meta).toEqual({
      defaultOptions: [],
      docs: {
        description: 'some description',
        recommended: 'yes',
        url: 'test/test',
      },
      messages: {
        foo: 'some message',
      },
      schema: [],
      type: 'problem',
    });
  });
});
