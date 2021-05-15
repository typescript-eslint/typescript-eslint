import type { LineAndColumnData } from './LineAndColumnData';

export interface SourceLocation {
  /**
   * The position of the first character of the parsed source region
   */
  start: LineAndColumnData;
  /**
   * The position of the first character after the parsed source region
   */
  end: LineAndColumnData;
}
