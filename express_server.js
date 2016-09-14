'use strict';

const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");
const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = 'mongodb://127.0.0.1:27017/url_shortener';

// Set default port as 8080
const PORT = process.env.PORT || 8080;
const app = express();

app.use(methodOverride('_method'));
// Extended no longer has default value so must be set
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Initiate server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
}

function insertURL(db, longURL, cb) {
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

function updateURL(db, shortURL, longURL, cb) {
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

function deleteURL(db, shortURL, cb) {
  db.collection('urls').remove({ 'shortURL': shortURL }, (err, result) => {
    if (err) {
      return cb(err);
    }
    return cb(null, result);
  });
}

function getLongURL(db, shortURL, cb) {
  let query = { 'shortURL': shortURL };
  db.collection('urls').findOne(query, (err, result) => {
    if (err) {
      return cb(err);
    }
    return cb(null, result.longURL);
  });
}

function getURLs(db, cb) {
  db.collection('urls').find().toArray((err, result) => {
    if (err) {
      return cb(err);
    }
    return cb(null, result);
  });
}

MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) {
    console.log('Could not connect! Unexpected error. Details below.');
    throw err;
  }

  app.get('/urls/new', (req, res) => {
    res.render('urls_new');
  });

  app.post('/urls', (req, res) => {
    let longURL = req.body.longURL;
    insertURL(db, longURL, (err, result) => {
      res.redirect('/urls');
    });
  });

  app.get('/urls', (req, res) => {
    getURLs(db, (err, URLs) => {
      let templateVars = { urls: URLs };
      res.render('urls_index', templateVars);
    });
  });

  app.get('/urls/:id', (req, res) => {
    let shortURL = req.params.id;
    getLongURL(db, shortURL, (err, longURL) => {
      let templateVars = {
        shortURL: shortURL,
        longURL: longURL
      };
      res.render('urls_show', templateVars);
    });
  });

  app.put('/urls/:id', (req, res) => {
    let shortURL = req.params.id;
    let longURL = req.body.url;
    updateURL(db, shortURL, longURL, (err, result) => {
      res.redirect('/urls');
    });
  });

  app.delete('/urls/:id', (req, res) => {
    let shortURL = req.params.id;
    deleteURL(db, shortURL, (err,result) => {
      res.redirect('/urls');
    });
  });

  app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    getLongURL(db, shortURL, (err, longURL) => {
      if (longURL === undefined) {
        let templateVars = { shortURL: shortURL };
        res.status(404).render('not_found', templateVars);
      } else {
        res.status(301).redirect(longURL);
      }
    });
  });

  app.get('/urls.json', (req, res) => {
    res.json(urlDatabase);
  });
});