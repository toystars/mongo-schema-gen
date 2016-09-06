/*!
 * mongo-schema-gen/util
 * Copyright(c) 2016 Mustapha Babatunde Oluwaleke
 * MIT Licensed
 */

'use strict';

/*
 *  Dependencies
 * */
var _ = require('underscore');




// function to return type of value
var getType = function (value) {

  if (value instanceof Date) {
    return 'date';
  } else if (value instanceof Array) {
    var array = [];
    _.each(value, function (element) {
      array.push(getType(element));
    });
    return array;
  } else if (value === null) {
    return 'null';
  } else if (typeof value === 'object') {
    var object = {};
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        var singleValue = value[key];
        object[key] = {
          type: key === '_id' ? 'object' : getType(singleValue)
        };
      }
    }
    return object;
  } else {
    return typeof value;
  }
};


module.exports = {



  /**
   * getSkippedDocs
   * @summary fetch documents with skip size and documents size specified
   * @param {Object} collection - collection to fetch documents from
   * @param {int} skipSize - number of documents to skip
   * @param {int} docSize - size of documents to fetch
   * @param {Function} callBack - callBack to invoke with fetched documents
   */
  getSkippedDocs: function (collection, skipSize, docSize, callBack) {
    var cursor = collection.find().skip(skipSize).limit(docSize);
    cursor.toArray(function (error, items) {
      if (error) {
        throw new Error(error);
      }
      callBack(items);
    });
  },


  /**
   * buildFastSchema
   * @summary build fast schema object from provided document
   * @param {Object} doc - mongoDB document to build schema from
   * @return {Object} schema object built
   */
  buildFastSchema: function (doc) {
    var object = {};
    for (var key in doc) {
      var value = doc[key];
      object[key] = {
        type: key === '_id' ? 'object' : getType(value)
      };
    }
    return object;
  },


  /**
   * schemaComplete
   * @summary checks if all schema keys has been built into generated schema
   * @param {Array} keys - mongoDB collection keys too check against
   * @param {Object} object - possible schema object to check
   * @return {Boolean} status of schema complete check
   */
  schemaComplete: function (keys, object) {
    var status = true;
    for (var x = 0; x < keys.length; x++) {
      var key = keys[x];
      if (!object[key]) {
        status = false;
        break;
      }
    }
    return status;
  }

};
