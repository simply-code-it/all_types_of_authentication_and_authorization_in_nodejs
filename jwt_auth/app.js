const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const app = express();
const port = 3000;
const secret_key = "my_secret_key";

app.use(bodyParser.json());

const dbPath = path.join(__dirname, "db.json");

const readUserData = () => {
  if (!fs.existsSync(dbPath)) {
    return {};
  }

  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
};

const writeUserData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret_key,
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    const users = readUserData();

    if (users[jwt_payload.username]) {
      return done(null, jwt_payload);
    } else {
      return done(null, false);
    }
  })
);

app.use(passport.initialize());

//Route to register a new user
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  const users = readUserData();
  if (users[username]) {
    return res.status(400).send("User already exists");
  }

  users[username] = password;
  writeUserData(users);
  res.status(201).send("User registered successfully");
});

//Route to login and generate a jwt token
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and password are required");
  }

  const users = readUserData();

  if (users[username] && users[username] === password) {
    const token = jwt.sign({ username: username }, secret_key, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Protected route
app.get('/protected',  passport.authenticate('jwt', {session: false}), (req, res)=> {
    res.send('Hello, authenticated user!');
});

app.listen(port);
