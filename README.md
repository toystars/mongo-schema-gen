# mongo-schema-gen 
[![Build Status](https://travis-ci.org/toystars/mongo-schema-gen.svg?branch=master)](https://travis-ci.org/toystars/mongo-schema-gen) [![npm](https://img.shields.io/mongo-schema-gen/v/npm.svg)](https://www.npmjs.com/package/mongo-schema-gen) [![Downloads](https://img.shields.io/mongo-schema-gen/dt/express.svg)](https://www.npmjs.com/package/mongo-schema-gen) [![Licence](https://img.shields.io/mongo-schema-gen/l/express.svg)](https://www.npmjs.com/package/mongo-schema-gen)

> Simple mongoDB collection schema generator


So you just inherited a codebase that uses MongoDB and the database contains lots of collections with lots of documents saved with no well defined Schema. That is where `mongo-schema-gen` comes in. You can easily query any collection in a MongoDB database for document structure that cuts across all documents in said collection and you get an `assumed Schema` that contains all fields and type of data stored in them.

## Installation

Install with npm

``` bash
$ npm install mongo-schema-gen --save
```

## How to use

```javasript
var schemaGen = require('mongo-schema-gen');
```


Four major APIs are exposed which can be used to query mongoDB for collection schema and other similar info



 - getKeys(collectionName, callBack)

The `getKeys` function returns all keys that has been used as fields in all documents saved in the specified mongoDB collection. The keys are non-repeating.

```javasript

// connect to mongoDB and populate collection with dummy data
schemaGen.connect(mongoUrl, function (db) {

    var User = db.collection('users');
    User.insertOne({
      name: 'Mustapha Babatunde',
      age: 26,
      job: 'Software Engineer',
      dob: new Date
    });
    
    
    schemaGen.getKeys('users', function (keys) {
      console.log(keys.length); // logs 5, '_id' inclusive
      console.log(keys); // logs ['_id', 'name', 'age', 'job', 'dob']
    });
});

```




 - getSchema(collectionName, callBack)

The `getSchema` function returns a possible schema for documents in specified collection. It internally uses `getKeys` and fetches minimal amount of documents to validate keys against. It assumes that all documents store the same data type in all field with the same name. For example: if documentA = { userNumber: 20001 }, assumes that other documents with `userNumber` field also store a `Number` value in it.

```javasript

// connect to mongoDB and populate collection with dummy data
schemaGen.connect(mongoUrl, function (db) {

    var Packages = db.collection('packages');
    Packages.insertMany([{
      name: 'mongo-schema-gen',
      purpose: 'Simple mongoDB collections schema generator',
      stars: 125000,
      forks: 99000,
      createdDate: new Date
    }, {
      name: 'mongo-schema-gen',
      purpose: 'Simple mongoDB collections schema generator',
      forks: 99000,
      contributors: 8727373
    }]);
    
    
    schemaGen.getSchema('packages', function (schema) {
        console.log(schema);
        // would log...
        /*
            {
                _id: { type: 'object' },
                name: { type: 'string' },
                purpose: { type: 'string' },
                stars: { type: 'number' },
                forks: { type: 'number' },
                createdDate: { type: 'date' },
                contributors: { type: 'number' }
            }
        */
    });
});

```




 - keyUsed(collectionName, key, callBack)

The `keyUsed` function returns true if key is in use in any document in specified collection, false otherwise

```javasript

// connect to mongoDB and populate collection with dummy data
schemaGen.connect(mongoUrl, function (db) {

    var User = db.collection('users');
    User.insertOne({
      name: 'Mustapha Babatunde',
      age: 26,
      job: 'Software Engineer',
      dob: new Date
    });
    
    
    schemaGen.keyUsed('users', 'name' function (status) {
      console.log(status); // logs true
    });
});

```




 - stats(collectionName, callBack)

The `stats` function returns stats object of specified collection which include document count, collection size, average document size, capped status, etc... All sizes are in KiloByte.

```javasript

// connect to mongoDB and populate collection with dummy data
schemaGen.connect(mongoUrl, function (db) {

    var Packages = db.collection('packages');
    Packages.insertMany([{
      name: 'mongo-schema-gen',
      purpose: 'Simple mongoDB collections schema generator',
      stars: 125000,
      forks: 99000,
      createdDate: new Date
    }, {
      name: 'mongo-schema-gen',
      purpose: 'Simple mongoDB collections schema generator',
      forks: 99000,
      contributors: 8727373
    }]);
    
    
    schemaGen.stats('packages', function (stat) {
        console.log(stat);
        // would log something like what's below
         /*
         {
            ns: 'mongo-schema-gen.packages',
            count: 2,
            size: 4,
            avgObjSize: 240,
            numExtents: 1,
            storageSize: 80,
            userFlags: 1,
            capped: false,
            indexDetails: {},
            totalIndexSize: 80,
            indexSizes: { _id_: 80 },
            ok: 1 
         }
         */
    });
});

```



## Contributing

Contributions are **welcome** and will be fully **credited**.

We accept contributions via Pull Requests on [Github](https://github.com/toystars/mongo-schema-gen).


### Pull Requests

- **Document any change in behaviour** - Make sure the `README.md` and any other relevant documentation are kept up-to-date.

- **Consider our release cycle** - We try to follow [SemVer v2.0.0](http://semver.org/). Randomly breaking public APIs is not an option.

- **Create feature branches** - Don't ask us to pull from your master branch.

- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.

- **Send coherent history** - Make sure each individual commit in your pull request is meaningful. If you had to make multiple intermediate commits while developing, please [squash them](http://www.git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Changing-Multiple-Commit-Messages) before submitting.


## Issues

Check issues for current issues.

## Credits

- [Mustapha Babatunde](https://twitter.com/iAmToystars)

## License

The MIT License (MIT). Please see [LICENSE](LICENSE) for more information.
