// WBA2 - bio find
// TO DO:
// - user registration
// - subscriben 
// - link documents in db
// - asynchron: email + (msg on page)
// - data structure
// (- front-end)

// Load required modules
var express = require('express');
var http = require('http');
var mongo = require('mongoskin');
var faye = require('faye');

// MongoDB
//* Establish conneciton to mongodb
var db = mongo.db('mongodb://localhost/biofind?auto_reconnect=true', {safe: true});
//* Bind collection
db.bind('markets');
db.bind('products');
db.bind('users');
//* Save collection 'planets' as object 'planets'
var markets = db.markets;
var products = db.products;
var users = db.users;

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

// Jade Enginge
//app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');

// Specifiy response for 'GET' on '/markets'
// -> Show all markets

app.get('/markets', function(req, res, next) {
	// Get data from collection 'markets'
	markets.findItems(function(error, result) {
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

// Specify response for 'POST' on '/products'
app.post('/products', function(req, res, next) {
	// Save document to collection 'planets'
	products.insert(req.body, function(error, product) {
		// Error handling
		if(error) next(error);
		// Log name of saved document
		else console.log(req.body.name + ' saved to database!');
	});

	// Publish document to given topic
	var publication = pubClient.publish(req.body.topic, req.body);

	// Promise handler after successful 'publish()'
	publication.then(function() {
		// Respong HTTP status code 200
		res.writeHead(200, 'OK');
		// Log name of published object
		console.log(req.body.name + ' published to ' + req.body.topic + '!');
		res.end();
	// Error handling
	}, function(error) {
		next(error);
	});
});

// TEST<
// Specifiy response for 'GET' on '/planets'
app.get('/products', function(req, res, next) {
	// Get data from database 'planets'
	products.findItems(function(error, result) {
		// Error handling
		if(error) next(error);
		// Transfer JSON file to client
		else {
			// Respond with collection in JSON format
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(result));
			//res.render('planets', {planets: result});
		};
	});
});

// Specify response for 'POST' on '
app.post('/user', function(req, res, next) {
	// Save document to collection 'planets'
	users.insert(req.body, function(error, users) {
		// Error handling
		if(error) next(error);
		// Log name of saved document
		else {
			res.writeHead(200, 'OK');
			console.log(req.body.mail + ' saved to database!');
		};
	});
});

// TEST<
// Specifiy response for 'GET' on '/planets'
app.get('/user', function(req, res, next) {
	// Get data from database 'planets'
	users.findItems(function(error, result) {
		// Error handling
		if(error) next(error);
		// Transfer JSON file to client
		else {
			// Respond with collection in JSON format
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(result));
			//res.render('planets', {planets: result});
		};
	});
});

// Create HTTP Server
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
