// Dependencies:
var express = require("express");
var expresshbs = require("express-handlebars")
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Requiring our note and article models
var Note = require("./models/note.js");
var Article = require("./models/article.js");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();
var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Make public a static directory
app.use(express.static("public"));

// Database configuration with mongoose
//mongoose.connect("mongodb://localhost/news-scraper");
mongoose.connect("mongodb://heroku_8jdf97hd:b6m93qckqvqrejnbq6k1i0kkqe@ds131900.mlab.com:31900/heroku_8jdf97hd");

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
	console.log("Mongoose connection successful.");
});

// GET request to scrape Bring a Trailer for new articles and store in database
app.get("/scrape", function(req, res) {
	// First, we grab the body of the html with request
	request("http://bringatrailer.com", function (error, response, html) {
		// Load the HTML into cheerio and save it to a variable
		var $ = cheerio.load(html);

		// An empty array to save the data that we'll scrape
		var result = [];

		// Select each instance of the HTML body that you want to scrape
		// NOTE: Cheerio selectors function similarly to jQuery's selectors, 
		// but be sure to visit the package's npm page to see how it works
		$('a.post-title-link').each(function(i, element){
			// Save an empty result object
			var result = {};
			result.title = $(element).text();
			result.link = $(element).attr("href");

			// Using our Article model, create a new entry
			var entry = new Article(result);

			entry.save(function(err, doc) {
				// Log any errors
				if (err) {
					console.log(err);
				}
				// Or log the doc
				else {
					console.log(doc);
				}
			});
		});
		res.send("Scrape Complete");
	});
});

// GET route to pull articles from database
app.get("/articles", function(req, res) {
	Article.find({}, function(error, doc) {
		if (error) {
			res.send(error);
		}
		else {
			res.send(doc);
		}
	})
});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
	Article.findById(req.params.id)
	.populate("note")
	.exec(function(error, doc) {
		if (error) {
			res.send(error);
		}
		else {
			res.send(doc);
		}
	});
});

// POST route to create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
	var newNote = new Note(req.body);
	newNote.save(function(error, doc) {
		if (error) {
			res.send(error);
		}
		else {
			Article.findOneAndUpdate({"_id": req.params.id}, {"note":doc._id })
			.exec(function(err, doc) {
				if (error) {
					console.log(err);
				}
				else {
					res.send(doc);
				}
			});
		}
	});
});

// Starts up express app
app.listen(PORT, function() {
	console.log("App listening on PORT " + PORT);
});