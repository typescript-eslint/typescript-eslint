// typed so that TS can remove optionality
export const hasOwnProperty = Function.call.bind(Object.hasOwnProperty) as <
  Obj extends object,
  K extends keyof Obj,
>(
  obj: Obj,
  key: K,
) => obj is Obj & { [key in K]-?: Obj[key] };
