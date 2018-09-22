export abstract class AbstractSocket {
    abstract createSocket(): Promise<string>;
}