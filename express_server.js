const express = require ("express");
const app = express();
const PORT = 8080; // default port 8080
function generateRandomString() {} //generating a unique short URL (6 random characters) 


app.set("view engine", "ejs");//tells the Express app to use EJS as its templating engine

const urlDatabase = { //used to keep track of all the URLs and their shortened forms
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL:  ("b2xVn2", "9sm5xK") /* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
   const longURL = "http://www.lighthouselabs.ca"
  res.redirect(longURL); //redirect to the longURL
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});