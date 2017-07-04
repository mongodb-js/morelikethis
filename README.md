# morelikethis [![travis][travis_img]][travis_url] [![npm][npm_img]][npm_url]

Create more data that has the same shape as existing data.

To be used with [mongodb-schema][mongodb-schema] to infer a schema from your
original data in a MongoDB collection, and [mgeneratejs][mgeneratejs] to
generate more data.

The `morelikethis` script acts as a bridge between the two, converting a
schema to a data generation template.

#### Example

Install [morelikethis][morelikethis], [mongodb-schema][mongodb-schema],
and [mgeneratejs][mgeneratejs]:

```
npm install -g morelikethis mongodb-schema mgeneratejs
```

Make sure you have a MongoDB instance running on localhost, standard port 27017
(or adjust example below accordingly).

Assuming a database `products` and a collection `catalog`, run:

```
mongodb-schema localhost:27017 products.catalog | morelikethis | mgeneratejs -n 1000
```

This would generate 1000 more documents like the ones in the `products.catalog`
collection and output them to stdout, one per line.

If you have [mongoimport][mongoimport] installed, you can write them to a
new collection `test.mycatalog` right away:


```
mongodb-schema localhost:27017 products.catalog | morelikethis | mgeneratejs -n 1000 | mongoimport -d test -c mycatalog
```

## License

Apache 2.0

[mongoimport]: https://docs.mongodb.com/manual/reference/program/mongoimport/
[mgenerate-mtools]: https://github.com/rueckstiess/mtools/wiki/mgenerate
[mgeneratejs]: https://www.npmjs.com/package/mgeneratejs
[morelikethis]: http://github.com/mongodb-js/morelikethis
[mongodb-schema]: https://www.npmjs.com/package/mongodb-schema
[travis_img]: https://img.shields.io/travis/mongodb-js/morelikethis.svg
[travis_url]: https://travis-ci.org/mongodb-js/morelikethis
[npm_img]: https://img.shields.io/npm/v/morelikethis.svg
[npm_url]: https://npmjs.org/package/morelikethis
