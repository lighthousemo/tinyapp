'use strict';

require('dotenv').config();

const express = require('express');
const app = express();
app.use("/css", express.static(__dirname + '/css'));
app.set('view engine', 'ejs');

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const bodyParser = require("body-parser");
// Extended no longer has default value so must be set
app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = process.env.MONGODB_URI;

const tinyapp = require('./tinyapp');

// Set default port as 8080
const PORT = process.env.PORT || 8080;
// Initiate server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) {
    console.log('Could not connect! Unexpected error. Details below.');
    throw err;
  }

  app.get('/urls/new', (req, res) => {
    let templateVars = { title: 'Create New tinyURL' };
    res.render('urls_new', templateVars);
  });

  app.post('/urls', (req, res) => {
    let longURL = req.body.longURL;
    tinyapp.insertURL(db, longURL, (err, result) => {
      res.redirect('/urls');
    });
  });

  app.get('/', (req, res) => {
    res.redirect('/urls');
  });

  app.get('/urls', (req, res) => {
    tinyapp.getURLs(db, (err, URLs) => {
      let templateVars = {
        title: 'Your tinyURLs',
        urls: URLs
      };
      res.render('urls_index', templateVars);
    });
  });

  app.get('/urls/:id', (req, res) => {
    let shortURL = req.params.id;
    tinyapp.getLongURL(db, shortURL, (err, longURL) => {
      let templateVars = {
        title: `Details for ${shortURL}`,
        shortURL: shortURL,
        longURL: longURL
      };
      res.render('urls_show', templateVars);
    });
  });

  app.put('/urls/:id', (req, res) => {
    let shortURL = req.params.id;
    let longURL = req.body.url;
    tinyapp.updateURL(db, shortURL, longURL, (err, result) => {
      res.redirect('/urls');
    });
  });

  app.delete('/urls/:id', (req, res) => {
    let shortURL = req.params.id;
    tinyapp.deleteURL(db, shortURL, (err,result) => {
      res.redirect('/urls');
    });
  });

  app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    tinyapp.getLongURL(db, shortURL, (err, longURL) => {
      if (err === 'not_found') {
        let templateVars = {
          title: 'Not Found!',
          shortURL: shortURL
        };
        res.status(404).render('not_found', templateVars);
      } else {
        if(longURL.indexOf('http://') === -1) {
          longURL = 'http://' + longURL;
        }
        res.status(301).redirect(longURL);
      }
    });
  });

  app.get('/urls.json', (req, res) => {
    tinyapp.getURLs(db, (err, URLs) => {
      res.json(URLs);
    });
  });
});