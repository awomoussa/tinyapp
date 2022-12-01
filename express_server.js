const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {
  const list = "ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvqxyz123456789";
  let output = "";
  for (let i = 0; i <= 6; i++) {
    let random = Math.floor(Math.random() * list.length);
    output += list.charAt(random);
  }
  return output;
} //generating a unique short URL (6 random characters) 


app.set("view engine", "ejs");//tells the Express app to use EJS as its templating engine

const urlDatabase = { //used to keep track of all the URLs and their shortened forms
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()) //read documentation 

//route to post new URLs
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL ;
  res.redirect(`urls/${shortURL}`);
}); 


//routing to homepage
app.get("/", (req, res) => {
  res.redirect("/urls");
});



app.get("/urls", (req, res) => { 
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  // res.render("urls_new");
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]
  const templateVars = { id, longURL, user: users[req.cookies.user_id] }
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
    user: users[req.cookies.user_id],
    // ... any other vars
  };
  res.redirect("/urls");
});

// edit (never use get for edit)
app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = req.body.longURL
  urlDatabase[id] = longURL
  //res.redirect("/urls") 
  const templateVars = {
    user: users[req.cookies.user_id],
    // ... any other vars
  };
  res.redirect("/urls");

});

//login 

app.post("/login", (req, res) => {
  const id = req.params.id
  const username = req.body.username
  res.cookie('username', username)
  res.redirect("/urls")

});

//logout 

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
});

//registration routes

// register page
app.get("/register", (req, res) => {
  res.render("register");
});

// register submit handler
//This endpoint should add a new user object to the global users object. The user object should include the user's id, email and password, similar to the example above
app.post("/register", (req, res) => {
  const id = generateRandomString(); //step 1 
    const password = req.body.password;
  const email = req.body.email;
  users[id] = {
    id: id,
    email: email,
    password: password
  }
  console.log(users)
  res.cookie('user_id', id)
  res.redirect("/urls");

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



