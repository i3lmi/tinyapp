const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const { response } = require("express");
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));


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

// const users = 
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


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; 
  const id = generateRandomString(); 
  urlDatabase[id] = {
    longURL: longURL,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls/${id}`); 
  
});

// DELETE route for removing a URL resource
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL; // update the longURL property of the URL object
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]; 
  res.redirect(longURL); 
});

// GET /u/:id
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if(!urlDatabase[shortURL]){
    res.send("URL for the given ID does not exist")
  }
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});



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

app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL };
  console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  // Store the shortURL and longURL pair in the database here
  db[shortURL] = longURL;
  res.render('urls_show', { longURL: longURL, shortURL: shortURL });

});


