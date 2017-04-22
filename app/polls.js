var mongo = require('mongodb').MongoClient;
var user = process.env.USER;
var password = process.env.PASSWORD;
var mongoUri = "mongodb://"+user+":"+password+"@ds115071.mlab.com:15071/polls";
function addPoll(name, options, req, res){
    var userName = req.session.name;
    var insertData = {
        'name': name,
        'options': {
            
        },
        'createdBy': userName
    };
    for(var x=0; x<options.length; x++){
        options[x] = options[x].replace(/\./g, "`");
        options[x] = options[x].replace(/\$/g, "_=");
        insertData.options[options[x]] = 0;
    }
    console.log("Insert data: "+JSON.stringify(insertData));
    mongo.connect(mongoUri, function(err,db){
        if(err) throw err;
        var polls = db.collection('polls');
        polls.insert(insertData, function(err, data){
            if(err) throw err;
            console.log("Poll insertion succeded");
            console.log(data);
            getMyPolls(req, res, name);
            db.close();
        });
    });
}
function getPolls(req, res){
    var isLoggedIn = req.session.active;
    var name = (isLoggedIn)?req.session.name:false;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var polls = db.collection('polls');
        polls.find({}, {
            'name':1
        }).toArray(function(err, data){
            if(err) throw err;
            console.log(data);
            for(var x = 0; x<data.length; x++){
                data[x].dispName = data[x].name;
                data[x].name = encodeURIComponent(data[x].dispName);
            }
            res.render("./twig/index.twig", {pollNames: data, loggedin:isLoggedIn, name:name});
        })
    })
}
function getPoll(name, req, res){
    var loggedIn = req.session.active;
    var userName = (loggedIn)?req.session.name:false;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        console.log("poll name "+name);
        var polls = db.collection('polls');
        polls.find({
            'name': name
        }).toArray(function(err, data){
            if(err) throw err;
            var data = data[0];
            var options = data.options;
            var author= data.createdBy;
            var optionsKeys = Object.keys(options);
            var displayedOptionsKeys = [];
            var bothOptions = [];
            for(var x = 0; x<optionsKeys.length;x++){
                displayedOptionsKeys[x] = optionsKeys[x].replace(/_=/g, "$").replace(/`/g, '.');
                bothOptions[x] = [optionsKeys[x], displayedOptionsKeys[x]];
            }
            var poll = {
                'name': name,
                'by': author,
                'options': bothOptions
            };
            console.log("Getting Poll: keys "+optionsKeys);
            res.render("twig/poll.twig", {poll: poll, loggedin: loggedIn, name:userName, dispPoll: true});
        });
    });
}
function getMyPolls(req, res){
    var success = 0;
    if(arguments.length==3){
        success = arguments[2];
        success = encodeURIComponent(success);
    }
    var name = req.session.name;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var polls = db.collection("polls");
        polls.find({
            'createdBy': name
        }).toArray(function(err, data){
            if(err) throw err;
           console.log(data); 
           for(var x = 0; x<data.length; x++){
               data[x].dispName = data[x].name
               data[x].name = encodeURIComponent(data[x].name);
           }
           res.render("twig/dashboard.twig", {'loggedin': true, 'name':name, myPolls: data, type:(success!==0)?"alert-success":"", text:(success!==0)?"Poll is available <a href='poll/"+success+"'> here! </a>":""});
        });
    });
}
function vote(req, res){
    var name = req.body.name;
    var option = req.body.selectedOption;
    console.log(name+" "+option);
    var incOption = {};
    incOption["options."+option] = 1;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var polls = db.collection('polls');
        polls.update({
            'name': name
        }, {
            $inc: incOption
        }, function(err, data){
            if(err) throw err;
            polls.find({
                'name': name
            },{
                'options': 1
            }).toArray(function(err, data){
                if(err) throw err;
                data = data[0];
                data = JSON.stringify(data);
                console.log(data+"asd");
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(data);
            });
        });
    });
}
function deletePoll(name, req, res){
    var userName = req.session.name;
    mongo.connect(mongoUri, function(err, db){
       if(err) throw err;
       var polls = db.collection('polls');
       polls.remove({
           name: name,
           createdBy: userName
       }, function(err, data){
           if(err) throw err;
           res.writeHead(200, {'Content-Type': 'text/json'});
           res.end(JSON.stringify(data));
       });
    });
}
function pollData(name, req, res){
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var polls = db.collection('polls');
        polls.find({
            name: name
        }).toArray(function(err, data){
            if(err) throw err;
            res.writeHead(200, {'Content-Type': 'text/json'});
            res.end(JSON.stringify(data));
        })
    })
}
module.exports.add = addPoll;
module.exports.getPoll = getPoll;
module.exports.getPolls = getPolls;
module.exports.getMyPolls = getMyPolls;
module.exports.vote = vote;
module.exports.deletePoll = deletePoll;
module.exports.pollData = pollData;