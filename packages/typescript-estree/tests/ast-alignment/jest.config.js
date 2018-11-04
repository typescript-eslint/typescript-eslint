'use strict';

module.exports = {
  testEnvironment: 'node',
  transform: {
    '.+\\.tsx?$': 'ts-jest'
  },
  testRegex: 'spec\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
