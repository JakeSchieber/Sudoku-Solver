var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("we are doing something");
});

router.get('/test', function(req, res, next) {
    res.send("Woah, OK");
  });

module.exports = router;
