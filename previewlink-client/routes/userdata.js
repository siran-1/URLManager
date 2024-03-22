var express = require('express');
var router = express.Router();

var pool = require('../public/javascripts/database/database');

router.get('/', async function(req, res, next) {
    const mysearchquery = 'SELECT category, link, linkimage, linktitle, linkdescription FROM links ORDER BY category, id;';
    const [result] = await pool.query(mysearchquery, [username]);
    if (result.length > 0) {
        console.log(result);
    }
  res.status(200).json('fetched');
});

module.exports = router;
