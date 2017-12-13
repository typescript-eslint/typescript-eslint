"use strict";

declare namespace FF {
    class Foo extends Bar.Baz {
        far(): any;
    }
}

declare module "FF" {
    class Foo extends Bar.Baz {
        far(): any;
    }
}

declare class Foo extends Bar.Baz {
    far(): any;
}

declare namespace d3 {
    export function select(selector: string): Selection<any>;
}