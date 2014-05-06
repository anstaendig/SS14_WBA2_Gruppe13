// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash 	 = require('connect-flash');
var faye 	 = require('faye');
var http 	 = require('http');

var configDB = require('./config/database.js');

var server   = http.createServer(app);

// Faye
//* Confifure NoteAdapter
var bayeux = new faye.NodeAdapter({
	mount: '/faye',
	timeout: 45
});
//* Attach NoteAdapter to HTTP server
bayeux.attach(server);

//* Create PubSub-Client
var pubClient = bayeux.getClient();

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms

	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(express.session({ secret: 'wbaissomuchfun' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

	app.use(express.static(__dirname + '/'));

});

// routes ======================================================================
require('./app/routes.js')(app, passport, pubClient); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
/// Create HTTP Server
server.listen(port, function(){
	console.log('Express server listening on port ' + port);
});
