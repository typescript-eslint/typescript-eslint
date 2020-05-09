interface Foo {
    baa: number;
    bar?: number;
    [bax]: string;
    [baz]?: string;
    [eee: number]: string;
    doo(): void;
    coo?(a, b, c): void;
    [loo]?(a, b, c): void;
    boo<J>(a, b, c): void;
    new (a, b?): string;
    new <F>(a, b?): string;
}

