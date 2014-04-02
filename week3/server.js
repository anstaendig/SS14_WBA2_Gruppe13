// WBA2 - Week 3

// Load required modules
var express = require('express');
var http = require('http');
var faye = require('faye');
var mongo = require('mongoskin');


// MongoDB
//* Establish conneciton to mongodb
var db = mongo.db('mongodb://localhost/week3?auto_reconnect=true', {safe: true});
//* Bind collection 'planets'
db.bind('planets');
//* Save collection 'planets' as object 'planets'
var planets = db.planets;


// Servers
//* Create 'express()' object
var app = express();
//* Create server object
var server = http.createServer(app);


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


// Middleware
//* Make '/public' default folder (where index.html is)
app.use(express.static((__dirname + '/public')));
//* Body parsing supporting JSON
app.use(express.json());
//* Body parsing supporting urlencoded
app.use(express.urlencoded());
//* Error handling
app.use(function(error, req, res, next) {
	console.error(error.stack);
	res.end(error.message);
});


// Set application port
app.set('port', 3000);

// Specifiy response for 'GET' on '/planets'
app.get('/planets', function(req, res, next) {
	// Get data from database 'planets'
	planets.findItems(function(error, result) {
		// Error handling
		if(error) next(error);
		// Transfer JSON file to client
		else {
			// Respond with collection in JSON format
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(result));
		};
	});
});


// Specify response for 'POST' on '/planets'
app.post('/planets', function(req, res, next) {
	// Save document to collection 'planets'
	planets.insert(req.body, function(error, planets) {
		// Error handling
		if(error) next(error);
		// Log name of saved document
		else console.log(req.body.name + ' saved to database!');
	});

	// Publish document to '/planets' topic
	var publication = pubClient.publish('/planets', req.body);

	// Promise handler after successful 'publish()'
	publication.then(function() {
		// Respong HTTP status code 200
		res.writeHead(200, 'OK');
		// Log name of published object
		console.log(req.body.name + ' published to "/planets"!');
		res.end();
	// Error handling
	}, function(error) {
		next(error);
	});
});

// Create HTTP Server
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
