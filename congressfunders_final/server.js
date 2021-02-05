//Set up requirements
var express = require("express");
var Request = require('request');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

//database
var mongojs = require('mongojs');
var cdb = mongojs("jasmine:jasmine123!@ds137882.mlab.com:37882/congress", ["congress"]);
var pdb = mongojs("jasmine:jasmine123!@ds139262.mlab.com:39262/party1", ["party1"]);
var fdb = mongojs("jasmine:jasmine123!@ds139362.mlab.com:39362/funders", ["funders"]);

//global variables
var stateSearch ; //set default
var senators = [] ;
var reps = [] ;
var allFunds = [];


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

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var session = require('express-session');
var nedbstore = require('nedb-session-store')(session);

var Datastore = require('nedb');
var sdb = new Datastore({filename: "sessions.db"});

const uuidV1 = require('uuid/v1');
app.use(
	session(
		{
			secret: 'secret',
			cookie: {
				 maxAge: 365 * 24 * 60 * 60 * 1000   // e.g. 1 year
				},
			store: new nedbstore({
			 filename: 'sessions.db'
			}),
			resave: true,
		    saveUninitialized: true
		}
	)
);

// Enable json body parsing of application/json
//app.use(bodyParser.json());
app.use(urlencodedParser); // for parsing application/x-www-form-urlencoded


/*-----
ROUTES
-----*/
//Main Page Route - NO data
app.get("/", function(req, res){
	//sessions part
	var visits = 0;
  if (req.session.visits) {
  	visits = req.session.visits;
  }
  visits++;
  req.session.visits = visits;
	//req.session.lastState = stateSearch ;

	console.log(req.sessionID) ;
  console.log("This person visited " + visits + " times");

  // res.render('index.ejs');

	res.render('statemap.ejs', {"senate":senators,
                              "house":reps});

}); //app.get

//Define API call functions
//where ID is an array
function callbyID(IDs){

	for (var i = 0; i < IDs.length; i++){

		//Request options
		var options = {
			url: "https://api.propublica.org/congress/v1/members/" + IDs[i] + ".json",
			headers: {
				"X-API-Key": "FHHJDPznl616zEJmNe2Lz2fD0rmzP7O39ik4dVgP"
			}
		};

		//call API
		Request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var theData = JSON.parse(body);
				//console.log(theData.results);

				// name variables
				fname = theData.results[0].first_name ;
				lname = theData.results[0].last_name ;

				//create database object
				var congressperson = new Object();
				congressperson.updatedAt = new Date();
				congressperson.State = stateSearch ;
				congressperson.member_id = theData.results[0].member_id ;
				congressperson.name = fname + " " + lname ;
				congressperson.crp_id = theData.results[0].crp_id ;
				congressperson.gender = theData.results[0].gender ;
				congressperson.website = theData.results[0].url ;
				congressperson.twitter = theData.results[0].twitter_account ;
				congressperson.facebook = theData.results[0].facebook_account ;
				congressperson.youtube = theData.results[0].youtube_account ;
				congressperson.in_office = theData.results[0].in_office ;
				congressperson.party = theData.results[0].current_party ;

				cdb.congress.update(
				 {crp_id:theData.results[0].crp_id},
			   {$set:{congressperson}},
			   {upsert: true}
				)

			} //Request success
		}); //Request

	} //IDs loop
} // function callbyID


function getSenateIDs(state){

	//Request options
	var options = {
		url: "https://api.propublica.org/congress/v1/members/senate/" + state + "/current.json",
		headers: {
			"X-API-Key": "FHHJDPznl616zEJmNe2Lz2fD0rmzP7O39ik4dVgP"
		}
	};

	//clear array
	senateIDs = [];

	//call API
	Request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var theData = JSON.parse(body);
			console.log('got senator iDs for ' + state);
			//console.log(theData);

			//push IDs to array
			for (var i = 0; i < theData.results.length; i++) {
				senateIDs.push(theData.results[i].id);
			}
			//console.log(senateIDs);

		} //Request success

		callbyID(senateIDs);

	}); //Request
} // function getSenateIDs

function getHouseIDs(state){

	//Request options
	var options = {
		url: "https://api.propublica.org/congress/v1/members/house/" + state + "/current.json",
		headers: {
			"X-API-Key": "FHHJDPznl616zEJmNe2Lz2fD0rmzP7O39ik4dVgP"
		}
	};

	//clear array
	houseIDs = [];

	//call API
	Request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var theData = JSON.parse(body);
			console.log('got house iDs for ' + state);
			//console.log(theData);

			//push IDs to array
			for (var i = 0; i < theData.results.length; i++) {
				houseIDs.push(theData.results[i].id);
			}
			//console.log(houseIDs);

		} //Request success

		callbyID(houseIDs);

	}); //Request
} // function getHouseIDs

function getEventInfo(id){

	//make request to API
  var requestURL = "http://politicalpartytime.org/api/v1/event/?beneficiaries__crp_id=" + id + "&format=json" ;

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
	  	}

			//create database object
			var events = new Object();
			events.updatedAt = new Date();
			events.State = stateSearch ;
			events.crp_id = id ;
			events.recentEvents = recentEvents ;

			pdb.congress.update(
			 {crp_id:id},
			 {$set:{events}},
			 {upsert: true}
			)
	}); //request
} // function getEventinfo

//SAVE the State that the user clicked
app.post("/newState", function(req,res){
	console.log("A POST!!!!");
	oldState = stateSearch;
  stateSearch = req.body.name;
	senators = [];
	reps = [];

	getSenateIDs(stateSearch);
	getHouseIDs(stateSearch);

	// currentTime = new Date() ;
	// cdb.congress.find({"congressperson.State":stateSearch}, function(err, saved) {
	//   if( err || !saved) {
	// 		console.log("NOT SAVED");
	// 		console.log(saved);
	// 	}
	// 	else {
	//   	saved.forEach(function(record) {
	// 			console.log('here');
	// 			// console.log(currentTime);
	// 			// checkTime = currentTime - record.congressperson.updatedAt ;
	// 			// console.log("difference: " + checkTime) ;
	// 			// if (checkTime > 7*24*60*60*1000){ //once a week
	// 			// 	getSenateIDs(stateSearch);
	// 			// 	getHouseIDs(stateSearch);
	// 			// 	//console.log(record.congressperson);
	// 			// 	// getEventInfo(record.congressperson.crp_id);
	// 			// 	// getFundingInfo(record.congressperson.crp_id);
	// 			// }
	// 			//console.log(record.congressperson.updatedAt);
	// 			// push to array based on house or senate website
	// 			if (senateweb.test(record.congressperson.website)){
	// 				senators.push(record.congressperson);
	// 			} else if (houseweb.test(record.congressperson.website)) {
	// 				reps.push(record.congressperson);
	// 			}
	//   	});	//forEach
	//   } //else statement
	//
	// 	res.send({"senate":senators,
	// 						"house":reps});

	// });	//DB find
}); //app.post


//SAVE the TARGET that the user clicked
app.post("/party", function(req,res){
	console.log("party POST!!!!");
	//Get the data from the body
  // console.log(req.body);
  target = req.body.fundid;
  // console.log(target);

	//Get funder info when a user clicks on that legislators name
	// --(1) this should now go to your own db

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
	      //console.log(recentEvents);
	      res.send({"events":recentEvents});
	  	}

	}); //request
}); // app.post

//funding page route ??
app.post("/opensecrets", function(req, res){

	target = req.body.fundid;

	var requestURL = "https://www.opensecrets.org/api/?method=candSector&cid=" + target + "&cycle=2016&output=json&apikey=" + keys.apikey ;
	Request(requestURL, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log("got something");
			var theData = JSON.parse(body);
			var funding = theData.response.sectors.sector ;
			// console.log(theData.response.sectors.sector);
			console.log('got to the end!');

			allFunds = [];
			for (var i = 0; i < funding.length; i++){

						//create database object
						var fundSectors = new Object();
						fundSectors.updatedAt = new Date();
						fundSectors.sector_name = funding[i]['@attributes'].sector_name ;
						fundSectors.indivs = funding[i]['@attributes'].indivs ;
						fundSectors.pacs = funding[i]['@attributes'].pacs ;
						fundSectors.total = funding[i]['@attributes'].total ;

						allFunds.push(fundSectors);
			} //IDs loop

			console.log(allFunds);

			//send data
			res.send({"sectors":allFunds});
		}
	}); //Request
}); //app.get


//Catch All Route
app.get("*", function(req, res){
	res.send("Sorry, there's nothing here. Return to <a href='statemap'>Fun(d)raiser map</a>.");
});

//Start the server)
var port = 4005 ;
app.listen(port);
console.log('Express started on port ' + port);
