// import express framework
var express = require('express');
// new router object
var router = express.Router();

router.get('/', function(req, res, next) {
    req.session.destroy(function(err) {
        if (err) {
          console.error("Error destroying session:", err);
          next(err);
        } else {
          // Session destroyed successfully, redirect to homepage or login page
          res.json({ message: "Successfully logged out." }); // Assuming '/login' is your login route
        }
      });
  
});

module.exports = router;