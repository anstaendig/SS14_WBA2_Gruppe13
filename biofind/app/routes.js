
var User       		= require('../app/models/user');
var Product       	= require('../app/models/product');
var Market       	= require('../app/models/market');


module.exports = function(app, passport, pubClient) {
	// Home page
	app.get('/', function(req, res) {
		res.render('index.ejs'); 												// render 'views/index.ejs'
	});

	// LOGIN
	// handle '/GET' of login form
	app.get('/login', function(req, res) {
		// render 'views/login.ejs' and possible flash message from passport.js
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// handle 'POST' from login form
	app.post('/login', passport.authenticate('login', {
		failureRedirect : '/login', 											// redirect to 'login' if auth failed
		failureFlash : true 													// allow flash messages
	}), function(req, res) {
		res.redirect('/profile/' + req.user._id);								// redirect to unique resource '/profile/:id'
	});

	// SIGNUP
	// handle '/GET' of signup form
	app.get('/signup', function(req, res) {

		// render 'views/login.ejs' and possible flash message from passport.js
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// handle 'POST' from signup form
	app.post('/signup', passport.authenticate('signup', {
		failureRedirect : '/signup', 											// redirect to 'signup' if signup failed
		failureFlash : true 													// allow flash messages
	}), function(req, res) {
		res.redirect('/profile/' + req.user._id);								// redirect to unique resource '/profile/:id'
	});

	// PROFILE
	// handle '/GET' of resource '/profile/:id'
	// using 'isLoggedIn' as middle ware to make sure user is logged in
	app.get('/profile/:id', isLoggedIn, function(req, res) {
		if(req.params.id == req.user._id) {
			res.render('profile.ejs', {	user: req.user });						// send user data from session to '/views/profile.ejs'
		} else {
			res.redirect('/logout');
		};
	});

	// handle 'POST' from subscription change form
	app.post('/profile/:id', isLoggedIn, function(req, res) {
		req.user.subscriptions = req.body.subscriptions;						// set new user subscriptions
		req.user.save();														// save user to database
		res.redirect('/profile/' + req.user._id);								// redirect to '/profile/:id'
	});

	// LOGOUT
	// handle 'GET' of logout
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');														// redirect to home page
	});

	// ADMIN
	app.get('/admin', function(req, res) {

		// render 'views/products.ejs' and send collection of markets and products
		return Product.find(function(err, products) {
			if(err) throw err;
			markets = Market.find(function(err, markets) {
				if(err) throw err;
				res.render('admin.ejs', { markets: markets, products: products });
			});
		});
	});

	// PRODUCTS
	app.get('/products', isLoggedIn, function(req, res) {

		// render 'views/products.ejs' and send collection of markets and products
		return Product.find(function(err, products) {
			if(err) throw err;
			markets = Market.find(function(err, markets) {
				if(err) throw err;
				res.render('products.ejs', { markets: markets, products: products, user: req.user });
			});
		});
	});

	app.post('/products', function(req, res, done) {
		// create new product based on product.js model and save it to database
		var newProduct = new Product();
		newProduct.name = req.body.name;
		newProduct.price = req.body.price;
		newProduct.category = req.body.category;
		newProduct.market = req.body.market;
		newProduct.save();

		// Publish document
		var publication = pubClient.publish(req.body.category, req.body);

		// Promise handler after successful 'publish()'
		publication.then(function() {
			// Log name of published object
			console.log(req.body.name + ' published to ' + req.body.category);
		});

		var publication2 = pubClient.publish('/products', req.body);
		publication2.then(function() {
			console.log(req.body.name + ' published to /products!');
		});
		res.redirect('/admin');
	});

	app.get('/products/:id', isLoggedIn, function(req, res) {

		// render 'views/product.ejs' and send product object
		return Product.findById(req.params.id, function(err, product) {
			if(!err) {
				console.log(product.name);
				res.render('product.ejs', { product: product, user: req.user });
			};
		});
	});

	app.del('/products/:id', function(req, res) {
		Product.findByIdAndRemove(req.params.id, function(err, product) {
			if(err) throw err;
			console.log(req.body);
			res.send();
		});
	});

	// MARKETS
	app.get('/markets', isLoggedIn, function(req, res) {
		// render 'views/markets.ejs' and send collection of markets
		return Market.find(function(err, markets) {
			if(!err) {
				res.render('markets.ejs', { markets: markets, user: req.user });
			} else throw err;
		});
	});

	app.post('/markets', function(req, res, done) {
		var newMarket = new Market();
		newMarket.name = req.body.name;
		newMarket.address = req.body.address;
		newMarket.open = req.body.open;
		newMarket.save();

		var publication = pubClient.publish('/markets', req.body);
		publication.then(function() {
			console.log(req.body.name + ' published to /markets!');
		});
		res.redirect('/admin');
	});

	app.get('/markets/:id', isLoggedIn, function(req, res) {
		// render 'views/market.ejs' and send market object
		return Market.findById(req.params.id, function(err, market) {
			if(!err) {
				res.render('market.ejs', { market: market, user: req.user });
			};
		});
	});

	app.del('/markets/:id', function(req, res) {
		Market.findByIdAndRemove(req.body.market, function(err, market) {
			if(err) throw err;
			console.log(req.body);
			res.send();
		});
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
