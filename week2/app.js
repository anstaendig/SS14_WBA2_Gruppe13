// WBA2 - Week 2

// Required modules
var http = require('http');
var express = require('express');

// Planets as array of JSON objects
var planets = [
	{ name: 'Merkur', diameter: 4879, distance: 58 },
	{ name: 'Venus', diameter: 12103, distance: 108 },
	{ name: 'Erde', diameter: 12734, distance: 150 },
	{ name: 'Mars', diameter: 6772, distance: 228 },
	{ name: 'Jupiter', diameter: 138346, distance: 778 },
	{ name: 'Saturn', diameter: 114632, distance: 1433 },
	{ name: 'Uranus', diameter: 50532, distance: 2872 },
	{ name: 'Neptun', diameter: 49105, distance: 4495 }
];

// save express into 'app' variable
var app = express();

// use
/// Make '/public' default folder (where index.html is)
app.use(express.static((__dirname + '/public')));
/// Request body parsing supporting JSON
app.use(express.json());
/// Request body parsing supporting urlencoded
app.use(express.urlencoded());

// set
/// Set application port
app.set('port', 3000);

// get
/// Specifiy response for 'get' on '/planets'
app.get('/planets', function(req, res) {
	// Write header with HTML status code and content-type
	res.writeHead(200, {'Content-Type': 'text/html'});
	// Write table
	res.write('<table border="1">');
	res.write('<tr><th>Name</th><th>Diameter in km</th><th>Distance to sun in km * 10^6</th></tr>');
	// Loop through array 'planets'
	planets.forEach(function(planet) {
		res.write('<tr><td>' + planet.name + '</td><td>' + planet.diameter + '</td><td>' + planet.distance + '</td></tr>');
	});
	res.write('</table>');
	// Link to form
	res.write('<a href="/">Back to form</a>');
	// End response
	res.end();
});

// post
/// Specify response for 'post' on '/planets'
app.post('/planets', function(req, res) {
	// Log request.body (content of our form) to console (part of exercise two)
	console.log(req.body);
	// Add request.body to array 'planets'
	planets.push(req.body);
	// Write header with HTML status code (otherwise .done() method in index.html won't work)
	res.writeHead(200);
	// End response
	res.end();
});

// Create HTTP Server
app.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
