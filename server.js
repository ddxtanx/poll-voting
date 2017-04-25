var express = require('express'),
    app= express(),
    body_parser = require('body-parser'),
    session = require('client-sessions'),
    acc = require("./app/account.js"),
    polls = require("./app/polls.js"),
    morgan = require('morgan');
app.set('views', "./views/public/");
app.use(express.static("./views/public"), body_parser(), session({
  cookieName: 'session',
  secret: process.env.SESSION_SECRET,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}), morgan(':method :url :status :res[content-length] - :response-time ms'));
function veryifyLogin(req, res, callback){
    if(req.session.active){
        callback();
    } else{
        res.redirect("/login");
        res.render('twig/login.twig', {'loggedin': false});
        res.end();
        return;
    }
}
app.get("/*", function(req, res, next){
    if(req.session.active == undefined){
        req.session.reset();
        req.session.active = false;
    }
    next();
});
app.get("/", function(req, res){
    res.redirect("/poll");
    res.end();
});
app.get("/poll", function(req, res){
    console.log(req.session.active);
    polls.getPolls(req, res);
});
app.get("/register", function(req, res){
    res.render("twig/register.twig", {loggedin: false, name:false});
});
app.post("/register", function(req, res){
    acc.reg(req,res);
});
app.get("/login", function(req, res){
    if(req.session.active == undefined){
        req.session.reset();
        req.session.active = false;
    }
    if(req.session.active){
        console.log(req.session.active);
        res.render("twig/login.twig", {'loggedin': true, 'name':req.session.name});
    } else{
        res.render("twig/login.twig", {'loggedin': false});
    }
});
app.post("/login", function(req,res){
    acc.login(req,res);
});
app.get("/dashboard", function(req,res){
    if(req.session.active == undefined){
        req.session.reset();
        req.session.active = false;
    }
    if(!req.session.active){
        res.redirect("/login");
        res.end();
    } else{
        console.log(req.session.name);
        polls.getMyPolls(req, res);
    }
});
app.post("/dashboard", function(req, res){
    var data = req.body;
    var name = data.name;
    var options = data.option;
    console.log(data);
    polls.add(name, options, req, res);
});
app.get("/poll/*", function(req, res){
    if(req.session.active == undefined){
        req.session.reset();
        req.session.active = false;
    }
    var name = req.url.split("/poll/")[1];
    name = decodeURIComponent(name);
    polls.getPoll(name, req, res);
});
app.post("/vote", function(req, res){
    console.log("handling vote");
    polls.vote(req, res);
});
app.post("/delete", function(req, res){
    var pollName = req.body.pollName;
    console.log("deleting "+pollName);
    polls.deletePoll(pollName, req, res);
})
app.post("/getPollData", function(req, res){
    var pollName = req.body.pollName;
    console.log("Getting data for "+pollName);
    polls.pollData(pollName, req, res);
})
app.listen(process.env.PORT || 8080);