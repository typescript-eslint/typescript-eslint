export class ParseError extends Error {
  constructor(
    message: string,
    public fileName: string,
    public index: number,
    public lineNumber: number,
    public column: number,
  ) {
    super(message);
    Object.setPrototypeOf(this, ParseError.prototype);
    Object.defineProperty(this, 'name', {
      value: new.target.name,
      enumerable: false,
      configurable: true,
    });
  }
}
