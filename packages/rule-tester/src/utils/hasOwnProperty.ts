// typed so that TS can remove optionality
export const hasOwnProperty = Function.call.bind(Object.hasOwnProperty) as <
  TObj extends object,
  TK extends keyof TObj,
>(
  obj: TObj,
  key: TK,
) => obj is TObj & { [key in TK]-?: TObj[key] };
