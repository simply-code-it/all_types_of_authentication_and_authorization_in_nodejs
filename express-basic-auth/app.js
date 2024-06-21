const express = require('express');
const basicAuth = require('express-basic-auth');

const app = express();
const port = 3000;

const users = {
    'user1': 'password1',
    'user2': 'password2'
};


app.use(basicAuth({
    users: users,
    challenge: true,
    unauthorizedResponse: 'Unauthorized'
}));

app.get('/', (req, res)=>{
    res.send('Hello, authenticated userr!');
})

app.listen(port, ()=>{
    console.log('server live at: ', port);
})