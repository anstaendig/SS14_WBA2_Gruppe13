// WBA2 Week 1
// Modules
var http = require('http');
var querystring = require('querystring');
var url = require('url');

// Planeten in JSON Array
var planeten = [
{ "Name":"Merkur", "Durchmesser":4879, "Entfernung":58 },
{ "Name":"Venus", "Durchmesser":12103, "Entfernung":108 },
{ "Name":"Erde", "Durchmesser":12734, "Entfernung":150 },
{ "Name":"Mars", "Durchmesser":6772, "Entfernung":228 },
{ "Name":"Jupiter", "Durchmesser":138346, "Entfernung":778 },
{ "Name":"Saturn", "Durchmesser":114632, "Entfernung":1433 },
{ "Name":"Uranus", "Durchmesser":50532, "Entfernung":2872 },
{ "Name":"Neptun", "Durchmesser":49105, "Entfernung":4495 }
];

// Create HTTP Server
var server = http.createServer();

server.on('request', function (req, res) {
	// Empty string for body object
	var body = '';

	req.on('data', function(data){
		// Add data to body as string
		body = body + data.toString();
	});

	req.on('end', function() {
		// Parse body string to JS/JSON object
		var daten = querystring.parse(body);
		
		// Check if form is not empty *dirty*
		if (typeof daten.Name == 'string') {
			// Add form data to JSON array
			planeten.push(daten);
		};

		// Save path 
		var pfad = url.parse(req.url).pathname;
		// Check for correct path "/Planeten"
		if (pfad != "/Planeten") {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write('Fehler: Sie befinden sich nicht im korrekten Pfad');
			res.end();
		};

		res.writeHead(200, {'Content-Type': 'text/html'});
		// Create table
		res.write('<table border="1">');
		res.write('<tr><th>Name</th><th>Durchmesser in km</th><th>Abstand zur Sonne in Mio km</th></tr>');
		// forEach loop through planeten JSON Array
		for (var i in planeten) {
			res.write('<tr><td>' + planeten[i].Name + '</td><td>' + planeten[i].Durchmesser + '</td><td>' + planeten[i].Entfernung + '</td></tr>');
		};
		res.write('</table>');
		res.write('<form action="/Planeten" method="post" >');
	  	res.write('Name:<input type="text" name="Name"><br>');
	  	res.write('Durchmesser: <input type="text" name="Durchmesser"><br>');
	  	res.write('Entfernung: <input type="text" name="Entfernung"><br>');
	  	res.write('<input type="submit">');
		res.write('</form>');
		res.end();	
	}); 
});
server.listen(1337);