var obj = { value: 1 }
var obj2: typeof obj = { value: 2 }
var { value }: typeof obj = { value: 2 }
var [element]: (typeof obj)[] = [{ value: 2 }]
