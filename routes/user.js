
//---------------------------------------------signup page call------------------------------------------------------
var dataChange = false;
var receiver_user = "";
var sender_user = "";
exports.signup = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
      var fname= post.first_name;
      var lname= post.last_name;
      var mob= post.mob_no;
      
      var sql = "INSERT INTO `users`(`first_name`,`last_name`,`mob_no`,`user_name`, `password`) VALUES ('" + fname + "','" + lname + "','" + mob + "','" + name + "','" + pass + "')";
      
      var query = db.query(sql, function(err, result) {

         message = "Succesfully! Your account has been created.";
         res.render('signup.ejs',{message: message});

         var sql_query_chat_table = "CREATE TABLE IF NOT EXISTS" + "`" + name +"`" + "(`message_id` int(5) NOT NULL AUTO_INCREMENT, `first_name` text NOT NULL,`last_name` text NOT NULL,`user_name` varchar(20) NOT NULL,`chat_msg` text NOT NULL,`from_user_name` varchar(20) NOT NULL, PRIMARY KEY (`message_id`))";
         var query_chat_table = db.query(sql_query_chat_table, function(err, result){
            if (err) {
                console.log("ERROR");
                throw err;
            }
            else { 
                console.log("SUCCESS"); 
            }
         });
      });

   } else {
      res.render('signup');
   }
};
 
//-----------------------------------------------login page call------------------------------------------------------
exports.login = function(req, res){
   var message = '';
   var sess = req.session; 

   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
     
      var sql="SELECT id, first_name, last_name, user_name FROM `users` WHERE `user_name`='"+name+"' and password = '"+pass+"'";                           
      db.query(sql, function(err, results){      
         if(results.length){
            req.session.userId = results[0].id;
            req.session.user = results[0];
            console.log(results[0].id);
            res.redirect('/home/dashboard');
         }
         else{
            message = 'Wrong Credentials.';
            res.render('index.ejs',{message: message});
         }
                 
      });
   } else {
      res.render('index.ejs',{message: message});
   }
           
};
//-----------------------------------------------dashboard page functionality----------------------------------------------
           
exports.dashboard = function(req, res, next){
           
   var user =  req.session.user,
   userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";

   db.query(sql, function(err, results){
      res.render('dashboard.ejs', {user:user});    
   });       
};

//-----------------------------------------------chat page functionality----------------------------------------------
           
exports.chat = function(req, res, next){
           
    var user =  req.session.user,
    userId = req.session.userId;
    console.log('chat user id='+userId);
    if(userId == null){
       res.redirect("/login");
       return;
    }
 
    var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";
 
    db.query(sql, function(err, results){
       res.render('chat.ejs', {data:results});    
    });       
 };

 //-----------------------------------------------message page functionality----------------------------------------------
           
exports.messageModule = function(req, res, next){
           
    var user =  req.session.user,
    userId = req.session.userId;
    console.log('user_id = '+userId);
    if(userId == null){
       res.redirect("/login");
       return;
    }
 
    var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";
 
    db.query(sql, function(err, results){
       // res.render('message.ejs', {data:results});    
        res.sendFile(__dirname + '/message_new.html');
    });       
 };

 //-----------------------------------------------chat handler functionality----------------------------------------------
           
exports.chathandler = function(req, res){
    var userId = req.session.userId;
    if(userId == null){
        console.log("NO CHAT dfdfedHANDLER");
        res.redirect("/login");
        return;
    }
    res.sendFile(__dirname + '/chatnew1.html');
};

//------------------------------------logout functionality----------------------------------------------
exports.logout=function(req,res){
   req.session.destroy(function(err) {
      res.redirect("/login");
   });
};
//--------------------------------render user details after login--------------------------------
exports.profile = function(req, res){

   var userId = req.session.userId;
   if(userId == null){
      console.log("NO PROFILE")
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";          
   db.query(sql, function(err, result){  
      res.render('profile.ejs',{data:result});
   });
};
//---------------------------------edit users details after login----------------------------------
exports.editprofile=function(req,res){
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";
   db.query(sql, function(err, results){
      res.render('edit_profile.ejs',{data:results});
   });
};

//-----------------------------------------------ajax functionality----------------------------------------------
           
exports.ajaxHandler = function(req, res, next){
    var user =  req.session.user,
    userId = req.session.userId;
    var user_name_sql ="SELECT `user_name` FROM `users` WHERE `id`" + "=" + "'" + userId + "'";
    db.query(user_name_sql, function(err, results){
        sender_user = JSON.parse(JSON.stringify(results))[0].user_name;
    });
    req.on('data', function(chunk) {
        chunk = chunk.toString();
        chunk = chunk.replace(/\\n/g, "\\n")  
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");
        // remove non-printable and other non-valid JSON chars
        chunk = chunk.replace(/[\u0000-\u0019]+/g,"");
        var dataObj = JSON.parse(chunk);

        var sql="SELECT `user_name` FROM `users` WHERE `user_name`" + "=" + "'" + dataObj.search_string + "'";
        db.query(sql, function(err, results){
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(results));
        });       

    });
    if(userId == null){
       res.redirect("/login");
       return;
    }
 };

 //-----------------------------------------------update chat message----------------------------------------------
           
exports.updateUserMessages = function(req, res, next){
    var user =  req.session.user,
    userId = req.session.userId;
    req.on('data', function(chunk) {
        chunk = chunk.toString();
        chunk = chunk.replace(/\\n/g, "\\n")  
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");
        // remove non-printable and other non-valid JSON chars
        chunk = chunk.replace(/[\u0000-\u0019]+/g,"");
        var dataObj = JSON.parse(chunk);

        var sql = "INSERT INTO" + "`" + dataObj.receiver + "`" + "(`first_name`,`last_name`,`user_name`,`chat_msg`,`from_user_name`) VALUES ('" + "fname" + "','" + "lname" + "','" + dataObj.receiver + "','" + dataObj.message + "','" + sender_user + "')";
        db.query(sql, function(err, results){
            // res.writeHead(200, {"Content-Type": "application/json"});
            // res.end(JSON.stringify(results));
            if (err){
                console.log("ERROR WHILE INSERTING MESSAGE");
                res.end();
                throw err;
            } else {
                dataChange = true;
                receiver_user = dataObj.receiver;
                console.log("SUCCESS check the message table -- " + dataObj.message);
                res.end();
            }
        
        });       
    });
    if(userId == null){
       res.redirect("/login");
       return;
    }
 };

 //-----------------------------------------------message page functionality----------------------------------------------
           
// exports.pollModule = function(req, res, next){
           
//     var user =  req.session.user,
//     userId = req.session.userId;
//     console.log("POLL MODULE" + 'user_id = '+userId);
    
//     if(userId == null){
//        res.redirect("/login");
//        return;
//     }

//     var user_name_sql ="SELECT `user_name` FROM `users` WHERE `id`" + "=" + "'" + userId + "'";
//     db.query(user_name_sql, function(err, results){
//         this_user = JSON.parse(JSON.stringify(results))[0].user_name;
//     });

//     if(dataChange == true && receiver_user == this_user){
//         var sql="SELECT * FROM" + "`" + receiver_user + "`";
//         db.query(sql, function(err, results){
//             res.writeHead(200, {"Content-Type": "application/json"});
//             results.push({user: user});
//             res.end(JSON.stringify(results));
//         });
//         dataChange = false;
//     }
//  };

exports.pollModule = function(req, res, next){
           
    var user =  req.session.user,
    userId = req.session.userId;
    console.log("POLL MODULE" + 'user_id = '+userId);
    
    if(userId == null){
       res.redirect("/login");
       return;
    }

    var user_name_sql ="SELECT `user_name` FROM `users` WHERE `id`" + "=" + "'" + userId + "'";
    db.query(user_name_sql, function(err, results){
        this_user = JSON.parse(JSON.stringify(results))[0].user_name;
        if(dataChange == true && receiver_user == this_user){
            var sql="SELECT * FROM" + "`" + receiver_user + "`";
            db.query(sql, function(err, results){
                res.writeHead(200, {"Content-Type": "application/json"});
                results.push({user: user});
                res.end(JSON.stringify(results));
            });
            dataChange = false;
        }
    });

    
 };
 
