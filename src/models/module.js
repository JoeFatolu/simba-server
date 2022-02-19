const aggregatePaginate = require('./aggregate-paginate');

/**
 * @param {Schema} schema
 */
module.exports = function (schema) {
    schema.statics.aggregatePaginate = aggregatePaginate;
};
