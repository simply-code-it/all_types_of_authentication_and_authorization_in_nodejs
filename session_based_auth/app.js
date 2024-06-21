const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(
  session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if using https
  })
);

// path to db file
const dbPath = path.join(__dirname, "db.json");

//utility function to read user data from the file
const readUserData = () => {
  if (!fs.existsSync(dbPath)) {
    return {};
  }
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
};

//utility function to write user data to the file
const writeUserData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.username) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
};

// route to register a new user
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

// route to login and create a session
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Username and passwrord are required");
  }

  const users = readUserData();
  if (users[username] && users[username] === password) {
    req.session.username = username;

    res.cookie('session_id', req.sessionID, {httpOnly: true});
    res.json({message: 'Login successful', session_id: req.sessionID});
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// route to logout and destroy the session
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out");
    }
    res.send("Logout successful");
  });
});

// protected route
app.get("/protected", isAuthenticated, (req, res) => {
  res.send(`Hello, ${req.session.username}!`);
});

app.listen(port, () => {
  console.log(`Server live at port: ${port}`);
});
