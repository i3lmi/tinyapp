const express = require("express");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080
const {
  findUserByEmail,
  findUserById,
  generateString,
  urlsForUser,
  auth,
  generateRandomString,
} = require("./helpers/helpers");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
  })
);
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
};

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

app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/new", auth, (req, res) => {
  const user = findUserById(req.session.userID, users);
  res.render("urls_new", { user });
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", auth, (req, res) => {
  const user = findUserById(req.session.userID, users);
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  const urlUserID = urlDatabase[shortURL].userID;
  if (userID !== urlUserID) {
    return res.status(401).redirect("/urls");
  }
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL };

  res.render("urls_show", { ...templateVars, user });
});

app.get("/u/:shortURL", auth, (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    if (!longURL.includes("https://")) {
      longURL = "https://" + longURL;
    }

    res.status(302).redirect(longURL);
  } else {
    const errorMessage = "This short URL does not exist.";
    res.status(404).send(errorMessage);
  }
});

app.get("/urls", (req, res) => {
  const user = findUserById(req.session.userID, users);
  const userLinks = urlsForUser(req.session.userID, urlDatabase);
  const templateVars = { urls: userLinks, user };

  res.render("urls_index", user ? templateVars : null);
});

app.post("/urls", (req, res) => {
  const newID = generateRandomString();
  urlDatabase[newID] = {
    longURL: req.body.longURL,
    userID: req.session.userID,
  };
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", auth, (req, res) => {
  const shortURL = req.params.shortURL;
  if (
    req.session.userID &&
    req.session.userID === urlDatabase[shortURL].userID
  ) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else if (req.session.userID) {
    res.redirect(`/urls`);
  }
});


app.post("/urls/:shortURL/update", auth, (req, res) => {
  const shortURL = req.params.shortURL;

  if (
    req.session.userID &&
    req.session.userID === urlDatabase[shortURL].userID
  ) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    const errorMessage = "You are not authorized to do that.";
    res
      .status(401)
      .render("urls_error", { user: users[req.session.userID], errorMessage });
  }
});

app.get("/login", (req, res) => {
  const templateVars = { userId: users[req.session.userID] };

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("Invalid email");
  }
  //compare the password from the client to the user's password.
  if (bcrypt.compareSync(password, user.password)) {
    req.session.userID = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid password");
  }
});

//UserLogout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.get("/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userId: req.session.userID,
  };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  //create user with the hashed password
  const newUser = { id, email, password: hashedPassword };

  if (email === "" || password === "") {
    res
      .status(400)
      .send(
        "Please provide a valid email and password. Both fields must be filled out."
      );
  }
  if (findUserByEmail(email, users)) {
    res.status(400).send("Email has already been registered.");
  }
  users.id = newUser;
  req.session.userID = id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
