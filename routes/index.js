var express = require('express');
var router = express.Router();

/**
 * remove
 */
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;

/**
 * insert
 */
module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('index', {title: 'express'})
  })

  //res.send = body
  app.get('/soonfy', function (req, res) {
    res.send('soonfy')
  })
}
