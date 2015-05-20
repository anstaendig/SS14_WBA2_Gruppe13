// load the things we need
var mongoose = require('mongoose');

// define the schema for our product model
var productSchema = mongoose.Schema({
	name: String,
	price: String,
	category: String,
	market: String
	// marketID: String
}, { collection: carbs });

// create the model for products and expose it to our app
module.exports = mongoose.model('Product', productSchema);
