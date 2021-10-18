import type { Position } from './Position';

export interface SourceLocation {
  /**
   * The position of the first character of the parsed source region
   */
  start: Position;
  /**
   * The position of the first character after the parsed source region
   */
  end: Position;
}
