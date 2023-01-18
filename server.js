const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const saltRounds = 10;

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.listen(80);
console.log('Connected!');

// page routes
app.get('/', (req, res) => res.render('index'));
app.get('/forgot', (req, res) => res.render('forgot'));
app.get('/logged', (req, res) => res.render('logged'));
app.get('/create', (req, res) => res.render('create'));


app.post('/hashing', (req, res) => {
    const {parcel} = req.body;
    console.log(parcel);
    
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(parcel, salt, function(err, hash) {
            
            if (!parcel) {
                return res.status(400).send({status:"failed"})
            }
            res.status(200).send({
                status: "recieved",
                pass: hash
            })

        });
    });
})

app.post('/login', (req, res) => {
    const {parcel} = req.body;
    console.log(parcel);
    
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(parcel, salt, function(err, hash) {
            
            if (!parcel) {
                return res.status(400).send({status:"failed"})
            }
            res.status(200).send({
                status: "recieved",
                pass: hash
            })

        });
    });
})

// page not found
app.use((req, res) => res.status(404).render('404'));



