// SETUP
var express  = require('express');
var app      = express();
var port     = 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash 	 = require('connect-flash');
var faye 	 = require('faye');
var http 	 = require('http');
var server   = http.createServer(app);
var bayeux 	 = new faye.NodeAdapter({
	mount: '/faye',
	timeout: 45
});
var pubClient = bayeux.getClient();

bayeux.attach(server);


// CONFIG
mongoose.connect('mongodb://localhost:27017/biofind'); 								// connect to our database

require('./config/passport')(passport); 											// pass passport for configuration

// set up our express application
app.use(express.logger('dev')); 													// log every request to the console
app.use(express.cookieParser()); 													// read cookies (needed for auth)
app.use(express.bodyParser()); 														// get information from html forms

app.set('view engine', 'ejs'); 														// set EJS as templating engine

// required for passport
app.use(express.session({ secret: 'wbaissomuchfun' })); 							// session secret
app.use(passport.initialize());
app.use(passport.session()); 														// persistent login sessions
app.use(flash()); 																	// use connect-flash for flash messages stored in session
app.use(express.methodOverride());													// access to DELETE verb


// ROUTES
// load our routes and pass in our app and fully configured passport and faye publish client
require('./app/routes.js')(app, passport, pubClient); 								

/// Create HTTP Server
server.listen(port, function(){
	console.log('Express server listening on port ' + port);
});
