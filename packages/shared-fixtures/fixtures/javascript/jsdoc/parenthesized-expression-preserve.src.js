// prettier-ignore
const a = /** @type string */(1);
// prettier-ignore
const b = /** @type string */(a);
// prettier-ignore
const c = /* test */ ( /** @type string */ ( b ))
// prettier-ignore
const d = /** @type number */ ( /** @type string */ ( b ))
