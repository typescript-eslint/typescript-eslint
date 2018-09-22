interface Foo {
    bar: string = 'a';
    public a: string;
    private b: string;
    protected c: string;
    static d: string;
    export e: string;
    readonly f: string;

    public [baz: string]: string;
    private [baz: string]: string;
    protected [baz: string]: string;
    static [baz: string]: string;
    export [baz: string]: string;
    readonly [baz: string]: string;

    public g(bar: string): void;
    private h(bar: string): void;
    protected i(bar: string): void;
    static j(bar: string): void;
    export k(bar: string): void;
    readonly l(bar: string): void;
}

