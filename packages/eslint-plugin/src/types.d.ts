/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line @typescript-eslint/internal/no-typescript-estree-import
import { Node } from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree';

declare module '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree' {
  export interface BaseNode {
    parent: Node;
  }

  export interface Program {
    parent: never;
  }
}
