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

const getUserByEmail = function (email, users) {
  let user;
  for (const key in users) {
    if (users[key].email === email) {
      return users[key]
    }
  }
  return null
}

function urlsForUser(id) {
  const filter = {};
  for (const user in urlDatabase) {
    if (urlDatabase[user].userID === id) {
      filter[user] = urlDatabase[user];
    }
  }
  return filter;
};

app.set("view engine", "ejs");//tells the Express app to use EJS as its templating engine

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

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()) //read documentation 

//route to post new URLs
app.post("/urls", (req, res) => {
  let user = req.cookies.user_id
  if (!user) {
    return res.status(400).send("Need to login to create URL!") // where is this message
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
  let userID = req.cookies.user_id
  if (!userID) {
    res.status(400).send("You are not logged in! Please <a href='/login'>Login<a>")
  } else {
    //will filter the url database according to the userID
    // now send the filtered url database to the template vars 
    const filteredDatabase = urlsForUser(userID);
    const templateVars = { urls: filteredDatabase, user: users[req.cookies.user_id] };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let user = req.cookies.user_id
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: users[req.cookies.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"]
  if (!userID) {
    return res.status(400).send("You are not logged in! Please <a href='/login'>Login<a>.")
  }
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL
  const urlUserID = urlDatabase[id].userID
  if (!longURL || urlUserID !== userID) {
    res.status(400).send("Short ID does not exist or you do not own this URL.");
    return
  }


  const templateVars = { id, longURL, user: users[req.cookies.user_id] }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id
  const longURL = urlDatabase[shortURL].longURL
  //happy path 

  if (!longURL) {
    res.status(400).send("Short ID does not exist!");
    return
  }
  res.redirect(longURL); //redirect to the longURL
});

// delete 
app.post("/urls/:id/delete", (req, res) => {
  // const userID = req.cookies["user_id"]
  // // if (!userID) {
  // //   return res.status(400).send("You are not logged in! Please <a href='/login'>Login<a>.")
  // // }
  // const urlUserID = urlDatabase[id].userID
  // if (urlUserID !== userID) {
  //   res.status(400).send("You do not own this URL.");
  //   return
  // }
  const id = req.params.id
  delete urlDatabase[id]
  res.redirect("/urls");
});

// edit (never use get for edit)
app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = req.body.longURL
  urlDatabase[id] = { longURL, userID: req.cookies.user_id }

  res.redirect("/urls");

});

//login get


app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("login", templateVars);
});

//login post 
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (email === "") {
    return res.status(400).send("Email cannot be empty");
  } else if (password === "") {
    return res.status(400).send("Password cannot be empty");
  } else if (!user) {
    return res.status(403).send("Email cannot be found! Please <a href='/register'>Register<a>.")
  }
  else if (user.password !== password) {
    return res.status(403).send("Incorrect Password")
  }

  res.cookie('user_id', user.id)
  res.redirect("/urls");

});

//logout 

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/login");
});

//registration routes

// register page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render("register", templateVars);
});

// register submit handler
//This endpoint should add a new user object to the global users object. The user object should include the user's id, email and password, similar to the example above
app.post("/register", (req, res) => {
  const id = generateRandomString(); //step 1 
  const password = req.body.password;
  const email = req.body.email;

  if (email === "") {
    return res.status(400).send("Email cannot be empty")
  } else if (password === "") {
    return res.status(400).send("Password cannot be empty")
  }
  console.log(getUserByEmail(email, users));
  if (getUserByEmail(email, users) !== null) {
    return res.status(400).send("Email already exists! Please <a href='/register'>Register<a> with new email.")
  }

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



