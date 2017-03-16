// Dependencies:
var express = require("express");
var expresshbs = require("express-handlebars")
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");;

// Initialize Express
var app = express();
var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

function getNews() {
  // Make a request call to grab the HTML body from the site of your choice
  request('http://news.google.com', function (error, response, html) {

  	// Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var result = [];

    // Select each instance of the HTML body that you want to scrape
    // NOTE: Cheerio selectors function similarly to jQuery's selectors, 
    // but be sure to visit the package's npm page to see how it works
    $('span.titletext').each(function(i, element){

      var link = $(element).parent().attr("href");
      var title = $(element).parent().text();

      // Save these results in an object that we'll push into the result array we defined earlier
      result.push({
        title: title,
        link: link
      });
      });
    console.log(result);
  });
}

// Starts up express app
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
  getNews();
});