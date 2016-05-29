var morelikethis = require('../');
var assert = require('assert');
var prisons = require('./fixtures/prison.json');
var fanclub = require('./fixtures/fanclub.json');

var _ = require('lodash');

var debug = require('debug')('morelikethis:test');

var getTypeGenerator = morelikethis.getTypeGenerator;

describe('morelikethis', function() {
  describe('getTypeGenerator', function() {
    it('should handle strings correctly', function() {
      var strType = prisons.fields[1].types[0];
      var gen = getTypeGenerator(strType);
      assert.ok(_.get(gen, '$choose'));
      assert.ok(_.get(gen.$choose, 'from'));
      assert.ok(_.isArray(gen.$choose.from));
      assert.ok(_.get(gen.$choose, 'weights'));
      assert.ok(_.isArray(gen.$choose.weights));
    });

    it('should handle ObjectIDs correctly', function() {
      var oidType = _.find(prisons.fields, {name: '_id'}).types[0];
      var gen = getTypeGenerator(oidType);
      assert.equal(gen, '$objectid');
    });

    it('should handle numbers correctly', function() {
      var numType = _.find(prisons.fields, {name: 'serialid'}).types[0];
      var gen = getTypeGenerator(numType);
      assert.ok(_.get(gen, '$number'));
      assert.ok(_.isPlainObject(gen.$number));
      assert.deepEqual(_.keys(gen.$number), ['min', 'max']);
    });

    it('should handle dates correctly', function() {
      var dateType = _.find(fanclub.fields, {name: 'last_login'}).types[0];
      var gen = getTypeGenerator(dateType);
      assert.ok(_.get(gen, '$date'));
      assert.ok(_.isPlainObject(gen.$date));
      assert.deepEqual(_.keys(gen.$date), ['min', 'max']);
    });
  });

  describe('mixed types', function() {
    it('should create a $choose object with the right weights', function() {
      var schema = morelikethis(prisons);
      var zips = _.get(schema, 'zip');
      debug(JSON.stringify(zips));
    });
  });
});
