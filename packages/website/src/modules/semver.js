module.exports.satisfies = () => true;
module.exports.major = version => {
  const v = version.match(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-[a-zA-Z\d][-a-zA-Z.\d]*)?(\+[a-zA-Z\d][-a-zA-Z.\d]*)?$/,
  );
  return v && v[1] ? v[1] : null;
};
