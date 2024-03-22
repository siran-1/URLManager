// import express framework
var express = require('express');
// new router object
var router = express.Router();


router.get('/', function(req, res, next) {
  //  render function to send an HTML response
  res.render('login', { title: 'preview link' });
});

module.exports = router;
