var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//study
var mongoose = require('mongoose')            //connect mongodb
var session = require('express-session')
var mongoStore = require('connect-mongo')(session)        //insert session to mongodb
var flash = require('connect-flash')          //store info in session
var multer = require('multer')                //upload pic


/**
 * remove route
 */
// var routes = require('./routes/index');
// var users = require('./routes/users');

/**
 * insert route
 */
var routes = require('./routes/index')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//flash store info
app.use(flash())

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));      //import public path
app.use(express.static(path.join(__dirname, 'node_modules')))   //import node_modules path
app.locals.moment = require('moment')             //import date format

//connect mongodb
var dburl = 'mongodb://localhost/demo_blog'                //no auth
// var dburl = 'mongodb://soonfy:163@localhost:27017/demo_blog'          //auth
mongoose.connect(dburl)
mongoose.set('debug', true)             //mongo debug

//pic upload module, v1.1.0 alter
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/upload')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({storage: storage}).any()
app.use(upload)

//insert session to mongodb
//session config before route config
app.use(session({
  secret: 'blog_user',
  key: 'demo_blog',
  cookie: {maxAge: 1000 * 60 * 60 * 24},
  restore: false,
  saveUninitialized: true,
  store: new mongoStore({
    url: dburl,
    collections: 'sessions'
  })
}))

/**
 * remove
 */
// app.use('/', routes);
// app.use('/users', users);

/**
 * insert
 */
//route config after session config
routes(app)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**
 * Module dependencies.
 */

var debug = require('debug')('demo_blog:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
