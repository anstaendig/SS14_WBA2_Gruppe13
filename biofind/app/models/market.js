
// load the things we need
var mongoose = require('mongoose');

// define the schema for our product model
var marketSchema = mongoose.Schema({
	name: String,
	address: String,
	open: String
});

// create the model for markets and expose it to our app
module.exports = mongoose.model('Market', marketSchema);