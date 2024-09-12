//client side
const socket = io();

socket.on('connect', ()=>{
    console.log('client-connected');
})

//saving socket ID to the html
socket.on('add-to-active', (ID)=>{
    document.getElementById('socket').innerText = "Socket ID: " +  ID.substring(0, 5);
    sessionStorage.setItem('socketID', ID);

    document.getElementById('saving-socket').value = ID;
})

//for setting up private room for candidate user or private match user
function generateRoom(code, limit){
    //generate random string
    const stringGenerate = ()=>{
        const string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        const stringLength = string.length;
        let counter = 0;
        let generateCode = '';

        while(counter < limit){
            generateCode += string.charAt(Math.floor(Math.random() * stringLength));
            counter += 1;
        }
        return generateCode;
    }

    //temp room for candidate user
    return code + stringGenerate(3);
}

//for real time stuff
//if both user accept each other
socket.on('both-accept', (user, match, roomID)=>{
    socket.emit('start-message', user, match, roomID);
})

//if both user find each other, notify both
socket.on('found-match', (user, roomID, socketID)=>{
    if(roomID != null){
        //set the temp room for candidate users
        sessionStorage.setItem('privateRoomID', roomID);

        //set session for matched user
        sessionStorage.setItem('matchedUser', user);

        //join both users
        socket.emit('join-room', sessionStorage.getItem('privateRoomID'));

        //hide the finding text
        document.getElementById('finding-user-div').style.display = "none";

        //append the container
        var container = document.getElementById('conversation-container');

        //div container
        var divBox = document.createElement('div');
        divBox.setAttribute('class', 'bg-white w-full p-4 rounded-[2rem] h-fit flex flex-col justify-center space-y-2 items-center');
        divBox.setAttribute('id', 'match-div-' + user);
        container.appendChild(divBox);

        //div label
        var divP = document.createElement('p');
        divP.setAttribute('class', 'text-[#121212] text-center font-bold text-lg');
        divP.appendChild(document.createTextNode('You match with ' + user));

        var divP2 = document.createElement('p');
        divP2.setAttribute('class', 'text-[#121212] text-center font-normal text-sm');
        divP2.appendChild(document.createTextNode("socketID: " + socketID))
        divBox.appendChild(divP);

        var divider = document.createElement('hr');
        divider.setAttribute('class', 'border-solid border-2 bt-[2rem] bg-red-500')
        divBox.appendChild(divider);
        divBox.appendChild(divP2);

        //div button container
        var divButton = document.createElement('div');
        divButton.setAttribute('class', 'flex justify-between space-x-4');
        divBox.appendChild(divButton);

        //div button
        var divAcceptBtn = document.createElement('button');
        divAcceptBtn.setAttribute('class', 'text-[#F5F5F5] font-bold rounded-[2rem] bg-[#F05454] text-[12px] px-4 py-1 active:bg-[#30475E] md:text-lg');
        divAcceptBtn.setAttribute('id', "acceptBtn_" + user);
        divAcceptBtn.setAttribute('onclick', 'acceptUser("acceptBtn_' + user + '", "' + user + '")');
        divAcceptBtn.appendChild(document.createTextNode('Accept'));
        divButton.appendChild(divAcceptBtn);

        var divDeclineBtn = document.createElement('button');
        divDeclineBtn.setAttribute('class', 'text-[#F5F5F5] font-bold rounded-[2rem] bg-[#F05454] text-[12px] px-4 py-1 active:bg-[#30475E] md:text-lg');
        divDeclineBtn.setAttribute('onclick', 'declineUser("match-div-' + user + '", "' + roomID + '")');
        divDeclineBtn.appendChild(document.createTextNode('Decline'));
        divButton.appendChild(divDeclineBtn);
    }
})

//if both user accepted, then establish connection both on them
socket.on('start-message', (user, match, roomID)=>{
    //hide the create room
    document.getElementById('chatRoomDiv').style.display = "flex";
    document.getElementById('hideGroupRoom').style.display = 'none';

    //activate the border and the message
    document.getElementById('conversation-container').style.borderStyle = "solid";
    document.getElementById('conversation-container').style.borderWidth = "2px";
    document.getElementById('message-div').style.display = "flex";

    //add the room container
    var messageContainer = document.createElement('div');
    messageContainer.setAttribute('class', 'w-full h-[90%] overflow-y-auto overflow-x-hidden flex flex-col space-y-4');
    messageContainer.setAttribute('id', 'message-container');
    document.getElementById('conversation-container').appendChild(messageContainer);

    //remove the match div
    if(document.getElementById('conversation-container').contains(document.getElementById('match-div-' + match))){
        document.getElementById('match-div-' + match).remove();
    }
    if(document.getElementById('conversation-container').contains(document.getElementById('match-div-' + user))){
        document.getElementById('match-div-' + user).remove();
    }

    //append the container
    var container = document.getElementById('message-container');

    //div container
    var divStatus = document.createElement('div');
    divStatus.setAttribute('class', 'rounded-[2rem] bg-white w-full h-fit p-2');
    container.appendChild(divStatus);

    //div label
    var divLabel = document.createElement('p');
    divLabel.setAttribute('class', 'text-center');
    divLabel.appendChild(document.createTextNode(user + ' and ' + match + ' are connected'));

    var lineBreak = document.createElement('hr');
    var roomCodeLabel = document.createElement('p');
    roomCodeLabel.setAttribute('class', 'text-center text-sm');
    roomCodeLabel.appendChild(document.createTextNode('Room code: ' + roomID))
   
    divStatus.appendChild(divLabel);
    divStatus.appendChild(lineBreak);
    divStatus.appendChild(roomCodeLabel);
})

//for pop up div
function closePopUp(){
    document.getElementById('popUpDiv').remove();
}

function popUpDiv(text){
    var popUp = document.createElement('div');
    popUp.setAttribute('class', 'flex justify-center items-center w-full h-full');
    popUp.setAttribute('id', 'popUpDiv');
    document.body.appendChild(popUp);

    var contentWrapper = document.createElement('div');
    contentWrapper.setAttribute('id', 'popUpContent');
    contentWrapper.setAttribute('class', 'absolute top-[-5rem] border-2 border-[#121212] p-4 w-[20rem] h-fit bg-white rounded-[2rem] flex items-center flex justify-between');
    popUp.appendChild(contentWrapper);

    var pContent = document.createElement('p');
    pContent.setAttribute('class', 'text-center text-[#121212]');
    pContent.appendChild(document.createTextNode(text));
    contentWrapper.appendChild(pContent);

    var closeBtn = document.createElement('i');
    closeBtn.setAttribute('class', 'fa fa-close fa-1x text-[#121212] float-right');
    closeBtn.setAttribute('onclick', 'closePopUp()');
    contentWrapper.appendChild(closeBtn);
}

//if one user decline, notify other end
socket.on('decline-match', (match, roomID)=>{
    popUpDiv(match + ' decline your request :(');

    //if the user already on the private room
    if(sessionStorage.getItem('privateRoomID')){
        //leave the user to room
        socket.emit('leave-room', sessionStorage.getItem('name'), sessionStorage.getItem('privateRoomID'));
    }

    //reset the session private room and matched session
    sessionStorage.setItem('privateRoomID', null);
    sessionStorage.setItem('matchedUser', null);

    const removeDiv = ()=>{
        document.getElementById('chatRoomDiv').style.display = "none";

        let messageDiv = document.getElementById('conversation-container').contains(document.getElementById('message-container'));
        let matchDiv = document.getElementById('conversation-container').contains(document.getElementById('match-div-' + sessionStorage.getItem('name')));
        let matchDiv2 = document.getElementById('conversation-container').contains(document.getElementById('match-div-' + match));
        
        //for match div
        if(matchDiv){
            document.getElementById('match-div-' + sessionStorage.getItem('name')).remove();
        }

        else if(matchDiv2){
            document.getElementById('match-div-' + match).remove();
        }

        //for message div
        else if(messageDiv){
            document.getElementById('message-container').remove();
        }

        else{
            setTimeout(() => {
                removeDiv();
            }, 1000);
        }
         document.getElementById('find-chat-div').style.display = "flex";
    }
    removeDiv();
})

//if user disconnect private chat
socket.on('user-left-chat', (room, user)=>{
    popUpDiv(user + ' left the chat.');

    sessionStorage.setItem('privateRoomID', null);

    //Remove border and the message inputs
    document.getElementById('conversation-container').style.borderStyle = "none";
    document.getElementById('message-div').style.display = "none";

    //hide the create room
    document.getElementById('chatRoomDiv').style.display = "none";
    document.getElementById('hideGroupRoom').style.display = 'flex';

    document.getElementById('find-chat-div').style.display = 'flex';
    document.getElementById('message-container').remove();
})

//notify if user left the chat room or server
socket.on('user-disconnect-server', (user)=>{
    popUpDiv(user + ' disconnected');
    socket.emit('leave-room', user, sessionStorage.getItem('privateRoomID'));

    //removing match div
    let matchDiv = document.getElementById('conversation-container').contains(document.getElementById('match-div-' + user));
    let messageDiv = document.getElementById('conversation-container').contains(document.getElementById('message-container'));

    if(messageDiv){
        document.getElementById('message-container').remove();
    }

    if(matchDiv){
        document.getElementById('match-div-' + user).remove();
    }

    //hide the create room
    document.getElementById('chatRoomDiv').style.display = "none";
    document.getElementById('hideGroupRoom').style.display = 'flex';
    document.getElementById('find-chat-div').style.display = 'flex';
})

//this is when the user receive a message to the sender
socket.on('private-message', (user, message)=>{
    var messageContainer = document.getElementById('message-container');

    //append the user message
    var messageDiv = document.createElement('div');
    messageDiv.setAttribute('class', 'flex justify-start');
    messageContainer.appendChild(messageDiv);

    //this is the div that wrap the message and user
    var messageWrap = document.createElement('div');
    messageWrap.setAttribute('class', 'border-2 border-[#121212] w-[30rem] h-auto py-2 px-4 bg-[#30475E] rounded-[2rem] text-wrap');
    messageDiv.appendChild(messageWrap);

    //the sender
    var messageSender = document.createElement('p');
    messageSender.setAttribute('class', 'font-bold text-white');
    messageSender.appendChild(document.createTextNode(user + ": "));
    messageWrap.appendChild(messageSender);

    //the message
    var mainMessage = document.createElement('p');
    mainMessage.setAttribute('class', 'text-white break-words');
    mainMessage.appendChild(document.createTextNode(message));
    messageWrap.appendChild(mainMessage);

    messageContainer.scrollTo(0, messageContainer.scrollHeight); //scroll to bottom
})

//alert all users who currently on a group room
function updateRoomStatus(roomName, maxCap, available, user){
    //hide the find div section
    document.getElementById('find-chat-div').style.display = "none";

    //hide the finding match section
    document.getElementById('finding-user-div').style.display = "none";

    //remove find match div/s
    document.getElementById('match-div-' + sessionStorage.setItem('matchedUser', user));

    //add the room container
    var messageContainer = document.createElement('div');
    messageContainer.setAttribute('class', 'w-full h-[90%] overflow-y-auto overflow-x-hidden flex flex-col space-y-4');
    messageContainer.setAttribute('id', 'groupMessageDiv');
    document.getElementById('conversation-container').appendChild(messageContainer);

    //append the container
    var container = document.getElementById('groupMessageDiv');

    //div container
    var divStatus = document.createElement('div');
    divStatus.setAttribute('class', 'rounded-[2rem] bg-white w-full h-fit p-2');
    container.appendChild(divStatus);

    //div label
    var divLabel = document.createElement('p');
    divLabel.setAttribute('class', 'text-center font-bold');
    divLabel.appendChild(document.createTextNode('Room: ' + roomName));

    var lineBreak = document.createElement('hr');
    var roomCodeLabel = document.createElement('p');
    roomCodeLabel.setAttribute('class', 'text-center text-sm');
    roomCodeLabel.setAttribute('id', 'groupCodeCapLabel')
    roomCodeLabel.appendChild(document.createTextNode('Capacity : ' + available + '/' + maxCap))
   
    divStatus.appendChild(divLabel);
    divStatus.appendChild(lineBreak);
    divStatus.appendChild(roomCodeLabel);
}

//alert user if the room is invalid
socket.on('invalid-room', (roomName, status)=>{
    switch(status){
        case 'not exist':
            popUpDiv('Room: ' + roomName + ' didn\'t exist.');
        break;

        case 'room taken':
            popUpDiv('Room: ' + roomName + ' is already taken.');
        break;

        case 'room full':
            popUpDiv('Room: ' + roomName + ' is full.');
        break;
    }
})

//alert user if the user created a room successfully
socket.on('connect-room', (roomName, maxCap, available, user)=>{
    //activate the border and the message
    document.getElementById('conversation-container').style.borderStyle = "solid";
    document.getElementById('conversation-container').style.borderWidth = "2px";
    document.getElementById('message-div').style.display = "flex";

    document.getElementById('hideGroupRoom').style.display = 'none';
    document.getElementById('groupRoomDiv').style.display = 'flex';

    popUpDiv('Room: ' + roomName + ' created successfully');

    sessionStorage.setItem('privateRoomID', null);

    //join the user to the new room created
    sessionStorage.setItem('groupRoom', roomName);
    updateRoomStatus(roomName, maxCap, available, user);
})

//for notifying user in a group chat, if someone join or left
socket.on('notify-group-chat', (roomName, maxCap, available, user, status)=>{
    if(status == "join"){
        popUpDiv(user + ' joined');
    }
    else{
        popUpDiv(user + ' left');
    }
    
    //override the sessions
    sessionStorage.setItem('maxCap', maxCap)
    sessionStorage.setItem('available', available);

    //remove the match div if the match div is there
    if(document.getElementById('conversation-container').contains(document.getElementById('match-div-' + sessionStorage.getItem('name')))){
        document.getElementById('match-div-' + sessionStorage.getItem('name')).remove();
    }
    if(document.getElementById('conversation-container').contains(document.getElementById('match-div-' + user))){
        document.getElementById('match-div-' + user).remove();
    }
    document.getElementById('groupCodeCapLabel').innerText = 'Capacity : ' + available + '/' + maxCap;
})

//if user joined the room
socket.on('join-group-room', (roomName, maxCap, available, user, socketID)=>{
    document.getElementById('hideGroupRoom').style.display = 'none';
    document.getElementById('groupRoomDiv').style.display = 'flex';

    //activate the border and the message
    document.getElementById('conversation-container').style.borderStyle = "solid";
    document.getElementById('conversation-container').style.borderWidth = "2px";
    document.getElementById('message-div').style.display = "flex";

    //set the private session to null
    sessionStorage.setItem('privateRoomID', null);

    //save other group room components
    sessionStorage.setItem('groupRoom', roomName);
    sessionStorage.setItem('maxCap', maxCap)
    sessionStorage.setItem('available', available);

    socket.emit('notify-group-chat', roomName, maxCap, available, user, 'join');
    updateRoomStatus(roomName, maxCap, available, user);
})

//for receiving a message to a group chat
socket.on('group-message', (user, message)=>{
    var messageContainer = document.getElementById('groupMessageDiv');

    //append the user message
    var messageDiv = document.createElement('div');
    messageDiv.setAttribute('class', 'flex justify-start');
    messageContainer.appendChild(messageDiv);

    //this is the div that wrap the message and user
    var messageWrap = document.createElement('div');
    messageWrap.setAttribute('class', 'border-2 border-[#121212] w-[30rem] h-auto py-2 px-4 bg-[#30475E] rounded-[2rem] text-wrap');
    messageDiv.appendChild(messageWrap);

    //the sender
    var messageSender = document.createElement('p');
    messageSender.setAttribute('class', 'font-bold text-white');
    messageSender.appendChild(document.createTextNode(user + ": "));
    messageWrap.appendChild(messageSender);

    //the message
    var mainMessage = document.createElement('p');
    mainMessage.setAttribute('class', 'text-white break-words');
    mainMessage.appendChild(document.createTextNode(message));
    messageWrap.appendChild(mainMessage);

    messageContainer.scrollTo(0, messageContainer.scrollHeight); //scroll to bottom
});

//for notifying the user if the server restarted
socket.on('force-reload', ()=>{
    alert('Server has been restarted, reloading page now...');
    location.reload(true);
    window.history.forward(1);
})