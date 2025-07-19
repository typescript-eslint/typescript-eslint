/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getTSConfigRootDirFromStack } from './../../../../src/getTSConfigRootDirFromStack';

export function get() {
  return getTSConfigRootDirFromStack();
}

export function dirname() {
  return __dirname;
}
