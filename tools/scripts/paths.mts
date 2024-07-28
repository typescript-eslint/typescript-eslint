import path from 'node:path';

import { workspaceRoot } from '@nx/devkit';

export const REPO_ROOT = workspaceRoot;
export const PACKAGES = path.join(REPO_ROOT, 'packages');

export const PACKAGES_ESLINT_PLUGIN = path.join(PACKAGES, 'eslint-plugin');
export const PACKAGES_SCOPE_MANAGER = path.join(PACKAGES, 'scope-manager');
export const PACKAGES_TYPES = path.join(PACKAGES, 'types');
export const PACKAGES_TYPESCRIPT_ESLINT = path.join(
  PACKAGES,
  'typescript-eslint',
);
export const PACKAGES_WEBSITE = path.join(PACKAGES, 'website');
export const PRETTIER_CONFIG_PATH = path.join(REPO_ROOT, '.prettierrc.json');
