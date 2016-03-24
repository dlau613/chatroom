


//load modules
// var express = require("express");
// var app = express();
// var http = require("http").createServer(app);
// var port = 8001;

// app.get("/", function(req,res) {
// 	res.send("it works!");
// });

// app.listen(port);
// console.log("listening on port" + port);
var port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
// app.listen(port, '0.0.0.0');
// http.listen(3000);
// app.listen(port, '0.0.0.0', function(err) {
//   console.log("Started listening on %s", app.url);
// });

///////////////////////
// var MongoClient = require('mongodb').MongoClient;
// var assert = require('assert');
// var url = 'mongodb://localhost:27017/test';
// MongoClient.connect(url, function(err, db) {
//   assert.equal(null, err);
//   console.log("Connected correctly to server.");
//   db.close();
// });

///////////////////////

// app.get('/', function(req, res){
//   // res.send('<h1>Hello world</h1>');

//   res.sendFile(__dirname + '/index.html');
// });
app.use(express.static(__dirname +'/public'));
// app.use(express.static(__dirname + '/index.html'));

var numUsers = 0;

//stores sockets (added username property to socket)
var allUsers = [];

//stores person object which has username and socket.id
//can pass this one as a parameter
var userList = [];
io.on('connection', function(socket){
	numUsers += 1;

	socket.userName = 'default';
	allUsers.push(socket);

	var person = Object();
	person.nickName = 'default';
	person.sid = socket.id;
	userList.push(person);
	console.log('a user connected, id: '+socket.id);

	//if people are sitting at login it will count them towards numUsers, if they were at
	//login at the same time
	io.to(socket.id).emit('initialize', {num_users : numUsers, user_list : userList});
	
	socket.on('disconnect', function(){
		numUsers -= 1;
	    var i = allUsers.indexOf(socket);
	    var user = allUsers[i].userName;
	    console.log(user +' disconnected');
	    allUsers.splice(i,1);
	    userList.splice(i,1);
	    io.emit('disconnect', {num_users : numUsers, user_name : user});
	});

	// socket.on('private message', function(msg) {
	// 	console.log(msg.user_name + ' to ' + msg.recipient + ': ' + msg.message);
	// 	var recipient_id = username_to_id(msg.recipient);
	// 	if (recipient_id != -1) {
	// 		io.to(recipient_id).emit('private message', {m : msg.message, user_name : msg.user_name} );
	// 	}
	// 	else 
	// 		console.log("recipient does not exist");
	// });

	// socket.on('normal message', function(msg){
 //    	console.log(msg.user_name + ' to all: ' + msg.message);
 //    	socket.broadcast.emit('normal message', { m : msg.message, user_name : msg.user_name} );
 // 	});

 	socket.on('message', function(msg) {
 		console.log(msg.m_sender + ' to ' + msg.m_receiver + ': ' + msg.m_text);
 		//store message in db
 		if (msg.m_type === 'private') {
 			var receiver_id = username_to_id(msg.m_receiver);
 			if (receiver_id != -1) {
 				io.to(receiver_id).emit('message', msg);
 			}
 		}
 		else if (msg.m_type === 'normal') {
 			socket.broadcast.emit('message', msg);
 		}
 	});

	//once the user enters a user name send it and the new number of users to everyone
 	socket.on('new user',function(msg) {
 		console.log(msg + ' joined the chatroom');
 		var i = allUsers.indexOf(socket);
 		allUsers[i].userName = msg; 
 		userList[i].nickName = msg;
 		socket.broadcast.emit('new user', {num_users : numUsers, user_name : msg });
 	});
});


http.listen(port, function(){
  console.log('listening on *: '+port);
});

function username_to_id(username) {
	for (var i=0; i < userList.length; ++i) {
		if (userList[i].nickName === username)
			return userList[i].sid;
	}
	return -1;
}
