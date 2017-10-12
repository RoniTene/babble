///// User java script /////
//'use strict';
//var a = new INFO('', '');
//localStorage.setItem('babble', JSON.stringify(a));

window.Babble = {
	id: 42,
	messagesArr : new Array(),
	usersArr : new Array(),
	userCount : 0,
	
	/*** BABBLE FUNCTIONS ***/
	register : function (userInformation)
	{
		if (typeof(Storage) !== "undefined")
        {
            var newLocal = new INFO(userInformation.name, userInformation.email);
		    localStorage.setItem('babble', JSON.stringify(newLocal));
		}
        else
        {
		    console.log('Not Suppotrted');
        }
	
        var req = {
            method : "GET",
            action: "http://localhost:9000/register?usermail="+userInformation.email
        };

        httpReqASync(req);
	},

    
	getMessages : function (count, callback)
	{
        NewhttpReqASync('GET', "http://localhost:9000/messages?counter="+count, callback);
	},
	
	postMessage: function (message, callback)
	{
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:9000/messages", true);
        xhr.onload = function (){
            if (xhr.status == 200)
            {
                callback( {id: String(Babble.id)} );
            }
        };
        xhr.send(JSON.stringify(message));
	},
	
	deleteMessage : function (id, callback)
	{
        NewhttpReqASync("DELETE", "http://localhost:9000/messages/"+id, callback);
	},
	
	getStats : function (callback)
	{
        NewhttpReqASync("GET", "http://localhost:9000/stats", callback);
	}
};

/*function httpReqSync(method, url, data)
{
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, false); // false for synchronous request
    if (method === "POST")
    {
        xhr.send(JSON.stringify(data));
    }
    else
        xhr.send();

    return xhr.responseText;
}*/

function httpReqASync(req) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(req.method, req.action); 
        xhr.timeout = 200;
        xhr.addEventListener('load', function(e) {
            resolve(e.target.responseText);
        });

        xhr.send();
    });
}

function NewhttpReqASync(method, url, callback) {
var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onload = function (){
            if (xhr.status == 200 || xhr.status == 204)
            {
                callback(JSON.parse(xhr.responseText));
            }
        };
        xhr.send();
}

var poll = function(){
    var Babble = window.Babble;
    var user;
    if (typeof(Storage) !== "undefined")
    {
        user = JSON.parse(localStorage.getItem('babble'));
    }
    else
    {
        console.log('Not supported');
    }

    Babble.getStats(function(resulti){
        if(resulti !== undefined )
        {
            document.getElementById('cntUsers').innerHTML = resulti.users;
            document.getElementById('cntMsg').innerHTML = resulti.messages;
        }
    });

    var numOfMsg = parseInt(document.getElementById('cntMsg').innerHTML);

    Babble.getMessages(numOfMsg, function(result){
        if (result != "") //getMessages return the messages array
        {
            numOfMsg = result.length;
            updateBrowser(result);
            poll();
            //setInterval(poll, 30000); //every 30 second send a new request.
        }
    });

    if (user.userInfo.email != "") {
        var req = {
            method: "GET",
            action: "http://localhost:9000/register?usermail="+user.userInfo.email
        }   
        httpReqASync(req);
    }
};

var poll2 = function(){
    var Babble = window.Babble;
    var user;
    Babble.getStats(function(resulti){
        if(resulti !== undefined )
        {
            document.getElementById('cntUsers').innerHTML = resulti.users;
            document.getElementById('cntMsg').innerHTML = resulti.messages;
            poll2();
            //setInterval(poll2, 30000); //every 30 second send a new request.
        }
    });
};

/*** Register Events ***/
window.onload = function () {	
    var user, local;
    var textArea = document.getElementById("textArea");
	if (typeof(Storage) !== "undefined")
	{     
		if (localStorage.length == 0) //we don't have info yet
		{ 
			document.getElementById("modal").style.display = "block";
            local = new INFO('', '');
            localStorage.setItem('babble', JSON.stringify(local));

            //checking
            var print = JSON.parse(localStorage.getItem("babble"));
            console.log(print);

		}
		else //we have user info in localStorage
		{
            user = JSON.parse(localStorage.getItem('babble'));
            if (user.currentMessage != "") //restore user's message
            {
                textArea.value = user.currentMessage;
            }
		}
        poll2();
        poll();	
	} 
	else
	{
		console.log('Not supported');
	}
};

/*** Register Events - When a user press Save button ***/
document.getElementById('Save').onclick = function () {
	var Babble = window.Babble;
	var x = document.getElementById('info'); 

    //make Sure the email address in valid
    if(x.elements[1].value.search("@") == -1)
    {
        alert("Please insert correct Email Address!");
		x.elements[1].value = "";
    }
    else
    {
	    var user = new INFO(x.elements[0].value, x.elements[1].value);
        var user2 = new INFO2(x.elements[0].value, x.elements[1].value);	
	    if (typeof(Storage) !== "undefined")
        {
            localStorage.setItem('babble', JSON.stringify(user));
            var print = JSON.parse(localStorage.getItem("babble"));
            console.log(print);
	    }
        else
        {
	        console.log('Not supported');
	    }
        document.getElementById('modal').style.display = "none";
	    Babble.register(user2);
    }
};

/*** Register Events- When a user press Stay Anonymous button ***/
 document.getElementById('Anonymous').onclick = function () {
	document.getElementById('modal').style.display = "none";
	var user = new INFO('Anonymous', 'Anonymous');
	
	if (typeof(Storage) !== "undefined") {
        localStorage.setItem('babble', JSON.stringify(user));
        var print = JSON.parse(localStorage.getItem("babble"));
        console.log(print);

	} else {
	console.log('Not supported');
	}

    var req = {
            method : "GET",
            action: "http://localhost:9000/register?usermail=Anonymous"
    };
	httpReqASync(req);
};

/*** Event listener when window closes ***/
window.addEventListener("unload", function(e) {
    var updateUser;
    if (typeof(Storage) !== "undefined")
    {
        if(localStorage.length == 1)
        {
            updateUser = JSON.parse(localStorage.getItem('babble'));
            updateUser.currentMessage = document.getElementById('textArea').value; // save user's unsent message in local storage
            localStorage.setItem('babble', JSON.stringify(updateUser) ); // save user's details in local storage
            
            var req = {
                method: "GET",
                action: "http://localhost:9000/logout?usermail="+updateUser.userInfo.email
            }
            httpReqASync(req); 
        }
        else
        {
            console.log('Local storage is empty');
        }
    }
    else
    {       
        console.log('Not supported');
    }
});

/*** Help Constructors : ***/
function INFO(_name, _email, currentMessage="")
{
	this.userInfo = {
		name : _name,
		email : _email
	};
	this.currentMessage = currentMessage;
}

function INFO2(_name, _email) //for testing
{
	this.name = _name;
	this.email = _email;
}

//type of message array
function MessageDetails(_name, _email, _data, _time, _id, _image="") {
        this.name = _name;
        this.email = _email;
        this.data = _data;
        this.time = _time;
        this.id = _id;
        this.image = _image;
}

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}


/*** Rezise the textarea according to text (till 300px) ***/
function resizeTextarea(ev) {
    ev.style.height = '90px';
    if (ev.scrollHeight <=300 && ev.scrollHeight >=70)
    {
        ev.style.height = ev.scrollHeight + 'px';
    }
    if(ev.scrollHeight > 300)
    {
        ev.style.height = 300 + 'px';
    }
    document.getElementById("footer").style.height = ev.style.height;
}

/*** on submit click, send message to the server ***/
var form = document.querySelector('#newMessage');
form.addEventListener('submit', function(e) {
    e.preventDefault();

    var userDetails;
    var data = form.elements[0].value; //the message typed
    if (typeof(Storage) !== "undefined") {
        // Store
		userDetails = localStorage.getItem('babble');
		userDetails = JSON.parse(userDetails);  // get user info
    } 
    else {
        console.log('Not supported');
    }
    var DATE = new Date();
    var h = checkTime(DATE.getHours());
    var m = checkTime(DATE.getMinutes());
    var curTime = h + ":" + m;

    var msg = new MessageDetails(userDetails.userInfo.name, userDetails.userInfo.email, data, curTime, Babble.id, '');
    Babble.postMessage(msg, function(){
        document.getElementById("textArea").value='';
    });
    window.location = "#newestMsg"; //show us always the last message
});

/*** on enter, send message to the server ***/
document.getElementById("textArea").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
            var userDetails;
			var data = form.elements[0].value; //the message typed
			if (typeof(Storage) !== "undefined") {
				// Store
				userDetails = localStorage.getItem('babble');
				userDetails = JSON.parse(userDetails);  // get user info
			} 
			else {
				console.log('Not supported');
			}
			var DATE = new Date();
			var h = checkTime(DATE.getHours());
			var m = checkTime(DATE.getMinutes());
			var curTime = h + ":" + m;
		
			var msg = new MessageDetails(userDetails.userInfo.name, userDetails.userInfo.email, data, curTime, Babble.id, '');
			Babble.postMessage(msg, function(){
				document.getElementById("textArea").value='';
			});
        window.location = "#newestMsg"; //show us always the last message
    }
});

/*** Update messages on browser ***/
function updateBrowser(babble) {
    var textArea = document.getElementById("newMessage");
    document.getElementById("footer").style.height = "90px";
    document.getElementById("textArea").style.height = "90px";
    
    var ol = document.getElementById("ol_AllMessages");
    ol.innerHTML='';
    var li;
    var user, user_email;

    if(localStorage.length == 1)
	{
		user = JSON.parse(localStorage.getItem('babble'));
		user_email = user.userInfo.email;
	}
	else
	{
		console.log('Local storage is empty');
	}

    // Update message counter
    var messageCounter = babble.length;
    document.getElementById("cntMsg").innerHTML = messageCounter;
	
	for (var i=0; i<babble.length; i++)
	{
		li = document.createElement("li");
	
		// Add user image
		var userImg = document.createElement("img");
		if (babble[i].name == "Anonymous")
		{
			userImg.setAttribute('src', 'images/ann.png');
			userImg.setAttribute('border', '1px, solid, #d7d7d7');
		}
		else {
			var MD5link = babble[i].image;
			userImg.setAttribute('src', "https://www.gravatar.com/avatar/" + MD5link + "?s=200");
		}
		userImg.setAttribute('class', 'logos');
		userImg.setAttribute('alt', ' ');
		li.appendChild(userImg);
	
		// Add  div wrapping the Name, hour and message text
		var boxMsg = document.createElement("div");
		boxMsg.setAttribute('tabindex', i+1);
		// User name
		var userName = document.createElement("cite");
		userName.appendChild(document.createTextNode(babble[i].name));
		userName.setAttribute('class', 'name');
		boxMsg.appendChild(userName);
	
		// Hour the message sent
		var _time = document.createElement("time");
		_time.appendChild(document.createTextNode(babble[i].time));
		_time.setAttribute('class', 'hour');
        var unixTime = Date.now();
		_time.setAttribute('datatime', unixTime);
		boxMsg.appendChild(_time);
	
		// Close button
        if(babble[i].email == user_email)
        {
		var _close = document.createElement("button");
		_close.appendChild(document.createTextNode("x"));
		_close.setAttribute('class', 'delete');
		_close.setAttribute('aria-label', 'closeButton');
        _close.addEventListener("click", deleteMsg(babble, i));
		boxMsg.appendChild(_close);
        }
		// New message text
		var newMsg = document.createElement("p");
		var _text = document.createTextNode(babble[i].data);
		newMsg.appendChild(_text);
		newMsg.setAttribute('class', 'newMsgTxt');
		boxMsg.appendChild(newMsg);
		boxMsg.setAttribute('class', 'boxmessage');
		li.appendChild(boxMsg);
	
		// Add new li to ol
		ol.appendChild(li);
	}

    window.location = "#newestMsg";
}

/*** Delete message and update message counter ***/
function deleteMsg(msgArray, i){
if(localStorage.length == 1)
	{
		user = JSON.parse(localStorage.getItem('babble'));
		user_email = user.userInfo.email;
	}
	else
	{
		console.log('Local storage is empty');
	}
	
	return function(){
		// check weather the messeage belongs to the user
		if( msgArray[i]!==undefined && msgArray[i].email == user_email)
        {					
			Babble.deleteMessage(i, function(result){
			document.getElementById('cntMsg').innerHTML = msgArray.length;
			});		
		}
	}
}
//Another polling request with empty response to keep the server alive.
function Alive(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:9000/alive", true);
    xhr.onload = function (){
        if (xhr.status == 200 || xhr.status == 204)
        {
            console.log("The server is still ALIVE!");
        }
    };
    xhr.send();
}

setInterval(Alive, 30000);

