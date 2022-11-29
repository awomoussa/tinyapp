const express = require ("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");//tells the Express app to use EJS as its templating engine

const urlDatabase = { //used to keep track of all the URLs and their shortened forms
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get("/", (req, res) => {
  res.send("Hello!");
  
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); //curl not working 

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL:  ("b2xVn2", "9sm5xK") /* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});