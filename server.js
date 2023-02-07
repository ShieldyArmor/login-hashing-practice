const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const saltRounds = 10;
const authRoutes = require("./routes/authRoutes")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const app = express();
const nodemailer = require("nodemailer");
require("dotenv").config();

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

var admin = require("firebase-admin");

const serviceAccount = require('./the.json');
const { get } = require('http');
const { create } = require('domain');
const { query } = require('express');

let userLoggedIn = false;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const db = getFirestore();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser())

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

app.listen(80);
console.log('Connected!');

// page routes
// app.get('/', (req, res) => res.render('index'));
// app.get('/forgot', (req, res) => res.render('forgot'));
// app.get('/logged', (req, res) => res.render('logged'));
// app.get('/create', (req, res) => res.render('create'));
app.use(authRoutes)

const createToken = (id, maxAge) => {
    return jwt.sign({ id }, 'n0!Ds[Lfs*2Bs!TsSd', {
        expiresIn: 12*60*60
    })
}

async function mail(userDetails) {
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.appMail, // generated ethereal user
        pass: process.env.appPass, // generated ethereal password
      },
    });

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let result = '';
    for (let i = 0; i < 15; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    console.log(result);
    

    const token = createToken(result, 15*60)
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Konrad Password services" <foo@example.com>', // sender address
      to: userDetails.email, // list of receivers
      subject: "KonradTestSite - Password reset request", // Subject line
      text: `Hello ${userDetails.username}
      <br><br>
      here is your password reset link: http://localhost/reset?email=${userDetails.email}&token=${token}
      `, // plain text body
      html: `<b>Hello ${userDetails.username}</b>
      <br><br>
      here is your password reset link: <a href="http://localhost/reset?email=${userDetails.email}&token=${token}">http://localhost/reset?email=${userDetails.email}</a>
      `, // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }

app.post('/hashing', (req, res) => {
    const {parcel} = req.body;
    console.log(parcel.email);
    console.log(parcel.password);
    
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(parcel.password, salt, function(err, hash) {
            
            if (!parcel) {
                return res.status(400).send({status:"failed"})
            }

            // jwtest = createToken(parcel)
            const token = createToken(parcel.email, 3*24*60*60);
            res.cookie("jwt", token, {httpOnly: true, maxAge: 12*60*60 * 1000})

            res.status(200).send({
                status: "recieved",
                pass: hash,
            })
            console.log(hash);
            console.log(parcel);
            // console.log(jwtest);

        });
    });
})


app.post('/login', (req, res) => {
    const {parcel} = req.body;
    console.log(parcel);
    
            if (!parcel) {
                return res.status(400).send({status:"failed"})
            }

            // jwtest = createToken(parcel)

            
            db.collection("users").where("username", "==", parcel.username).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    const userDetails = doc.data()

                    console.log(userDetails);

                    bcrypt.compare(parcel.password, userDetails.password, function(err, result) {
                        console.log("Does hash match? " + result);
                        userLoggedIn = result


                        if (userLoggedIn == true) {
                        const jwt = createToken(userDetails.username);
                        res.cookie("jwt", jwt, {httpOnly: true, maxAge: 12*60*60 * 1000})
                        res.status(200).send({
                            status: "recieved", userLoggedIn
                        })
                        }
                        else {
                        res.status(400).send({
                            status: "recieved", message: "Wrong user details. "
                        })
                        }
                    });

                });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });

            console.log(userLoggedIn);

            console.log(parcel);

})

app.post('/sendResetPass', async function (req, res) {
    const userRef = db.collection("users");
    const {parcel} = req.body;
    let email = parcel.email
    let userDetails;
    console.log(email);


    let query = await userRef.where("email", "==", email).get();

    if (!query.empty) {
        query.forEach(doc => {
            console.log(doc.data());
            userDetails = doc.data()
            mail(userDetails)
        });
        
        res.status(200).send({
            status: "recieved", message: "Check your mailbox for a password reset link!"
        })
    }
    else {
        console.log('No matching documents.');
        res.status(400).send({
          status: "failed", error: "Cannot find account with this email"
        })
      }  


})

app.post('/resetPass', async function (req, res) {
    const userRef = db.collection("users");
    const {parcel} = req.body;
    let email = parcel.email
    let password = parcel.password
    // let token = parcel.token
    console.log(email);
    // console.log(token);

    jwt.verify(parcel.token, "n0!Ds[Lfs*2Bs!TsSd", (err, decodedToken) => {
        if (err) {
            console.log(err.message);
            res.status(400).send({
                status: "failed",
                error: "Token expired, please start over.",
            })
        }
        else {
            console.log(decodedToken);

            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    console.log("hash1: " + hash);
                    let userId;
                    if (!email) {
                        return res.status(400).send({status:"failed", error: "Invalid E-mail."})
                    }
        
        

                        db.collection("users").where("email", "==", parcel.email).get().then((querySnapshot) => {
                            querySnapshot.forEach((doc) => {
                                // doc.data() is never undefined for query doc snapshots
                                userId = doc.id
                                console.log("hash2: " + hash);

                                console.log(userId);

                                db.collection("users").doc(userId).update({
                                    password: hash
                                });
                            });
                        })
                        .catch((error) => {
                            console.log("Error getting documents: ", error);
                        });

        
                });
            });





            res.status(200).send({
                status: "recieved",
                message: "password has been reset! Refering you back to the home page to log in.",
            })

        }
    })

})
// page not found
app.use((req, res) => res.status(404).render('404'));
