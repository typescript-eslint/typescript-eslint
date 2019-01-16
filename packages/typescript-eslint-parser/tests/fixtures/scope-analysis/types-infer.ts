type Unpacked<T> =
    T extends (infer U)[] ? U :
        T extends infer U ? U :
            T extends Promise<infer U> ? U :
                T;
