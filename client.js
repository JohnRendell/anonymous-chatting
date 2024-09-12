//client side

//for functionalities
function cancelMatch(){
    document.getElementById('find-chat-div').style.display = "flex";
    document.getElementById('finding-user-div').style.display = "none";
    socket.emit('cancel-match');
}

function findChat(){
    sessionStorage.setItem('cancelMatch', null);
    document.getElementById('find-chat-div').style.display = "none";
    document.getElementById('finding-user-div').style.display = "flex";

    //send the data to the server
    socket.emit('find-user', sessionStorage.getItem('name'), generateRoom('private-roomID-' + Math.floor(Math.random() * 20) + "_", 5), sessionStorage.getItem('socketID'));
}

function addToAvailableList(){
    let username = sessionStorage.getItem('name');

    if(username != null){
        socket.connect();
        socket.emit('add-to-active', username);
        userIdle();
    }
}

function acceptUser(id, user){
    document.getElementById(id).innerText = "Accepted";
    document.getElementById(id).disabled = true;

    //send the user to the server
    socket.emit('validate-user', user, sessionStorage.getItem('privateRoomID'));
}

function declineUser(id, roomID){
    document.getElementById(id).remove();
    document.getElementById('find-chat-div').style.display = "flex";

    //pass the data to socket, just so it can notify the other end
    socket.emit('decline-match', sessionStorage.getItem('name'), roomID);

    if(sessionStorage.getItem('privateRoomID')){
        socket.emit('leave-room', sessionStorage.getItem('name'), sessionStorage.getItem('privateRoomID'));
    }

    //set the session to null
    sessionStorage.setItem('privateRoomID', null);
}

function sendingMessage(){
    let message = document.getElementById('messageInput');
    var messageContainer = document.getElementById('message-container');

    if(document.getElementById('conversation-container').contains(document.getElementById('message-container')) && sessionStorage.getItem('privateRoomID') && message.value){
        //append the user message
        var messageDiv = document.createElement('div');
        messageDiv.setAttribute('class', 'flex justify-end');
        messageContainer.appendChild(messageDiv);

        //this is the div that wrap the message and user
        var messageWrap = document.createElement('div');
        messageWrap.setAttribute('class', 'border-2 border-[#121212] w-[30rem] h-auto py-2 px-4 bg-white rounded-[2rem] text-wrap');
        messageDiv.appendChild(messageWrap);

        //the sender
        var messageSender = document.createElement('p');
        messageSender.setAttribute('class', 'font-bold text-[#121212]');
        messageSender.appendChild(document.createTextNode(sessionStorage.getItem('name') + ": "));
        messageWrap.appendChild(messageSender);

        //the message
        var mainMessage = document.createElement('p');
        mainMessage.setAttribute('class', 'text-[#121212] break-words');
        mainMessage.appendChild(document.createTextNode(message.value));
        messageWrap.appendChild(mainMessage);

        //send the socket to the server
        socket.emit('private-message', sessionStorage.getItem('name'), message.value, sessionStorage.getItem('privateRoomID'), sessionStorage.getItem('socketID'));
    }

    if(document.getElementById('conversation-container').contains(document.getElementById('message-container'))){
        document.getElementById('messageInput').value = '';
        messageContainer.scrollTo(0, messageContainer.scrollHeight); //scroll to bottom
    }
}

//for disconnecting to chatter
function disconnectChat(){
    //hide the create room
    document.getElementById('chatRoomDiv').style.display = "none";
    document.getElementById('hideGroupRoom').style.display = 'flex';

    document.getElementById('find-chat-div').style.display = 'flex';
    document.getElementById('message-container').remove();

    //remove conversation border and hide the input
    document.getElementById('conversation-container').style.borderStyle = "none";
    document.getElementById('message-div').style.display = "none";

    //if the user already on the private room
    if(sessionStorage.getItem('privateRoomID')){
        //leave the user to room
        socket.emit('user-left-chat', sessionStorage.getItem('privateRoomID'), sessionStorage.getItem('name'));

        //reset the session private room
        sessionStorage.setItem('privateRoomID', null);
    }
}

//Room Stuff---------------------------------------------------------------------
//send message for group chat
function sendingGroupMessage(){
    var messageContainer = document.getElementById('groupMessageDiv');

    if(document.getElementById('conversation-container').contains(document.getElementById('groupMessageDiv')) && sessionStorage.getItem('groupRoom') && document.getElementById('messageInput').value){
        //append the user message
        var messageDiv = document.createElement('div');
        messageDiv.setAttribute('class', 'flex justify-end');
        messageContainer.appendChild(messageDiv);

        //this is the div that wrap the message and user
        var messageWrap = document.createElement('div');
        messageWrap.setAttribute('class', 'border-2 border-[#121212] w-[30rem] h-auto py-2 px-4 bg-white rounded-[2rem] text-wrap');
        messageDiv.appendChild(messageWrap);

        //the sender
        var messageSender = document.createElement('p');
        messageSender.setAttribute('class', 'font-bold text-[#121212]');
        messageSender.appendChild(document.createTextNode(sessionStorage.getItem('name') + ": "));
        messageWrap.appendChild(messageSender);

        //the message
        var mainMessage = document.createElement('p');
        mainMessage.setAttribute('class', 'text-[#121212] break-words');
        mainMessage.appendChild(document.createTextNode(document.getElementById('messageInput').value));
        messageWrap.appendChild(mainMessage);

        //send the socket to the server
        socket.emit('group-message', sessionStorage.getItem('name'), document.getElementById('messageInput').value, sessionStorage.getItem('groupRoom'), sessionStorage.getItem('socketID'));

        document.getElementById('messageInput').value = '';
        messageContainer.scrollTo(0, messageContainer.scrollHeight); //scroll to bottom
    }
}

//for creating room
function createRoom(){
    //create room name
    let roomName = document.getElementById('createRoomInput');
    let maxRoom = document.getElementById('createRoomMaxGroup');

    //function for checking whitespace
    const checkWhitespace = (str)=>{
        return /\s/.test(str);
    }

    //check if room has whitespace
    if(checkWhitespace(roomName.value)){
        popUpDiv('Room should not have white space!')
    }

    //if room name is not proper
    else if(roomName.value == false){
        popUpDiv('Create a proper room name')
    }

    //check if the room capacity is below 3
    else if(maxRoom.value < 3){
        popUpDiv('Minimum capacity is 3!');
    }

    //check if the room capacity is above 10
    else if(maxRoom.value > 10){
        popUpDiv('Maximum capacity is 10!');
    }

    //if everything is correct
    else{
        //pass the value to the server
        socket.emit('create-room', roomName.value, maxRoom.value, sessionStorage.getItem('socketID'));

        //reset inputs to the default value
        document.getElementById('createRoomMaxGroup').value = 3;
        document.getElementById('createRoomInput').value = "";
    }
}

//for user joining private room
function joinRoom(){
    let joinInput = document.getElementById('roomInput');

    //send the client to the socket
    socket.emit('find-room', joinInput.value, sessionStorage.getItem('socketID'));

    //reset the input
    document.getElementById('roomInput').value = "";
}

//for leaving the room
function leaveRoom(){
    document.getElementById('groupMessageDiv').remove();
    
    //remove conversation border and hide the input
    document.getElementById('conversation-container').style.borderStyle = "none";
    document.getElementById('message-div').style.display = "none";

    document.getElementById('hideGroupRoom').style.display = 'flex';
    document.getElementById('groupRoomDiv').style.display = 'none';
    document.getElementById('find-chat-div').style.display = 'flex';

    socket.emit('leave-group-chat', sessionStorage.getItem('groupRoom'), sessionStorage.getItem('maxCap'), sessionStorage.getItem('socketID'));
}

//end of room stuff-------------------------------------------------

//for clearing session storage when user reload the page or close the tab
window.onbeforeunload = function(){
    let sessionRoom = sessionStorage.getItem('privateRoomID') != null ? sessionStorage.getItem('privateRoomID') : null;
    
    //notify the user disconnect
    socket.emit('user-disconnect-server', sessionStorage.getItem('name'), sessionRoom);

    socket.disconnect();
    sessionStorage.clear();
}