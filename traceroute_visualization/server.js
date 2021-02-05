//instance of express
var express = require('express')
var app = express()

//ejs templating
app.set('view engine', 'ejs');

//public directory
app.use(express.static('public'));

//html body parser
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true }); // for parsing form data
app.use(urlencodedParser);

//
// ROUTES
//

//Main
app.get('/traceroute', function(req, res) {
	res.render('template');
});


//Catch All Route
app.get("*", function(req, res){
	res.send("Sorry, there's nothing here. Return to <a href='traceroute'>my traceroute site</a>.");
});


app.listen(6868);
console.log("Server is running on port 6868");
