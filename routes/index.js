var express = require('express');
var router = express.Router();

var crypto = require('crypto')        //核心模块，加密

var User = require('../models/user')    //user collection
var Post = require('../models/post')    //post collection
var markdown = require('markdown').markdown       //markdown
var moment = require('moment')          //date format

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
    var name = req.session.user.name,
      posts = []
    Post.find({name: name}, {}, function (err, result) {
      if(err){
        req.flash('error', err)
        res.redirect('/')
      }else{
        result.forEach(function (post, index) {
          post.content = markdown.toHTML(post.content)
        })
        posts = result
      }
      res.render('index', {
        title: 'homepage',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString(),
        posts: posts
      })
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
    User.findOne({name: name}, {}, function (err, result) {
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
    var user = req.session.user,
      post = new Post({
        name: user.name,
        title: req.body.title,
        content: req.body.content,
        createdAt: Date.now(),
        date: moment(Date.now()).format('YYYYMMDD')
      })
    post.save(function (err) {
      if(err){
        req.flash('error', err)
        res.redirect('/post')
      }else{
        req.flash('success', 'content post success.')
        res.redirect('/')
      }
    })
  })

  app.get('/logout', checkLogin)
  app.get('/logout', function (req, res) {
    req.session.user = null
    req.flash('success', 'logout success.')
    res.redirect('/')
  })

  app.get('/upload', checkLogin)
  app.get('/upload', function (req, res) {
    res.render('upload', {
      title: 'upload file',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  })
  app.post('/upload', checkLogin)
  app.post('/upload', function (req, res) {
    req.flash('success', 'file upload success.')
    res.redirect('/upload')
  })

  app.get('/u/:name', checkLogin)
  app.get('/u/:name', function (req, res) {
    var name_using = req.session.user.name,
      name_user = req.params.name
    console.log(name_user)
    console.log(name_using)
    if(!name_using){
      req.flash('error', 'user not login.')
      res.redirect('/login')
    }
    Post.find({name: name_user}, {}, function (err, result) {
      if(err){
        req.flash('error', err)
        res.redirect('back')
      }else if(!result){
        req.flash('error', 'user not exits.')
        res.redirect('back')
      }else{
        console.log(result)
        result.forEach(function (post, index) {
          post.content = markdown.toHTML(post.content)
        })
        posts = result
        res.render('user', {
          title: name_user,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString(),
          posts: posts
        })
      }
    })
  })

  app.get('/u/:name/:date/:title', checkLogin)
  app.get('/u/:name/:date/:title', function (req, res) {
    var name_using = req.session.user.name,
      name_user = req.params.name,
      date_user = req.params.date,
      title_user = req.params.title
    if(!name_using){
      req.flash('error', 'user not login.')
      res.redirect('/login')
    }
    Post.findOne({name: name_user, date: date_user, title: title_user}, {}, function (err, result) {
      console.log(result);
      if(err){
        req.flash('error', err)
        res.redirect('back')
      }else if(!result){
        req.flash('error', 'user not exits.')
        res.redirect('back')
      }else{
        result.content = markdown.toHTML(result.content)
        post = result
        res.render('article', {
          title: title_user,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString(),
          post: post
        })
      }
    })
  })
}
