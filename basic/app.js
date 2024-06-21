const express = require('express');
const app = express();
const port = 3000;

const users = {
    'user1':'password1',
    'user2':'password2'
};

function basicAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if(!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'BASIC realm="Restricted Area"');
        return res.status(401).send('Unauthorized');
    }

    const base64Credentials = authHeader.split(' ')[1];

    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if(users[username] && users[username]===password) {
        return next();
    }else {
        res.setHeader('WWW.Authenticate', 'Basic realm="Restricted Area"');
        return res.status(401).send('Unauthorized');
    }
}


app.use(basicAuth);

app.get('/', (req, res)=>{
    res.send('Hello, authenticated user!');
});

app.listen(port, ()=>{
    console.log('Server is listening at port: ', port);
})