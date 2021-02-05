//Set up requirements
var express = require("express");
var Request = require('request');
//var Request = require('request');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

//global variables
var stateSearch ;
var senators = [] ;
var reps = [] ;

//regex to check for house of congress
var senateweb = /senate/;
var houseweb = /house/;

//Create an 'express' object
var app = express();

//Set up the views directory
app.set("views", __dirname + '/views');

//Set EJS as templating language WITH html as an extension
// app.engine('.html', require('ejs').__express);
// app.set('view engine', 'html');
//ejs templating
app.set('view engine', 'ejs');

//Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));

// Enable json body parsing of application/json
//app.use(bodyParser.json());
app.use(urlencodedParser); // for parsing application/x-www-form-urlencoded


/*-----
ROUTES
-----*/

//Main Page Route - NO data
app.get("/", function(req, res){
	// var Legisinfo = {
	// 	senate: "Senators!",
	// 	house: "House Representatives!"
	// };

  res.render('statemap.ejs', {"senate":senators,
                              "house":reps});

});

//SAVE the State that the user clicked
app.post("/saveState", function(req,res){
	console.log("A POST!!!!");
	//Get the data from the body
  // console.log(req.body);
  stateSearch = req.body.name;
  // console.log(stateSearch);

  //make request to API
  var requestURL = "https://www.opensecrets.org/api/?method=getLegislators&id=" + stateSearch + "&output=json&apikey=" + keys.apikey ;

  Request(requestURL, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			//console.log(body);
			var theData = JSON.parse(body);
      var list = theData.response.legislator ;
      // sort ...
      senators = [];
      reps = [];
  		for (var i = 0; i < list.length; i++) {
        var newpeople = new Object();
      	newpeople.name = list[i]["@attributes"].firstlast;
      	newpeople.party = list[i]["@attributes"].party;
        newpeople.first_elected = list[i]["@attributes"].first_elected;
        newpeople.comments = list[i]["@attributes"].comments;
        newpeople.cid = list[i]["@attributes"].cid;
        newpeople.web = list[i]["@attributes"].website;
        // push to array based on house or senate website
        if (senateweb.test(list[i]["@attributes"].website)){
          senators.push(newpeople);
        } else if (houseweb.test(list[i]["@attributes"].website)) {
          reps.push(newpeople);
        }
  			// newpeople.push(list[i]["@attributes"]);
  		}
			//console.log("newpeople: " + newpeople);
			console.log('HERE!');
      // console.log(senators);
      // console.log(reps);
      res.send({"senate":senators,
                "house":reps});
      // res.render('statemap.ejs', {"senate":senators,
      //                             "house":reps});
		}
	});
	// res.redirect('/states');
});

//SAVE the TARGET that the user clicked
app.post("/party", function(req,res){
	console.log("party POST!!!!");
	//Get the data from the body
  // console.log(req.body);
  target = req.body.fundid;
  // console.log(target);

  //make request to API
  var requestURL = "http://politicalpartytime.org/api/v1/event/?beneficiaries__crp_id=" + target + "&format=json" ;
  // console.log(requestURL);

  Request(requestURL, function (error, response, body) {
		if (!error && response.statusCode == 200) {
      var theData = JSON.parse(body);
			//congressID = theData.results[0].sponsor_id;
			// console.log(theData.objects);
      // console.log(theData.objects[0].beneficiaries);
			console.log('got party stuff!');

      recentEvents = [];
      if (theData.objects.length > 4) {
        for (var i = 0; i < 5; i++) {
          var events = new Object();
          events.entertainment = theData.objects[i].entertainment;
          events.date = theData.objects[i].start_date;
          events.contributions_info = theData.objects[i].contributions_info;
          events.checks = theData.objects[i].make_checks_payable_to;
          recentEvents.push(events);
        }
      } else {
        for (var i = 0; i < theData.objects.length; i++) {
          var events = new Object();
          events.entertainment = theData.objects[i].entertainment;
          events.date = theData.objects[i].start_date;
          events.contributions_info = theData.objects[i].contributions_info;
          events.checks = theData.objects[i].make_checks_payable_to;
          recentEvents.push(events);
        }
      }

      console.log(recentEvents);
      res.send({"events":recentEvents});
			//send all the data
			//res.json(theData);
  	}
	});
});

//funding page route ??
app.get("/funding", function(req, res){

  res.render('funding.ejs');

});



app.get("/api/state/:id", function(req, res){
	//CORS enable this route - http://enable-cors.org/server.html
	res.header('Access-Control-Allow-Origin', "*");
	var stateID = req.params.id;
	var requestURL = "https://www.opensecrets.org/api/?method=getLegislators&id=" + stateID + "&output=json&apikey=" + keys.apikey ;
	Request(requestURL, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			//console.log(body);
			var theData = JSON.parse(body);
			//congressID = theData.results[0].sponsor_id;
			// console.log(theData);
			console.log('HERE!');
			//send all the data
			res.json(theData);
		}
	});
});


//Catch All Route
app.get("*", function(req, res){
	res.send("Sorry, there's nothing here. Return to <a href='statemap'>Fun(d)raiser map</a>.");
});

//Start the server)
var port = 4004 ;
app.listen(port);
console.log('Express started on port ' + port);
