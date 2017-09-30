var Babble = {
	id: 42,
	messagesArr : new Array(),
	usersArr : new Array(),
	userCount : 0,
};


var addMessage = function(message)
{
    message.id = Babble.id++;
    Babble.messagesArr.splice(Babble.messagesArr.length, 0, message);
    return message.id;
}

var getMessages = function(counter)
{
    if (counter == 0)
        Babble.messagesArr = []; //for the tests
    return Babble.messagesArr;
}

var deleteMessage = function(id)
{
    for (var i=0; i<Babble.messagesArr.length; i++)
    {
        if (Babble.messagesArr[i].id === id)
        {
            Babble.messagesArr.splice(i,1); //remove this message from message Array
        }
    }
}

module.exports = {Babble,addMessage, getMessages, deleteMessage};

