const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
app.set("view engine", "ejs"); //tells the Express app to use EJS
app.use(bodyParser.urlencoded({ extended: true }));
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers.js");

app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

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

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//route to post new URLs
app.post("/urls", (req, res) => {
  let user = req.session.user_id;
  if (!user) {
    return res.status(400).send("Need to login to create URL!");
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: user };
  res.redirect(`urls/${shortURL}`);
});

//routing to homepage
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let userID = req.session.user_id;
  if (!userID) {
    res.status(400).send("You are not logged in! Please <a href='/login'>Login<a> or <a href='/register'>Register<a>.");
  } else {
    // Will filter the url database according to the userID
    // Now send the filtered url database to the template vars
    const filteredDatabase = urlsForUser(userID, urlDatabase);
    const templateVars = { urls: filteredDatabase, user: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    return res.status(400).send("You are not logged in! Please <a href='/login'>Login<a>.");
  }
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  const urlUserID = urlDatabase[id].userID;
  if (!longURL || urlUserID !== userID) {
    res.status(400).send("Short ID does not exist or you do not own this URL.");
    return;
  }


  const templateVars = { id, longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  //happy path

  if (!longURL) {
    res.status(400).send("Short ID does not exist!");
    return;
  }
  res.redirect(longURL); //redirect to the longURL
});

// delete
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session["user_id"];
  if (!userID) {
    return res.status(400).send("You are not logged in! Please <a href='/login'>Login<a>.");
  }
  if (!urlDatabase[id]) {
    res.status(400).send("URL does not exist.");
  }
  const urlUserID = urlDatabase[id].userID;
  if (urlUserID !== userID) {
    res.status(400).send("You do not own this URL.");
    return;
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});


// edit
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userID = req.session["user_id"];
  if (!userID) {
    return res.status(400).send("You are not logged in! Please <a href='/login'>Login<a>.");
  }
  if (!urlDatabase[id]) {
    res.status(400).send("URL does not exist.");
  }
  const urlUserID = urlDatabase[id].userID;
  if (urlUserID !== userID) {
    res.status(400).send("You do not own this URL.");
    return;
  }
  const longURL = req.body.longURL;
  urlDatabase[id] = { longURL, userID: req.session.user_id };

  res.redirect("/urls");

});


//registration routes

// register page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("register", templateVars);
});

// register submit handler
//This endpoint should add a new user object to the global users object. The user object should include the user's id, email and password, similar to the example above
app.post("/register", (req, res) => {
  const id = generateRandomString(); //step 1
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const email = req.body.email;

  if (email === "") {
    return res.status(400).send("Email cannot be empty");
  } else if (password === "") {
    return res.status(400).send("Password cannot be empty");
  }
  console.log(getUserByEmail(email, users));
  if (getUserByEmail(email, users) !== null) {
    return res.status(400).send("Email already exists! Please <a href='/register'>Register<a> with new email.");
  }

  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
  console.log(users);
  req.session.user_id = id;
  res.redirect("/urls");

});

//login get
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

//login post
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (
    user &&
    user.password &&
    bcrypt.compareSync(password, user.password)
  ) {
    req.session.user_id = user.id;
    res.redirect("/urls");

  } else if (email === "") {
    return res.status(400).send("Email cannot be empty");
  } else if (password === "") {
    return res.status(400).send("Password cannot be empty");
  } else if (!user) {
    return res.status(403).send("Email cannot be found! Please <a href='/register'>Register<a>.");
  } else if (user.password !== password) {
    return res.status(403).send("Incorrect Password.");
  }

});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



