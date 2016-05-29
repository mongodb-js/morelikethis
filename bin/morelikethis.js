#!/usr/bin/env node

var morelikethis = require('../');
/* eslint no-sync: 0 */
var es = require('event-stream');
var read = require('fs').readFileSync;
var _ = require('lodash');
// var debug = require('debug')('morelikethis:bin');

var yargs = require('yargs')
  .strict()
  .describe('version', 'Show version.')
  .alias('h', 'help')
  .describe('h', 'Show this screen.')
  .help('h')
  .wrap(100)
  .example('$0 schema.json', 'create more data like described in schema.json');


if (process.stdin.isTTY) {
  // running in TTY mode, get template from non-positional argument
  yargs.usage('Usage: $0 [schema]')
    .demand(1, 'must provide a schema file or string');
} else {
  yargs.usage('Usage: $0 < [schema]');
}

var argv = yargs.argv;
var schema;

function transform() {
  es.readable(function() {
    this.emit('data', morelikethis(schema));
    return this.emit('end');
  }).pipe(es.stringify())
    .pipe(process.stdout);
}

if (process.stdin.isTTY) {
  var str = argv._[0];
  schema = _.startsWith(str, '{') ? JSON.parse(str) : JSON.parse(read(str));
  transform();
} else {
  schema = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('readable', function() {
    var chunk = process.stdin.read();
    if (chunk !== null) {
      schema += chunk;
    }
  });
  process.stdin.on('end', function() {
    schema = JSON.parse(schema);
    transform();
  });
}
