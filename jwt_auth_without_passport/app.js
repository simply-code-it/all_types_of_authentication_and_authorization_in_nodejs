const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const secret_key = 'my_secret_key';

app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'db.json');

//Utility fun to read user data from the file
const readUserData = () =>{
    if(!fs.existsSync(dbPath)) {
        return {};
    }
    const data = fs.readFileSync(dbPath);
    return JSON.parse(data);
}

// Utility fun to write user data to the file
const writeUserData = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, secret_key, (err, user)=>{
            if(err) {
                return res.sendStatus(403);
            }
    
            req.user =user;
            next();
        })
    } else {
        res.sendStatus(401);
    }
}

app.post('/register', (req, res)=> {
    const {username, password} = req.body;
    if(!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const users = readUserData();
    if(users[username]) {
        return res.status(400).send('User already exists');
    }

    users[username] = password;
    writeUserData(users);

    res.status(201).send('User registered successfully');
})

app.post('/login', (req, res)=>{
    const {username, password} = req.body;
    if(!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const users = readUserData();

    if(users[username] && users[username] === password) {
        const token = jwt.sign({username: username}, secret_key, {expiresIn: '1h'});

        res.json({token});
    }else {
        res.status(401).send('Invalid credentials');
    }
})

app.get('/protected', authenticateJWT, (req, res)=> {
    res.send('Hello, authenticated User!');
})

app.listen(port, ()=>{
    console.log('server is live a port: ', port);
})