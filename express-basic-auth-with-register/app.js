const express = require('express');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'db.json');

const readUserData = () =>{
    if(!fs.existsSync(dbPath)) {
        return {};
    }

    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
};

const writeUserData = (data) =>{
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

app.post('/register', (req, res)=>{
    const {username, password} = req.body;

    if(!username || !password) {
        return res.status(400).send("username and password are required");
    }

    const users = readUserData();
    if(users[username]) {
        return res.status(400).send('User already exists');
    }

    users[username] = password;

    writeUserData(users);
    res.status(201).send('User registered successfully');
});


app.use(basicAuth({
    authorizer: (username, password) =>{
        const users = readUserData();
        return users[username] && users[username] ===password;
    },
    challenge: true,
    unauthorizedResponse: 'Unauthorized'
}));

app.get('/login', (req, res)=>{
    res.send('Hello, authenticated user!');
})

app.listen(port);