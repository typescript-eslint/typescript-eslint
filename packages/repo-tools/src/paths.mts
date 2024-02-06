import path from 'node:path';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
export const PACKAGES = path.join(REPO_ROOT, 'packages');

export const PACKAGES_ESLINT_PLUGIN = path.join(PACKAGES, 'eslint-plugin');
export const PACKAGES_SCOPE_MANAGER = path.join(PACKAGES, 'scope-manager');
export const PACKAGES_TYPES = path.join(PACKAGES, 'types');
export const PACKAGES_WEBSITE = path.join(PACKAGES, 'website');
