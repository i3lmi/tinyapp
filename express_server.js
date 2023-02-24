const express = require("express");
const app = express();
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

  app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  });

  app.post("/urls", (req, res) => {
    const longURL = req.body.longURL; 
    const id = generateRandomString(); 
    urlDatabase[id] = longURL; 
    res.redirect(`/urls/${id}`); 
  });

  app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id]; 
    res.redirect(longURL); 
  });
  
  app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect("/urls");
  });

  app.post("/urls/:id", (req, res) => {
    const shortURL = req.params.id;
    const newLongURL = req.body.longURL;
    urlDatabase[shortURL] = newLongURL; 
    res.redirect("/urls");
  });

  app.post("/urls/:id", (req, res) => {
    const id = req.params.id;
    const longURL = req.body.longURL;
    urlDatabase[id] = longURL;
    res.redirect("/urls");
  });
  
  
