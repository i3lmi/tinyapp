const { assert } = require("chai");

const { getUserByEmail } = require("../helpers/helpers");

const testUsers = {
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

describe("getUserByEmail", function () {
  it("should return a user object with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUser = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    };
    assert.deepEqual(user, expectedUser);
  });

  it("should return undefined with invalid email", function () {
    const user = getUserByEmail("incorrect@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});