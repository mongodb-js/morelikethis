var _ = require('lodash');
var eJSON = require('mongodb-extended-json');

// var debug = require('debug')('morelikethis');

var buildGenerationObject;

function chooseFromValues(values) {
  var dist = _.groupBy(values);
  var valueArr = _.keys(dist);
  var weightArr = _.map(dist, function(vals) {
    return vals.length;
  });
  return {'$choose': {from: valueArr, weights: weightArr}};
}

function getTypeGenerator(type) {
  var values = type.values;

  if (type.name === 'ObjectID') {
    // return a random ObjectID
    return '$objectid';
  }
  if (type.name === 'String') {
    // get the distribution of strings and return one of them with the
    // same weight distribution
    return chooseFromValues(values);
  }
  if (type.name === 'Number') {
    // extract min and max value and return a random value drawn from
    // a uniform distribution
    if (_.every(_.map(values, _.isInteger))) {
      return {$number: {min: _.min(values), max: _.max(values) }};
    }
    return {$float: {min: _.min(values), max: _.max(values) }};
  }
  if (type.name === 'Date') {
    // extract min and max date and return a random date drawn from
    // a uniform distribution
    var dates = _(values)
      .map(function(val) {
        return eJSON.deserialize(val);
      })
      .filter(function(val) {
        return _.isDate(val);
      })
      .value();
    return {'$date': {min: _.min(dates).toISOString(), max: _.max(dates).toISOString() }};
  }
  if (type.name === 'Boolean') {
    // return true or false with the same distribution as example values
    return chooseFromValues(values);
  }
  if (type.name === 'Undefined') {
    return '$missing';
  }
  if (type.name === 'Array') {
    var arrayEl;
    if (type.types.length === 1) {
      arrayEl = getTypeGenerator(type.types[0]);
    } else {
      // multiple types, choose one under the given distribution
      arrayEl = {$choose: {
        from: _.map(type.types, getTypeGenerator),
        weights: _.map(type.types, function(t) {
          return Math.floor(t.probability * 100);
        })
      }};
    }
    return {
      '$array': {
        of: arrayEl,
        number: {'$choose': {'from': type.lengths}}
      }
    };
  }
  if (type.name === 'Document') {
    return buildGenerationObject(type);
  }
}

buildGenerationObject = function(schema) {
  var result = {};
  if (schema.fields !== undefined) {
    _.each(schema.fields, function(field) {
      if (field.types.length === 1) {
        result[field.name] = getTypeGenerator(field.types[0]);
      } else {
        // multiple types, choose one under the given distribution
        result[field.name] = {$choose: {
          from: _.map(field.types, getTypeGenerator),
          weights: _.map(field.types, function(t) {
            return Math.floor(t.probability * 100);
          })
        }};
      }
    });
  }
  return result;
};

/**
 *
 * @api public
 *
 * @param {Object} schema   A mongodb-schema javascript object or JSON string
 * @return {Object}         the generator template for mgeneratejs
 */
module.exports = function(schema) {
  schema = _.isPlainObject(schema) ? schema : JSON.parse(schema);
  return buildGenerationObject(schema);
};

module.exports.getTypeGenerator = getTypeGenerator;
