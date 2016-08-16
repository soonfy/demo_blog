var express = require('express');
var router = express.Router();

var crypto = require('crypto')        //核心模块，加密

var User = require('../models/user')

/**
 * remove
 */
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;

/**
 * insert blog routes
 */

//not login,goto login page
var checkLogin = function (req, res, next) {
  if(!req.session.user){
    req.flash('error', 'user not login.')
    res.redirect('/login')
  }
  next()
}

//login, goto back
var checkNotLogin = function (req, res, next) {
  if(req.session.user){
    req.flash('error', 'user already login.')
    res.redirect('back')
  }
  next()
}

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('index', {
      title: 'homepage',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  })

  app.get('/register', checkNotLogin)
  app.get('/register', function (req, res) {
    res.render('register', {
      title: 'register',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  })
  app.post('/register', checkNotLogin)
  app.post('/register', function (req, res) {
    var name = req.body.name,
      pass = req.body.pass,
      pass_repeat = req.body.pass_repeat,
      email = req.body.email
    if(pass !== pass_repeat){
      req.flash('error', 'pass is not pass_repeat.')
      return res.redirect('/register')
    }
    var md5 = crypto.createHash('md5'),
      password = md5.update(pass).digest('hex')
    User.findOne({name: name}, {name: 1}, function (err, result) {
      if(err){
        req.flash('error', err)
        return res.redirect('/')
      }else if(result !== null){
        req.flash('error', 'the user ' + name + ' exits.')
        return res.redirect('/register')
      }else{
        _user = new User({
          name: name,
          password: password,
          email: email
        })
        _user.save(function (err) {
          if(err){
            req.flash('error', err)
          }else{
            req.session.user = _user
            req.flash('success', 'register success.')
            res.redirect('/')
          }
        })
      }
    })
  })

  app.get('/login', checkNotLogin)
  app.get('/login', function (req, res) {
    res.render('login', {
      title: 'login',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  })
  app.post('/login', checkNotLogin)
  app.post('/login', function (req, res) {
    var name = req.body.name,
      md5 = crypto.createHash('md5'),
      password = md5.update(req.body.pass).digest('hex')
    User.findOne({name: name}, {name: 1, password: 1}, function (err, result) {
      if(err){
        req.flash('error', err)
        return res.redirect('/login')
      }else if(!result){
        req.flash('error', 'user not exits.')
        return res.redirect('/login')
      }else if(result.password !== password){
        req.flash('error', 'password is wrong.')
        return res.redirect('/login')
      }else{
        req.session.user = result
        req.flash('success', 'login success.')
        res.redirect('/')
      }
    })
  })

  app.get('/post', checkLogin)
  app.get('/post', function (req, res) {
    res.render('post', {
      title: 'post',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  })
  app.post('/post', checkLogin)
  app.post('/post', function (req, res) {
    
  })

  app.get('/logout', checkLogin)
  app.get('/logout', function (req, res) {
    req.session.user = null
    req.flash('success', 'logout success.')
    res.redirect('/')
  })
}
