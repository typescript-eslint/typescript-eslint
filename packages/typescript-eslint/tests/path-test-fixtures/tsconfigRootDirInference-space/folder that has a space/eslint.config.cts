/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { getTSConfigRootDirFromV8Api } from '../../../../src/getTSConfigRootDirFromStack';

export function get() {
  return getTSConfigRootDirFromV8Api();
}

export function dirname() {
  return __dirname;
}
