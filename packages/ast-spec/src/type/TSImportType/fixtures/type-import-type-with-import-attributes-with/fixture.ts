type A = import("A", { with: { type: "json" } });
type TrailingComma = import("B", { with: { type: "json", }, } );
