// import express and router
var express = require('express');
var router = express.Router();

// A connection pool to the database and the bcryptjs library for password hashing
var pool = require('../public/javascripts/database/database');
var bcrypt = require('bcryptjs');

// Login Route (POST /): Handles user login
/* It checks if the user exists in the database and verifies the password using bcrypt.
If authentication is successful, the user's username is saved in the session, and they are redirected to the logged-in area. 
Otherwise, they are redirected to an error page.*/

router.post('/', async function (req, res) {
    const { username, password } = req.body;
    try {
        const mysearchquery = 'SELECT username, password FROM URLPreview.users WHERE username = ?';
        const [result] = await pool.query(mysearchquery, [username]);
        if (result.length > 0) {
            const { password: encryptedpassword } = result[0];
            if (await bcrypt.compare(password, encryptedpassword)) {
                req.session.username = username;
                res.redirect('/login/app');
            } else {
                res.redirect('/?error=wrongdetails');
            }
        } else {
            res.redirect('/?error=usernotfound');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/?error=servererror');
    }
});

// Registration Route (POST /new): Manages new user registration.
/* It hashes the new user's password and inserts the new username and hashed password into the database. 
On successful registration, the user's session is initiated, and they are redirected to the logged-in area. */

router.post('/new', async function (req, res) {
    const { newUsername, newPassword } = req.body;
    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const myquery = 'INSERT INTO URLPreview.users (username, password) VALUES (?, ?)';
        const [result] = await pool.query(myquery, [newUsername, hashedPassword]);
        
        if (result.affectedRows > 0) {
            req.session.username = newUsername ;
            res.redirect('/login/app');
        } else {
            res.redirect('/?error=servererror');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/?error=servererror');
    }
});

/* Application Access Route (GET /app): Verifies if a session exists (user is logged in) 
and renders the main application page (index) with the user's username. 
If no session exists, it redirects to the login page. */

router.get('/app', async function (req, res) {
   // res.render('app', { title: 'preview link', username: req.session.username });
    if (req.session && req.session.username) {
        const mysearchquery = 'SELECT category, link, linkimage, linktitle, linkdescription FROM links ORDER BY category, id;';
        const [result] = await pool.query(mysearchquery);
        let groupedByCategory;
        if (result.length > 0) {
            groupedByCategory = result.reduce((acc, curr) => {
                // If the category doesn't exist in the accumulator, add it
                if (!acc[curr.category]) {
                  acc[curr.category] = [];
                }
                // Push the current item to the correct category array
                acc[curr.category].push({
                  link: curr.link,
                  linkimage: curr.linkimage,
                  linktitle: curr.linktitle,
                  linkdescription: curr.linkdescription
                });
                return acc;
              }, {});
        }
        console.log('inside with '+groupedByCategory);
        res.render('app', { title: 'preview link', username: req.session.username, userdata: groupedByCategory});
    } else {
        res.redirect('/');
    }
    
});
module.exports = router;
