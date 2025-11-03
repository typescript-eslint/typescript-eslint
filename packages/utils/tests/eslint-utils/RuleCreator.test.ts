import { ESLintUtils } from '../../src';

describe(ESLintUtils.RuleCreator, () => {
  interface TestDocs {
    recommended?: 'yes';
  }

  const createRule = ESLintUtils.RuleCreator<TestDocs>(name => `test/${name}`);

  it('createRule should be a function', () => {
    expect(createRule).toBeTypeOf('function');
  });

  it('should create rule correctly', () => {
    const rule = createRule({
      create() {
        return {};
      },
      defaultOptions: [],
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
      name: 'test',
    });
    expect(rule.meta).toEqual({
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

  it('withoutDocs should not add docs url', () => {
    const rule = ESLintUtils.RuleCreator.withoutDocs({
      create() {
        return {};
      },
      defaultOptions: [],
      meta: {
        docs: {
          description: 'some description',
        },
        messages: {
          foo: 'some message',
        },
        schema: [],
        type: 'problem',
      },
    });

    expect(rule.meta.docs).toEqual({
      description: 'some description',
    });
    expect(rule.name).toBe('');
  });
});
