import semver from 'semver';
import * as parser from '../../src/parser';

jest.mock('semver');

describe('Warn on unsupported TypeScript version', () => {
  afterEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  it('should warn the user if they are using an unsupported TypeScript version', () => {
    (semver.satisfies as jest.Mock).mockReturnValue(false);
    jest.spyOn(console, 'log').mockImplementation();
    parser.parse('');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'WARNING: You are currently running a version of TypeScript which is not officially supported by typescript-estree'
      )
    );
  });
});
