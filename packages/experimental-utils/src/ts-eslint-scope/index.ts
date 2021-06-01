import { version as ESLintVersion } from 'eslint-scope';

export * from './analyze';
export * from './Definition';
export * from './Options';
export * from './PatternVisitor';
export * from './Reference';
export * from './Referencer';
export * from './Scope';
export * from './ScopeManager';
export * from './Variable';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const version: string = ESLintVersion;
