/**
 * Created by macmini on 4/13/16.
 */
var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('profile',{
        userId: "0IOlbiZ9Tw"

    });
});


module.exports = router;