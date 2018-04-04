const util = require('util');

/**
 * Error thingy
 * @param {*} e
 * @return {String}
 */
exports.handleError = (e) => {
    if (typeof e === 'string') return e;
    return e.stack ? e.stack : util.inspect(e);
};
