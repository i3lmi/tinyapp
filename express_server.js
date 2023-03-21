const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

const {
  generateRandomString,
  emailExist,
  getUserByEmail,
  hashPassword,
  isEqualToHash,
  userDatabase,
  statusMessage,
  changeStatus,
} = require("./helpers/helpers");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

const urlDatabase = {};
const users = {};
let status = 200;
let isLoggedIn = false;

app.get("/urls", (req, res) => {
  status = res.statusCode;
  if (!isLoggedIn) {
    res.redirect("/login");
  } else {
    const userID = req.session.userID;
    const usersUrl = userDatabase(userID, urlDatabase);
    const email = users[userID].email;
    const templateVars = {
      userID,
      isLoggedIn,
      email,
      urls: usersUrl,
    };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (!isLoggedIn) {
    res.redirect("/login");
  } else {
    let id = generateRandomString();
    const longURL = req.body.longURL;
    const userID = req.session.userID;
    urlDatabase[id] = { longURL, userID };
    res.redirect(`/urls/${id}`);
  }
});

app.get("/", (req, res) => {
  status = res.statusCode;
  if (isLoggedIn) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/urls/new", (req, res) => {
  status = res.statusCode;
  if (!isLoggedIn) {
    res.redirect("/login");
  } else {
    const userID = req.session.userID;
    const email = users[userID].email;
    const templateVars = {
      userID: req.session.userID,
      isLoggedIn,
      email,
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  status = res.statusCode;
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  status = res.statusCode;
  if (isLoggedIn) {
    const userID = req.session.userID;
    const shortURL = req.params.shortURL;
    const urlData = urlDatabase[shortURL];
    if (!urlData) {
      status = changeStatus(res.statusCode, 404);
      res.redirect("/status");
      //checks if logged in user owns the URL
    } else if (urlData.userID === userID) {
      const longURL = urlData.longURL;
      const email = users[userID].email;
      const templateVars = {
        shortURL,
        longURL,
        userID,
        isLoggedIn,
        email,
      };

      res.render("urls_show", templateVars);
    } else {
      status = changeStatus(res.statusCode, 401);
      res.redirect("/status");
    }
  } else {
    res.redirect("/login");
  }
});

// Register Routes

app.get("/register", (req, res) => {
  status = res.statusCode;
  if (isLoggedIn) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      userID: req.session.userID,
      isLoggedIn,
    };
    res.render("urls_registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!(email && password)) {
    status = changeStatus(res.statusCode, 406);
    res.redirect("/status");
  } else if (emailExist(users, email)) {
    status = changeStatus(res.statusCode, 409);
    res.redirect("/status");
  } else {
    const hashedPassword = hashPassword(password);
    users[id] = {
      id,
      email,
      hashedPassword,
    };
    req.session.userID = id;
    isLoggedIn = true;
    res.redirect("/urls");
  }
});

// Login Routes

app.post("/logout", (req, res) => {
  req.session = null;
  isLoggedIn = false;
  res.redirect("/");
});

app.get("/login", (req, res) => {
  status = res.statusCode;
  if (isLoggedIn) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      userID: req.session.userID,
      isLoggedIn,
    };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const currentAccount = getUserByEmail(email, users);
  //checking if email exists or if password don't match
  if (
    !emailExist(users, email) ||
    !isEqualToHash(password, currentAccount.hashedPassword)
  ) {
    status = changeStatus(res.statusCode, 403);
    res.redirect("/status");
  } else {
    req.session.userID = currentAccount.id;
    isLoggedIn = true;
    res.redirect("/urls");
  }
});

app.get("/status", (req, res) => {
  const templateVars = {
    status,
    message: statusMessage(status),
  };
  res.render("errors_page", templateVars);
});

// Delete / Edit Routes

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.userID;
  const urlInfo = urlDatabase[req.params.id];

  if (isLoggedIn) {
    if (urlInfo.userID === userID) {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    } else {
      status = changeStatus(res.statusCode, 401);
      res.redirect("/status");
    }
  } else {
    status = changeStatus(res.statusCode, 401);
    res.redirect("/status");
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  const userID = req.session.userID;
  const urlInfo = urlDatabase[id];

  //check if userID of person is same as userID of URL
  if (urlInfo.userID === userID) {
    urlDatabase[id] = { longURL, userID };
  } else {
    status = changeStatus(res.statusCode, 401);
    res.redirect("/status");
  }
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
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

// Server Connection
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
