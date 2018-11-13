function dec(target: any) {
}
function gec() {
    return (target: any, propertyKey: string) => {}
}

@dec
class C {
    @gec() field: string
    @gec() method(): string {
        return ""
    }
}
