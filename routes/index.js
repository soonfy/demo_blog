var express = require('express');
var router = express.Router();

var crypto = require('crypto')        //核心模块，加密

var User = require('../models/user')    //user collection
var Post = require('../models/post')    //post collection
var markdown = require('markdown').markdown       //markdown
var moment = require('moment')          //date format

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
  //index
  app.get('/', function (req, res) {
    var page = parseInt(req.query.p)
    if(req.session.user){
      page = page? page: 1
      var name = req.session.user.name,
        posts = []
      Post.count({}, function (err, count) {
        if(err){
          req.flash('error', err)
          res.redirect('/')
        }else{
          Post.find({}, {}, {sort:{createdAt: -1}, limit: 2, skip: (page - 1) * 2}, function (err, result) {
            if(err){
              req.flash('error', err)
              res.redirect('/')
            }else{
              result.forEach(function (post, index) {
                post.pageviewer += 1
                post.save()
              })
            }
          })
          Post.find({}, {}, {sort:{createdAt: -1}, limit: 2, skip: (page - 1) * 2}, function (err, result) {
            // console.log(result);
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
              posts: posts,
              isFirst: (page - 1) === 0,
              isLast: ((page - 1) * 2 + posts.length) >= count,
              page: page
            })
          })
        }
      })
    }else{
      var posts = []
      Post.find({}, {}, {sort:{createdAt: -1}, limit: 2}, function (err, result) {
        if(err){
          req.flash('error', err)
          res.redirect('/')
        }else{
          result.forEach(function (post, index) {
            post.pageviewer += 1
            post.save()
          })
        }
      })
      Post.find({}, {}, {sort:{createdAt: -1}, limit: 2}, function (err, result) {
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
          posts: posts,
          isFirst: true,
          isLast: true,
          page: page
        })
      })
    }
  })

  //register
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
        return res.redirect('/register')
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
            res.redirect('/')
          }else{
            req.session.user = _user
            req.flash('success', 'register success.')
            res.redirect('/')
          }
        })
      }
    })
  })

  //login
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

  //post
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
        date: moment(Date.now()).format('YYYYMMDD'),
        tags: [req.body.tag1, req.body.tag2, req.body.tag3],
        pageviewer: 1
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

  //logout
  app.get('/logout', checkLogin)
  app.get('/logout', function (req, res) {
    req.session.user = null
    req.flash('success', 'logout success.')
    res.redirect('/')
  })

  //upload
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

  //user
  app.get('/u/:name', checkLogin)
  app.get('/u/:name', function (req, res) {
    var name_using = req.session.user.name,
      name_user = req.params.name,
      page = parseInt(req.query.p)
    page = page? page: 1
    Post.count({name: name_user}, function (err, count) {
      if(err){
        req.flash('error', err)
        res.redirect('/')
      }else{
        Post.find({name: name_user}, {}, {sort:{createdAt: -1}, limit: 2, skip: (page - 1) * 2}, function (err, result) {
          if(err){
            req.flash('error', err)
            res.redirect('/')
          }else{
            result.forEach(function (post, index) {
              post.pageviewer += 1
              post.save()
            })
          }
        })
        Post.find({name: name_user}, {}, {sort: {createdAt: -1}, limit: 2, skip: (page - 1) * 2}, function (err, result) {
          if(err){
            req.flash('error', err)
            res.redirect('/')
          }else if(!result){
            req.flash('error', 'article not exits.')
            res.redirect('/')
          }else{
            result.forEach(function (post, index) {
              post.content = markdown.toHTML(post.content)
            })
            posts = result
            res.render('user', {
              title: name_user,
              user: req.session.user,
              success: req.flash('success').toString(),
              error: req.flash('error').toString(),
              posts: posts,
              isFirst: (page - 1) === 0,
              isLast: ((page - 1) * 2 + posts.length) >= count,
              page: page
            })
          }
        })
      }
    })
  })

  //article
  app.get('/u/:name/:date/:title', checkLogin)
  app.get('/u/:name/:date/:title', function (req, res) {
    var name_using = req.session.user.name,
      name_user = req.params.name,
      date_user = req.params.date,
      title_user = req.params.title
    Post.findOne({name: name_user, date: date_user, title: title_user}, {}, function (err, result) {
      if(err){
        req.flash('error', err)
        res.redirect('/')
      }else{
        result.pageviewer += 1
        result.save()
      }
    })
    Post.findOne({name: name_user, date: date_user, title: title_user}, {}, function (err, result) {
      if(err){
        req.flash('error', err)
        res.redirect('/')
      }else if(!result){
        req.flash('error', 'article not exits.')
        res.redirect('/')
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

  //comment
  app.post('/u/:name/:date/:title', checkLogin)
  app.post('/u/:name/:date/:title', function (req, res) {
    console.log(req.body)
    var name_using = req.session.user.name,
      name_user = req.params.name,
      date_user = req.params.date,
      title_user = req.params.title,
      comment_name = req.body.name,
      comment_email = req.body.email,
      comment_website = req.body.website,
      comment_content = req.body.content
      var comment = {
        comment_name: comment_name,
        comment_email: comment_email,
        comment_website: comment_website,
        comment_content: comment_content,
        createdAt: Date.now()
      }
    Post.findOne({name: name_user, date: date_user, title: title_user}, {comments: 1}, function (err, result) {
      // console.log(result)
      if(err){
        req.flash('error', err)
        res.redirect('/')
      }else{
        result.comments.push(comment)
        result.save(function (err) {
          if(err){
            req.flash('error', err)
            res.redirect('/')
          }else{
            req.flash('success', 'comment success.')
            res.redirect('back')
          }
        })
      }
    })
  })

  //edit
  app.get('/edit/:name/:date/:title', checkLogin)
  app.get('/edit/:name/:date/:title', function (req, res) {
    var name_using = req.session.user.name,
      name_user = req.params.name,
      date_user = req.params.date,
      title_user = req.params.title
    Post.findOne({name: name_user, date: date_user, title: title_user}, {}, function (err, result) {
      if(err){
        req.flash('error', err)
        res.redirect('/')
      }else if(!result){
        req.flash('error', 'article not exits.')
        res.redirect('/')
      }else{
        // result.content = markdown.toHTML(result.content)
        post = result
        res.render('edit', {
          title: 'edit',
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString(),
          post: post
        })
      }
    })
  })
  app.post('/edit/:name/:date/:title', checkLogin)
  app.post('/edit/:name/:date/:title', function (req, res) {
    var name_using = req.session.user.name,
      name_user = req.params.name,
      date_user = req.params.date,
      title_user = req.params.title,
      content = req.body.content
      var edit = {
        content: content,
        createdAt: Date.now(),
        date: moment(Date.now()).format('YYYYMMDD')
      }
    Post.findOneAndUpdate({name: name_user, date: date_user, title: title_user}, edit, null, function (err, result) {
      var url = encodeURI('/u/' + name_user + '/' + date_user + '/' + title_user)
      if(err){
        req.flash('error', err)
        res.redirect('/')
      }else{
        req.flash('success', 'edit success.')
        res.redirect(url)
      }
    })
  })

  //remove
  app.get('/remove/:name/:date/:title', checkLogin)
  app.get('/remove/:name/:date/:title', function (req, res) {
    var name_using = req.session.user.name,
      name_user = req.params.name,
      date_user = req.params.date,
      title_user = req.params.title
    Post.findOne({name: name_user, date: date_user, title: title_user}, {}, function (err, result) {
      if(err){
        req.flash('error', err)
        res.redirect('/')
      }else if(!result){
        req.flash('error', 'article not exits.')
        res.redirect('/')
      }else{
        result.remove(function (err) {
          if(err){
            req.flash('error', err)
            res.redirect('/')
          }else{
            req.flash('success', 'remove success')
            res.redirect('/')
          }
        })
      }
    })
  })

  //tag
  app.get('/tags/:tag', checkLogin)
  app.get('/tags/:tag', function (req, res) {
    var tag = req.params.tag,
      page = parseInt(req.query.p)
    page = page? page: 1
    Post.count({tags: {$in: [tag]}}, function (err, count) {
      if(err){
        req.flash('error', err)
        res.redirect('/')
      }else{
        Post.find({tags: {$in: [tag]}}, {}, {sort:{createdAt: -1}, limit: 2, skip: (page - 1) * 2}, function (err, result) {
          if(err){
            req.flash('error', err)
            res.redirect('/')
          }else{
            result.forEach(function (post, index) {
              post.pageviewer += 1
              post.save()
            })
          }
        })
        Post.find({tags: {$in: [tag]}}, {}, {sort: {createdAt: -1}, limit: 2, skip: (page - 1) * 2}, function (err, result) {
          if(err){
            req.flash('error', err)
            res.redirect('/')
          }else if(!result){
            req.flash('error', 'article not exits.')
            res.redirect('/')
          }else{
            result.forEach(function (post, index) {
              post.content = markdown.toHTML(post.content)
            })
            posts = result
            res.render('tag', {
              title: tag,
              user: req.session.user,
              success: req.flash('success').toString(),
              error: req.flash('error').toString(),
              posts: posts,
              isFirst: (page - 1) === 0,
              isLast: ((page - 1) * 2 + posts.length) >= count,
              page: page
            })
          }
        })
      }
    })
  })

  //tag
  app.get('/search', checkLogin)
  app.get('/search', function (req, res) {
    var keyword = req.query.keyword,
      page = parseInt(req.query.p)
    page = page? page: 1
    var pattern = new RegExp(keyword, 'igm')
    Post.count({title: pattern}, function (err, count) {
      if(err){
        req.flash('error', err)
        res.redirect('/')
      }else{
        Post.find({title: pattern}, {}, {sort:{createdAt: -1}, limit: 2, skip: (page - 1) * 2}, function (err, result) {
          if(err){
            req.flash('error', err)
            res.redirect('/')
          }else{
            result.forEach(function (post, index) {
              post.pageviewer += 1
              post.save()
            })
          }
        })
        Post.find({title: pattern}, {}, {sort: {createdAt: -1}, limit: 2, skip: (page - 1) * 2}, function (err, result) {
          if(err){
            req.flash('error', err)
            res.redirect('/')
          }else if(!result){
            req.flash('error', 'article not exits.')
            res.redirect('/')
          }else{
            result.forEach(function (post, index) {
              post.content = markdown.toHTML(post.content)
            })
            posts = result
            res.render('search', {
              title: keyword,
              user: req.session.user,
              success: req.flash('success').toString(),
              error: req.flash('error').toString(),
              posts: posts,
              isFirst: (page - 1) === 0,
              isLast: ((page - 1) * 2 + posts.length) >= count,
              page: page
            })
          }
        })
      }
    })
  })

}
