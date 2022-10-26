import type { JSXElement } from '../expression/JSXElement/spec';
import type { JSXFragment } from '../expression/JSXFragment/spec';
import type { JSXText } from '../jsx/JSXText/spec';
import type { JSXExpression } from './JSXExpression';

export type JSXChild = JSXElement | JSXExpression | JSXFragment | JSXText;
