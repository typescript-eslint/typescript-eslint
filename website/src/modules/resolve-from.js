'use strict';
const resolveFrom = (fromDir, moduleId, silent) => {
  return {
    id: 'id',
    filename: 'filename',
    paths: 'test',
  };
};

module.exports = (fromDir, moduleId) => resolveFrom(fromDir, moduleId);
module.exports.silent = (fromDir, moduleId) =>
  resolveFrom(fromDir, moduleId, true);
