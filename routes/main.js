/* When you create a router add this in index.js  file 

var mainRouter = require('./routes/main');
app.use('/main', mainRouter);

*/

var express = require('express');
var router = express.Router();
var dbConn  = require('../config/database');
 
/* First Function Called after application installed */
router.get('/dashboard', function(req, res, next) {      
    dbConn.query('SELECT * FROM shop_info',function(err,rows)     {
        if(err) {
            res.render('dashboard',{data:''});   
        } else {
            res.render('dashboard',{data:rows});
        }
    });
});
/* First Function Called after application installed */

router.post('/update/:id', function(req, res, next) {
    var id = req.params.id;
    var name = req.body.name;
    
    res.render('update', {
        id: req.params.id,
        name: name,
        email: email,
        position:position
    })
});

router.post('/delete/:id', function(req, res, next) {
    var id = req.params.id;
    http_response.redirect('dashboard');
});

module.exports = router;