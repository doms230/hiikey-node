var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongodb = require("mongodb");
var ParseServer = require('parse-server').ParseServer;
var stripe = require("stripe")(
    "sk_test_HSpPMwMkr1Z6Eypr5MMldJ46"
);

var session = require('express-session');

var cookieSession = require('cookie-session');

var passport = require('passport');

stripe.setApiVersion('2016-03-07');
var mongoose = require('mongoose');

var routes = require('./routes/home');
var test = require('./routes/test');
var merchants = require('./routes/merchants');
var payments = require('./routes/payments');
var events = require('./routes/events');
var profile = require('./routes/profile');
var login = require('./routes/login');
var terms = require('./routes/terms');
var paymentsTest = require('./routes/paymentsTest');
var chats = require('./routes/chats');
var app = express();
var api = new ParseServer({
  databaseURI: 'mongodb://hiikey:ihateml@b1!@ds153345-a0.mlab.com:53345,ds153345-a1.mlab.com:53345/heroku_rfhfq2b5?replicaSet=rs-ds153345', // Provide an absolute path
  //appId: 'O9M9IE9aXxHHaKmA21FpQ1SR26EdP2rf4obYxzBF',
  //masterKey: 'lykNp62jc700RfU3EOr0WRe8ZCZJ4kiD4ZI4FRaZ', // Keep this key secret!
  //TODO: remove appId and masterkey below this.. are test keys
  appId: 'pwneJNtOqdAJlPtartF1GbtaOqCL46iyjegNbAyB',
  masterKey: 'LuU3vxON2P947zmrEC5qOBZxrgHzdPtWwYXrZnln',
  fileKey: '20137ff7-4160-41ee-bc18-1c2bf416e433',
  serverURL: 'https://hiikey.herokuapp.com', // Don't forget to change to https if needed
 // serverURL: 'http://localhost:3000/parse',
  liveQuery: {
    classNames: ['Chat', 'PublicPost']
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser("cookei"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: "very secret",
  resave: true,
  saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);
app.use('/test', test);
app.use('/merchants', merchants);
app.use('/payments', payments);
app.use('/events', events);
app.use('/profile', profile);
app.use('/login', login);
app.use('/terms', terms);
app.use('/paymentsTest', paymentsTest);
app.use('/chats', chats);
app.use('/parse', api);

app.use(cookieSession({
  name: "cookei",
  secret: "deez",
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  /*User.findById(id, function (err, user) {
    done(err, user);
  });*/

  done(null, id);
});

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

module.exports = app;
