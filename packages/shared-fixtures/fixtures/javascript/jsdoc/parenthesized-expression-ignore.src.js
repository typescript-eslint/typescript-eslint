// prettier-ignore
const a = /* string */ (1);
// prettier-ignore
const b = /** string */(a);
// prettier-ignore
const c = /* test */ ( /** string */ ( b ))
// prettier-ignore
const d = /** number */ ( /** string */ ( b ))
// prettier-ignore
const e = /** @return {number} */ ( /** string */ ( b ))
// prettier-ignore
const f = /** @param {number} */ ( /** string */ ( b ))
