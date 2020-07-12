import semver from 'semver';
import * as parser from '../../src/parser';

jest.mock('semver');

const resetIsTTY = process.stdout.isTTY;

describe('Warn on unsupported TypeScript version', () => {
  afterEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    process.stdout.isTTY = resetIsTTY;
  });

  it('should warn the user if they are using an unsupported TypeScript version', () => {
    (semver.satisfies as jest.Mock).mockReturnValue(false);
    jest.spyOn(console, 'log').mockImplementation();
    process.stdout.isTTY = true;

    parser.parse('');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree',
      ),
    );
  });

  it('should not warn the user when the user is running on a non TTY process', () => {
    (semver.satisfies as jest.Mock).mockReturnValue(false);
    jest.spyOn(console, 'log').mockImplementation();
    process.stdout.isTTY = false;

    parser.parse('');
    expect(console.log).not.toHaveBeenCalled();
  });
});
