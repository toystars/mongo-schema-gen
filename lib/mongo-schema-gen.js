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
  _ = require('underscore');


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

  if (!collectionName) {
    throw new Error('Collection name not defined!');
  }

  var returnKeys = [];
  var User = db.collection(collectionName);
  User.mapReduce(function () {
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
  getKeys: getKeys
};

