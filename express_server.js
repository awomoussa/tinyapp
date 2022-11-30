const express = require ("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

function generateRandomString() {} //generating a unique short URL (6 random characters) 


app.set("view engine", "ejs");//tells the Express app to use EJS as its templating engine

const urlDatabase = { //used to keep track of all the URLs and their shortened forms
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()) //read documentation 

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
  //??
});

app.get("/", (req, res) => {
  res.send("Hello!");
  
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase , username:req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); 

app.get("/urls/new", (req, res) => {
  // res.render("urls_new");
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]
  const templateVars = {id, longURL, username:req.cookies["username"]}
  res.render("urls_show", templateVars);
  
});

app.get("/u/:id", (req, res) => {
   const longURL = "http://www.lighthouselabs.ca"
  res.redirect(longURL); //redirect to the longURL
  
});

// delete 
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  delete urlDatabase[id]
  //res.redirect("/urls")
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("/urls", templateVars);
});

// edit (never use get for edit)
app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = req.body.longURL
urlDatabase[id] = longURL
  //res.redirect("/urls") 
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("/urls", templateVars);
  
});


app.post("/login", (req, res) => {
  const id = req.params.id
  const username = req.body.username
  res.cookie('username', username)
  res.redirect("/urls") 
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


