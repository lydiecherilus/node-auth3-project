const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { secret } = require("../config/secrets");

const Users = require("../users/users-model");

// endpoints with /api/auth

// register a new user
router.post('/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 5);
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});


// log in
router.post("/login", (req, res) => {
  let { username, password } = req.body;
  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user)
        res.status(200).json({
          message: `Welcome ${user.username}`,
          id: user.id,
          authToken: token
        })
      } else {
        res.status(401).json({ message: "Invalid Credentials." })
      }
    })
});


function generateToken(user) {
  const payload = {
    username: user.username
  };
  const options = {
    expiresIn: "8h"
  };
  return jwt.sign(payload, secret, options)
};

module.exports = router;