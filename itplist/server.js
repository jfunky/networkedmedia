var Datastore = require('nedb');
var db = new Datastore({filename: "data.db", autoload: true});

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
app.post('/jobsubmission', function (req, res) {
	console.log("They posted " + req.body.title);

	// recode types
	if (req.body.job_type == 1) {
		jobtype = "full-time";
	} else if (req.body.job_type == 2) {
		jobtype = "part-time" ;
	} else if (req.body.job_type == 3) {
		jobtype = "contract" ;
	} else if (req.body.job_type == 4) {
		jobtype = "employee's choice";
	} else {
		jobtype = " " ;
	}

	var contact = " ";
	if (req.body.text_ok == 1) {
		contact += "text " ;
		console.log("text" + contact)
	}
	if (req.body.call_ok == 1) {
			contact += "call ";
			console.log("call" + contact)
	}
	if (req.body.email_ok == 1) {
			contact += "email" ;
			console.log("email" + contact)
	}

	var jobdata = new Object();
	jobdata.whatis = "job";
	jobdata.title = req.body.jobname;
	jobdata.description = req.body.jobdescription;
  jobdata.pay = req.body.jobpay;
	jobdata.location = req.body.joblocation;
  jobdata.type = jobtype;
	jobdata.name = req.body.name;
  jobdata.email = req.body.email;
	jobdata.phone = req.body.phone;
  jobdata.contact = contact;
	// jobs.push(jobdata);

	// Insert the data into the database
	db.insert(jobdata, function (err, newDocs) {
		console.log("err: " + err);
		console.log("newDocs: " + newDocs);

		returnjob = "title: " + jobdata.title + "<br />" +
							 "description: " + jobdata.description + "<br />" +
							 "pay: " + jobdata.pay + "<br />" +
							 "location: " + jobdata.location + "<br />" +
							 "type: " + jobtype + "<br />" +
							 "Contact name: " + jobdata.name + "<br />" +
							 "Contact email: " + jobdata.email + "<br />" +
							 "Contact phone: "+ jobdata.phone + "<br />" +
							 "Contact via : " + contact ;

		res.send("You submitted: <br>" + returnjob );
	}); //db
});


app.post('/gigsubmission', function (req, res) {
	console.log("They posted " + req.body.title);

	var contact = " ";
	if (req.body.text_ok == 1) {
		contact += "text " ;
		console.log("text" + contact)
	}
	if (req.body.call_ok == 1) {
			contact += "call ";
			console.log("call" + contact)
	}
	if (req.body.email_ok == 1) {
			contact += "email" ;
			console.log("email" + contact)
	}

	var gigdata = new Object();
	gigdata.whatis = "gig";
	gigdata.title = req.body.gigname;
	gigdata.description = req.body.gigdescription;
  gigdata.pay = req.body.gigpay;
	gigdata.location = req.body.giglocation;
	gigdata.name = req.body.name;
  gigdata.email = req.body.email;
	gigdata.phone = req.body.phone;
  gigdata.contact = contact;
	// gigs.push(gigdata);

	// Insert the data into the database
	db.insert(gigdata, function (err, newDocs) {
		console.log("err: " + err);
		console.log("newDocs: " + newDocs);

		returngig = "title: " + gigdata.title + "<br />" +
							 "description: " + gigdata.description + "<br />" +
							 "pay: " + gigdata.pay + "<br />" +
							 "location: " + gigdata.location + "<br />" +
							 "Contact name: " + gigdata.name + "<br />" +
							 "Contact email: " + gigdata.email + "<br />" +
							 "Contact phone: "+ gigdata.phone + "<br />" +
							 "Contact via : " + contact ;

		res.send("You submitted: " + returngig);
	}); //db
}); //post function


app.post('/stuffsubmission', function (req, res) {
	console.log("They posted " + req.body.title);

	if (req.body.stuff_quality == 1) {
		quality = "Broken";
	} else if (req.body.stuff_quality == 2) {
		quality = "Mild wear" ;
	} else if (req.body.stuff_quality == 3) {
		quality = "Good" ;
	} else if (req.body.stuff_quality == 4) {
		quality = "Like new";
	} else {
		quality = " " ;
	}

	var barter = " ";
	if (req.body.barter_ok == 1) {
		barter += "barter " ;
	}
	if (req.body.sell_ok == 1) {
			barter += "sell ";
	}

	var contact = " ";
	if (req.body.text_ok == 1) {
		contact += "text " ;
		console.log("text" + contact)
	}
	if (req.body.call_ok == 1) {
			contact += "call ";
			console.log("call" + contact)
	}
	if (req.body.email_ok == 1) {
			contact += "email" ;
			console.log("email" + contact)
	}

	var stuffdata = new Object();
	stuffdata.whatis = "stuff";
	stuffdata.title = req.body.title;
	stuffdata.description = req.body.stuffdescription;
  stuffdata.stuff_quality = quality ;
	stuffdata.barter_ok = barter ;
	stuffdata.name = req.body.name;
  stuffdata.email = req.body.email;
	stuffdata.phone = req.body.phone;
  stuffdata.contact = contact ;
	// stuff.push(stuffdata);

	// Insert the data into the database
	db.insert(stuffdata, function (err, newDocs) {
		console.log("err: " + err);
		console.log("newDocs: " + newDocs);

		returnstuff = "title: " + stuffdata.title + "<br />" +
							 "description: " + stuffdata.description + "<br />" +
							 "quality: " + quality + "<br />" +
							 "barter/sell: " + barter +
							 "Contact name: " + stuffdata.name + "<br />" +
							 "Contact email: " + stuffdata.email + "<br />" +
							 "Contact phone: "+ stuffdata.phone + "<br />" +
							 "Contact via : " + contact ;

		res.send("You submitted: <br>" + returnstuff );

	}); //db
}); //post function


// get entries from db
app.get('/itplist', function(req, res) {
	// Find all of the existing docs in the database
	db.find({}, function(err, docs) {

		//have to do this over here so we can init to missing
		var jobs = [];
		var gigs = [];
		var stuff = [];

		// sort my docs into categories
		for (var i = 0; i < docs.length; i++) {
			if (docs[i].whatis === "stuff"){
						stuff.push(docs[i]);
			}
			if (docs[i].whatis === "gig"){
						gigs.push(docs[i])
			}
			if (docs[i].whatis === "job"){
						jobs.push(docs[i])
			}
		}

		//res.send(docs);
		res.render('template.ejs', {"stuffd":stuff,
																"jobd":jobs,
																"gigd":gigs});

	});
});

//Catch All Route
app.get("*", function(req, res){
	res.send("Sorry, there's nothing here. Return to <a href='itplist'>itplist</a>.");
});

app.listen(3000)
console.log("Server is running on port 3000");
