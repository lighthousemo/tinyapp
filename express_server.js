'use strict';

const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 8080; // set default as 8080
const app = express();

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded());

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.set('view engine', 'ejs');

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:id', (req, res) => {
  let templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

app.put('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.url;
  res.redirect('/urls');
});

app.delete('/urls/:id', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    var templateVars = { shortURL: req.params.shortURL };
    res.status(404).render('not_found', templateVars);
  } else {
    res.status(301).redirect(longURL);
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});