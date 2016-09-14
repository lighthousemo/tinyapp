'use strict';

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
}

exports.insertURL = function(db, longURL, cb) {
  let newURL = {
    shortURL: generateRandomString(),
    longURL: longURL
  }
  db.collection('urls').insertOne(newURL, (err, result) => {
    if (err) {
      return cb(err);
    }
    return cb(null, result);
  });
}

exports.updateURL = function(db, shortURL, longURL, cb) {
  db.collection('urls').updateOne(
    { 'shortURL': shortURL },
    {
      $set: { 'longURL': longURL }
    }, (err, result) => {
      if (err) {
        return cb(err);
      }
      return cb(null, result);
  });
}

exports.deleteURL = function(db, shortURL, cb) {
  db.collection('urls').remove({ 'shortURL': shortURL }, (err, result) => {
    if (err) {
      return cb(err);
    }
    return cb(null, result);
  });
}

exports.getLongURL = function(db, shortURL, cb) {
  let query = { 'shortURL': shortURL };
  db.collection('urls').findOne(query, (err, result) => {
    if (err) {
      return cb(err);
    }
    if (result === null) {
      return cb('not_found', undefined);
    } else {
      return cb(null, result.longURL);
    }
  });
}

exports.getURLs = function(db, cb) {
  db.collection('urls').find().toArray((err, result) => {
    if (err) {
      return cb(err);
    }
    return cb(null, result);
  });
}