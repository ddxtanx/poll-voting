var mongo = require('mongodb').MongoClient;
function reg(req, res){
    var email = req.body.email;
    var name = req.body.name;
    var pass1 = req.body.pass1;
    var pass2  = req.body.pass2;
    if(pass1!==pass2){
        res.render("twig/register.twig", {type: "alert-danger", text:"Passwords do not match"});
    }
    mongo.connect("mongodb://admin:PASSWORDREDACTED@ds115071.mlab.com:15071/polls", function(err, db){
        if(err) throw err;
        var users = db.collection('users');
        users.find({
            'email': email
        }).toArray(function(err, data){
            if(err){
                res.render("twig/register.twig", {type: "alert-danger", text:"Database error"});
                db.close();
            }
            if(data.length!==0){
                res.render("twig/register.twig", {type: "alert-danger", text:"You are already registered!<a href='/login'>Now Login! </a>"});
                db.close();
            } else{
                var user = {
                    'email': email,
                    'name': name,
                    'password': pass1
                };
                users.insert(user, function(err, data){
                    if(err){
                        res.render("twig/register.twig", {type: "alert-danger", text:"Database error"});
                        db.close();
                    }
                    console.log(data);
                    res.render("twig/register.twig", {type: "alert-success", text:"You have been registered!"});
                    db.close();
                });
            }
        });
    })
}
function login(req, res){
    var email = req.body.email;
    var password = req.body.password;
    console.log(email+' '+password)
    mongo.connect("mongodb://admin:PASSWORDREDACTED@ds115071.mlab.com:15071/polls", function(err, db){
        console.log("Connected to db");
       if(err){
           res.render("twig/login.twig", {type: "alert-danger", text:"DB error"});
       } 
       var users = db.collection('users');
       users.find({
           'email': email,
           'password': password
       }).toArray(function(err, data){
           console.log("Got data");
           if(err){
               res.render("twig/login.twig", {type: "alert-danger", text:"DB error", loggedin:false});
           } 
           console.log(data);
           if(data.length===0){
               console.log("No users");
               res.render("twig/login.twig", {type: "alert-danger", text:"Email&Password combo not found.", loggedin:false});
           } else{
               console.log("Got user");
               console.log(data);
               req.session.active = true;
               req.session.email = data[0].email;
               req.session.name = data[0].name;
               res.redirect("/dashboard");
               res.end();
               db.close();
           }
       })
    });
}
module.exports.reg = reg;
module.exports.login = login;