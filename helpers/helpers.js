const bcrypt = require("bcrypt");

function getUserByEmail(email, database) {
  for (let id in database) {
    console.log("users[id].email: ", database[id].email);
    if (database[id].email === email) {
      return id;
    }
  }
  return undefined;
}

//generates random string of with 6 characters
function generateRandomString() {
  return (Math.random() + 1).toString(36).substring(7);
}
//checks if email exist in the users
const emailExist = function (users, email) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};
const hashPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

const isEqualToHash = function (password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
};

const database = function (userID, urlDatabase) {
  const newDatabase = {};
  for (let user in urlDatabase) {
    const currentID = urlDatabase[user].userID;
    if (currentID === userID || currentID === "aJ48lW") {
      newDatabase[user] = urlDatabase[user];
    }
  }
  return newDatabase;
};

//returns message according to the error code
const statusMessage = function (status) {
  if (status === 200) {
    return "OK";
  } else if (status === 403) {
    return "Please enter a valid email and password";
  } else if (status === 400) {
    return "The email already exists";
  } else if (status === 401) {
    return "You not authorized user";
  } else if (status === 404) {
    return "DOES NOT EXIST";
  } else if (status === 406) {
    return "Please fill out the fields";
  }
  return "Something Went Wrong";
};

const changeStatus = function (status, code) {
  status = code;
  return status;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  emailExist,
  hashPassword,
  isEqualToHash,
  database,
  statusMessage,
  changeStatus,
};
