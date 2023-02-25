const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.username = req.cookies.username;
  next();
});

app.set("view engine", "ejs");

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "someUserID1"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "someUserID2"
  }
};

// const users = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur",
//   },
//   user2RandomID: {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk",
//   },
// };


const urlsForUser = (id) => {
  let userUrls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

function getUserById(id, users) {
  for (let user in users) {
    if (users[user].id === id) {
      return users[user];
    }
  }
  return null;
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// app.get('/urls', (req, res) => {
//   const userId = req.cookies.user_id;
//   const user = users[userId];
//   res.render('urls_index', { message: 'Welcome to TinyApp!', user: user });
// });


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; 
  const id = generateRandomString(); 
  urlDatabase[id] = { longURL: longURL, userID: req.cookies.user_id }; // store the userID with the new URL
  res.redirect(`/urls/${id}`); 
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];
  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL; // update the longURL property of the URL object
  res.redirect("/urls");
});

app


app.get('/register', (req, res) => {
 
  // this route will show us the registered page 
  res.render ('register')
})
// POST /register endpoint
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password
  };
  console.log(`New user registered: ${JSON.stringify(users[id])}`);
  res.cookie('user_id', id);
  console.log(`User ID cookie set: ${id}`);
  res.redirect('/urls');
});

