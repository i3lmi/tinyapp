const findUserByEmail = (email, db) => {
  for (const userId in db) {
    let user = db[userId];
    if (user.email === email) {
      return user;
    }
    return false;
  }
};

function generateRandomString() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const findUserById = (id, db) => {
  for (const userId in db) {
    let user = db[userId];

    if (user.id === id) {
      return user;
    }
  }
  return false;
};

const urlsForUser = (id, db) => {
  let result = {};
  for (const [key, value] of Object.entries(db)) {
    if (value.userID === id) {
      Object.assign(result, { [key]: value });
    }
  }
  return result;
};

const auth = (req, res, next) => {
  if (!req.session.userID) {
    return res.redirect("/login");
  }
  next();
};

module.exports = {
  auth,
  findUserByEmail,
  generateRandomString,
  findUserById,
  urlsForUser,
  generateRandomString,
};
