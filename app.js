//Go to Parse-Dashboard/config.json for app crendtions with the dashboard jaunt

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
//var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var mongodb = require("mongodb");
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var mongoose = require('mongoose');

var routes = require('./routes/home');
var test = require('./routes/test');
var terms = require('./routes/terms');
var notifications = require('./routes/notifications');
var invites = require('./routes/invites');
var events = require('./routes/events');
var about = require('./routes/about');
var login = require('./routes/logins');
var messages = require('./routes/messages');
var profiles = require('./routes/profiles');
var myEvents = require ('./routes/myEvents');
var search = require('./routes/search');
var digits = require('./routes/digits');
var iosapp = require('./routes/ios-app');
var user = require('./routes/user');

var app = express();
var api = new ParseServer({
  databaseURI: 'mongodb://heroku_8j0dv6g4:euvg2oa85b1e3tbq7d0g59qfcb@ds163796.mlab.com:63796/heroku_8j0dv6g4',
  appId: 'O9M9IE9aXxHHaKmA21FpQ1SR26EdP2rf4obYxzBF',
  masterKey: 'lykNp62jc700RfU3EOr0WRe8ZCZJ4kiD4ZI4FRaZ', // Keep this key secret!
  fileKey: '20137ff7-4160-41ee-bc18-1c2bf416e433',
  serverURL: 'https://hiikey.herokuapp.com/parse',
  //serverURL: 'http://localhost:5000/parse',
  liveQuery: {
    classNames: ['Chat', 'PublicPost']
  },
  push: {
    ios: [
      {
        pfx:'productionPushCert-aug11-16.p12',
        bundleId: 'com.socialgroupe.hiikey',
        production: true
      },
      {
        pfx:'pushDevCert-Aug11-16.p12',
        bundleId: 'com.socialgroupe.hiikey',
        production: false
      }
    ]
  },
  verifyUserEmails: true,
  emailVerifyTokenValidityDuration: 2 * 60 * 60, // in seconds (2 hours = 7200 seconds)
  preventLoginWithUnverifiedEmail: false, // defaults to false
  publicServerURL: 'https://hiikey.herokuapp.com/parse',
  // Your apps name. This will appear in the subject and body of the emails that are sent.
  appName: 'Hiikey',
  // The email adapter
  emailAdapter: {
    module: 'parse-server-simple-mailgun-adapter',
    options: {
      // The address that your emails come from
      fromAddress: 'noreply@hiikey.com',
      // Your domain from mailgun.com
      domain: 'reset.hiikey.com',
      // Your API key from mailgun.com
      apiKey: 'key-931116e92b651622b653efef865d7a66'
    }
  }
});


var dashboard = new ParseDashboard({
  "apps": [{
    "serverURL": 'https://hiikey.herokuapp.com/parse', // Not localhost
    "appId": 'O9M9IE9aXxHHaKmA21FpQ1SR26EdP2rf4obYxzBF',
    "masterKey": 'lykNp62jc700RfU3EOr0WRe8ZCZJ4kiD4ZI4FRaZ',
    "appName": "Hiikey",
    "production": true,
    "iconName": "logo.png"
  }],
  "users": [
    {
      "user":"d_innovator",
      "pass":"Letscre@tE1!"
    }
  ],
  "iconsFolder": "./public/images",
  "trustProxy": 1

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/test', test);
app.use('/terms', terms);
app.use('/notifications', notifications);
app.use('/parse', api);
app.use('/dashboard', dashboard);
app.use('/invites',invites);
app.use('/events', events);
app.use('/about', about );
app.use('/logins', login);
app.use('/messages', messages);
app.use('/profile', profiles);
app.use('/home', myEvents);
app.use('/search', search);
app.use('/digits', digits);
app.use('/app',iosapp);
app.use('/u', user);

//app.use('/chat', chats);
//scripts

/*app.use(cookieSession({
  name: 'session',
  secret: "xxxxx",
  maxAge: 15724800000
}));*/

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
