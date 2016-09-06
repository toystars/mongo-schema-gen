/*!
 * mongo-schema-gen
 * Copyright(c) 2016 Mustapha Babatunde Oluwaleke
 * MIT Licensed
 */

'use strict';


/*
 *  Dependencies
 * */
var MongoClient = require('mongodb').MongoClient,
  _ = require('underscore'),
  extend = require('extend'),
  Util = require('./util');


// global variables
var db = null;
var connected = false;




/**
 * getKeys
 * @summary get all keys used in mongoDB as an array of strings
 * @param {String} collectionName - name of collection to get keys from
 * @param {Function} callBack - call back function to call with keys array
 */
var getKeys = function (collectionName, callBack) {
  if (!isConnected()) {
    throw new Error('Not connected to mongoDB!');
  }

  if (!collectionName || typeof collectionName !== 'string') {
    throw new Error('Collection name not defined or is not a string!');
  }

  if (!_.isFunction(callBack)) {
    throw new Error('Second argument must be a function!');
  }

  var returnKeys = [];
  var collection = db.collection(collectionName);
  collection.mapReduce(function () {
    for (var key in this) {
      if (this.hasOwnProperty(key)) {
        emit(key, null);
      }
    }
  }, function (key, stuff) {
    return null;
  }, {
    'out': collectionName + '_keys'
  });

  var keys = db.collection(collectionName + '_keys');
  keys.find({}).toArray(function(err, docs) {
    for (var x = 0; x < docs.length; x++) {
      var doc = docs[x];
      returnKeys.push(doc._id);
    }
    // drop temporary collection
    db.collection(collectionName + '_keys').drop();
    // return keys
    callBack(returnKeys);
  });

};


/**
 * keyUsed
 * @summary check if key is used as field in specified collection
 * @param {String} collectionName - name of collection to check key from
 * @param {String} key - field to check for
 * @param {Function} callBack - function to call with result of check
 */
var keyUsed = function (collectionName, key, callBack) {

  if (!isConnected()) {
    throw new Error('Not connected to mongoDB!');
  }

  if (arguments.length !== 3) {
    throw new Error('Number of arguments must be 3!');
  }

  if (typeof collectionName !== 'string' || typeof key !== 'string') {
    throw new Error('Accepts only string arguments!');
  }

  if (!_.isFunction(callBack)) {
    throw new Error('Third argument must be a function!');
  }

  var collection = db.collection(collectionName);
  var options = {};
  options[key] = {
    $exists: true
  };

  collection.findOne(options, function(error, result) {
    callBack(!!result);
  });
};



/**
 * getSchema
 * @summary determines schema structure of a collection as either an array of objects or an object based on a passed flag
 * @param {String} collectionName - name of collection to check key from
 * @param {Function} callBack - function to call with result schema generation
 */
var getSchema = function (collectionName, callBack) {

  if (!isConnected()) {
    throw new Error('Not connected to mongoDB!');
  }

  if (arguments.length !== 2) {
    throw new Error('Number of arguments must be 2!');
  } else {
    if (typeof collectionName !== 'string') {
      throw new Error('Collection name must be a string');
    }
    if (!_.isFunction(callBack)) {
      throw new Error('Second argument must be a function!');
    }
  }

  // get collection keys first
  getKeys(collectionName, function (keysArray) {

    if (keysArray.length === 0) {
      callBack(keysArray);
    } else {
      // get first ten documents in collection and try building array or object
      var returnObject;
      var skipSize = 0;
      var docSize = 10;
      var collection = db.collection(collectionName);

      var options = {};
      _.each(keysArray, function (key) {
        options[key] = {
          $exists: true
        };
      });

      collection.findOne(options, function(error, result) {
        if (result) {
          callBack(Util.buildFastSchema(result));
        } else {
          var buildSchema = function () {
            Util.getSkippedDocs(collection, skipSize, docSize, function (docs) {
              for (var x = 0; x < docs.length; x++) {
                var doc = docs[x];
                var fastSchema = Util.buildFastSchema(doc);
                returnObject = returnObject ? extend(true, returnObject, fastSchema) : fastSchema;
                if (Util.schemaComplete(keysArray, returnObject)) {
                  break;
                }
              }
              if (Util.schemaComplete(keysArray, returnObject)) {
                callBack(returnObject);
              } else {
                skipSize += 10;
                buildSchema();
              }
            });
          };
          buildSchema();
        }
      });

    }

  });

};



/**
 * connect
 * @summary connect to mongoDB
 * @param {String} mongoUrl - mongoDB url
 * @param {Function} callBack - callBack to run after successful connection
 */
var connect = function (mongoUrl, callBack) {
  MongoClient.connect(mongoUrl, function(error, databaseObject) {
    if (error) {
      console.log("Error connecting to server");
    } else {
      db = databaseObject;
      connected = true;
      console.log("Connected correctly to server");
      callBack(databaseObject);
    }
  });
};


/**
 * getDB
 * @summary get reference to mongoDB connection object
 * @return {Object} mongoDB connection object - null if mongoDB is not connected
 */
var getDB = function () {
  return connected ? db : null;
};


/**
 * isConnected
 * @summary check if connection to mongoDB had been established
 */
var isConnected = function () {
  return connected;
};


/**
 * disconnect
 * @summary disconnect from MongoDB
 */
var disconnect = function () {
  db.close();
  connected = false;
};



module.exports = {
  isConnected: isConnected,
  disconnect: disconnect,
  connect: connect,
  getDB: getDB,
  getKeys: getKeys,
  keyUsed: keyUsed,
  getSchema: getSchema
};

