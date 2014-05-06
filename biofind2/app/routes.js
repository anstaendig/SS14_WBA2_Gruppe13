var User       		= require('../app/models/user');
var Product       	= require('../app/models/product');
var Market       	= require('../app/models/market');

// app/routes.js
module.exports = function(app, passport, pubClient) {
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	// process the login form
	app.post('/login', passport.authenticate('login', {
		// successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the login page if there is an error
		failureFlash : true // allow flash messages
	}), function(req, res) {
		res.redirect('/profile/' + req.user._id);
	});

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile/:id', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	app.post('/profile/:id', function(req, res) {
		req.user.subscriptions = req.body.subscriptions;
		req.user.save();
		res.redirect('/profile/' + req.user._id);
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	// =====================================
	// ADMIN ===============================
	// =====================================
	// show the login form
	app.get('/admin', function(req, res) {
		return Market.find(function(err, markets) {
			if(!err) {
				res.render('admin.ejs', { markets: markets });
			};
		}); 
	});

	// =====================================
	// PRODUCTS ============================
	// =====================================
	// show the login form
	app.get('/products', function(req, res) {
		return Product.find(function(err, products) {
			if(err) throw err;
			markets = Market.find(function(err, markets) {
				if(err) throw err;
				res.render('products.ejs', { markets: markets, products: products }); 
			});
		});
	});	

	app.get('/products/:id', function(req, res) {

		// render the page
		res.json('admin.ejs'); 
	});	

	app.post('/products', function(req, res, done) {
		console.log(req.body);
		var newProduct = new Product();
		newProduct.name = req.body.name;
		newProduct.price = req.body.price;
		newProduct.category = req.body.category;
		newProduct.market = req.body.market;
		// newProduct.marketID = req.body.marketID;
		newProduct.save();

		// Publish document
		var publication = pubClient.publish(req.body.category, req.body);

		// Promise handler after successful 'publish()'
		publication.then(function() {
			// Log name of published object
			console.log(req.body.name + ' published to ' + req.body.category);
		});
		res.redirect('/admin');
	});	

	// =====================================
	// MARKETS =============================
	// =====================================
	// show the login form
	app.get('/markets', function(req, res) {
		return Market.find(function(err, markets) {
			if(!err) {
				res.render('markets.ejs', { markets: markets });
				// console.log(markets);
			} else throw err;
		});
	});	

	app.get('/markets/:id', function(req, res) {

		// render the page
		res.json('admin.ejs'); 
	});	

	app.post('/markets', function(req, res, done) {
		var newMarket = new Market();
		newMarket.name = req.body.name;
		newMarket.address = req.body.address;
		newMarket.open = req.body.open;
		newMarket.save();
		res.redirect('/admin');
	});	


};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
