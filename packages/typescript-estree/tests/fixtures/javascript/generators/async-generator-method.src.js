class C {
    async * f() {
        const x = yield* g();
    }
}
