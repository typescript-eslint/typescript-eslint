interface C<T = any> {

}

interface R<T extends C> {
    foo: C
}
