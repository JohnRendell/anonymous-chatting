//Server side
const express = require('express');
const http = require('http');
const{ Server }= require('socket.io');

const app = express();
const expressServer = http.createServer(app);
const server = new Server(expressServer);

//get the root directory
app.use(express.static(__dirname + '/../'));

// Serve the main page or client-side JavaScript file
app.get('/', (req, res) => {
  res.sendFile(__dirname + 'socketFunction.js');
});

//array list for the users
const availableList = [];

//array for two users, if both accepted
const pairList = [];

//associative array for temporary host
const candidateMatch = [];

//associative array for group rooms
const availableRoom = [];

//Array for active users
const activeUsersID = []

server.on('connect', socket=>{ 
    console.log(socket.id.substring(0,3) + " is connected");

    //add to active socket, so that the ID will be displayed
    socket.on('add-to-active', (user)=>{
        var userAcc = { name: user, socketID: socket.id };

        const activeUndefined = JSON.stringify(activeUsersID.findIndex(name => undefined == name['name']));

        //if the activeIDs has undefined, override it
        if(activeUndefined > -1){
            activeUsersID[activeUndefined]['name'] = user;
            activeUsersID[activeUndefined]['socketID'] = socket.id;
        }
        //if its clear then push a new one
        else{
            activeUsersID.push(userAcc);
        }
        socket.emit('add-to-active', socket.id);
    })

    //when user cancel a match
    socket.on('cancel-match', ()=>{
        availableList[0] = [];
        candidateMatch[0] = [];
    })

    //find available user
    //set a delay for executing functions
    function delay(ms){
        return new Promise(response => setTimeout(response , ms));
    }

    socket.on('find-user', async (user, roomID, socketID)=>{
        //check if the ID is match, this is to ensure that the server not restarted yet
        let filterID = JSON.stringify(activeUsersID.findIndex(ID => socketID == ID['socketID']));
        if(filterID == -1){
            socket.emit('force-reload');            
        }
        const findMatch = async ()=>{
            var userInfo = { socketID: socket.id, name: user };
            let foundMatch = false;
            
            //Add the data to the array
            var room = { socketID: socket.id, tempUser: user, room: roomID };

            //check if array list is empty
            if(availableList.length == 0){
                availableList.push(userInfo);
                candidateMatch.push(room);
            }

            //if array is more than 1, check if the user is already there
            if(availableList.length > 0){
                for(let i = 0; i < availableList.length; i++){
                    if(socket.id != availableList[i]['socketID']){
                        availableList.push(userInfo);

                        if(candidateMatch.length > 0){
                            room = { socketID: socket.id, tempUser: user, room: candidateMatch[0]['room'] }
                        }
                        candidateMatch.push(room);
                        break;
                    }
                }
            }
            
            //check if there is available client
            for(let i = 0; i < availableList.length; i++){
                if(socket.id != availableList[i]['socketID']){
                    foundMatch = true;
                    break;
                }
            }

            if(foundMatch){
                //clear out the arrays
                setTimeout(() => {
                     availableList.length = 0;
                }, 1000);

                //remove temporary match
                setTimeout(() => {
                    candidateMatch.length = 0;
                }, 1000);
                
                //join the two user to the unique room
                let index = JSON.stringify(candidateMatch.findIndex(socketID => socket.id != socketID['socketID']));

                socket.emit('found-match', candidateMatch[index]['tempUser'], candidateMatch[0]['room'], candidateMatch[index]['socketID']);
                foundMatch = false;
            }
            else{
                //try again after not finding a user
                await delay(1000);
                await findMatch();
            }
        }
        await findMatch();
    })

    //check if two user accepted
    socket.on('validate-user', (user, roomID)=>{
        var room = { match1: user, match2: null, room: roomID }

        const waitForBothAccept = ()=>{
            let roomFound = false;

            //check user room is match to the user2 room
            for(let i = 0; i < pairList.length; i++){
                if(roomID == pairList[i].room){
                    pairList[i]['match2'] = user;
                    roomFound = true;
                    
                    socket.emit('both-accept', pairList[i]['match1'], pairList[i]['match2'], pairList[i]['room']);
                    break;
                }
            }
            if(roomFound == false){
                pairList.push(room);
            }
        }
        waitForBothAccept();
    })

    //Stuff that is related to room
    socket.on('create-room', (roomName, roomCapacity, socketID)=>{
        try{
            var room = { roomName: roomName, members: [], roomCapacity: roomCapacity, available: 0 };
            const roomList = JSON.stringify(availableRoom.find(groupName => roomName == groupName['roomName']));

            //check if room name is taken
            if(roomList){
                //bring the pop up socket
                socket.emit('invalid-room', roomName, 'room taken');
            }

            //if the room is available, then push it to the array
            else{
                //get the name of the user
                let index = JSON.stringify(activeUsersID.findIndex(socketID => socket.id == socketID['socketID']));
                let joinedRoomUser = activeUsersID[index]['name'];

                //check if there is undefined element
                const checkUndefinedIndex = JSON.stringify(availableRoom.findIndex(grpRoom => undefined == grpRoom['roomName']));
                
                if(checkUndefinedIndex > -1){
                    availableRoom[checkUndefinedIndex]['roomName'] = roomName;
                    availableRoom[checkUndefinedIndex]['members'].push(socketID);
                    availableRoom[checkUndefinedIndex]['roomCapacity'] = roomCapacity;
                    availableRoom[checkUndefinedIndex]['available'] = 1;

                    socket.join(roomName);
                    socket.emit('connect-room', roomName, availableRoom[checkUndefinedIndex]['roomCapacity'],availableRoom[checkUndefinedIndex]['available'], joinedRoomUser);
                }
                //if there is none
                else{
                    availableRoom.push(room);

                    //find the index of the room
                    const roomIndex = JSON.stringify(availableRoom.findIndex(groupName => roomName == groupName['roomName']));

                    //push the user
                    availableRoom[roomIndex]['members'].push(socketID);
                    availableRoom[roomIndex]['available']++;

                    socket.join(roomName);
                    socket.emit('connect-room', roomName, availableRoom[roomIndex]['roomCapacity'],availableRoom[roomIndex]['available'], joinedRoomUser);
                }
            }
        } catch{
            //if one of those index are undefined, then the client will catch here notifying that the server is restarted
            socket.emit('force-reload');
        }
    })

    //for finding available room
    socket.on('find-room', (roomName, socketID)=>{
        try{
            //check if there is available room
            const roomCheck = JSON.stringify(availableRoom.find(name => roomName == name['roomName']));

            if(roomCheck == undefined){
                socket.emit('invalid-room', roomName, 'not exist');
            }
            else{
                //if there is a room available, check if that room is full or not
                const indexRoom = JSON.stringify(availableRoom.findIndex(name => roomName == name['roomName']));
                let memberCap = availableRoom[indexRoom]['members'].length;

                //if the room is already full, notify the user
                if(memberCap >= availableRoom[indexRoom]['roomCapacity']){
                    socket.emit('invalid-room', roomName, 'room full');
                }

                //if not, then push the user
                else{
                    availableRoom[indexRoom]['members'].push(socketID);

                    //join now the user
                    availableRoom[indexRoom]['available'] = availableRoom[indexRoom]['members'].length;

                    //get the name of the user
                    let index = JSON.stringify(activeUsersID.findIndex(socketID => socket.id == socketID['socketID']));

                    //check if the joined user is undefined, if not then continue the operation
                    let joinedRoomUser = activeUsersID[index]['name'];

                    socket.join(roomName);
                    socket.emit('join-group-room', roomName, availableRoom[indexRoom]['roomCapacity'], availableRoom[indexRoom]['available'], joinedRoomUser, activeUsersID[index]['socketID']);
                }
            }
        } catch{
            //if one of those index are undefined, then the client will catch here notifying that the server is restarted
            socket.emit('force-reload');
        }
    })

    //for user who left the room
    socket.on('leave-group-chat', (roomName, maxCap, socketID)=>{
        try{
            socket.leave(roomName);

            //find the room ID
            let indexMember = JSON.stringify(availableRoom.findIndex(room => roomName == room['roomName']));
            const members = availableRoom[indexMember]['members'];

            //update the group chat members
            const userIndex = JSON.stringify(activeUsersID.findIndex(ID => socketID == ID['socketID']));
       
            if(userIndex > -1){
                socket.to(roomName).emit('notify-group-chat', roomName, maxCap, (members.length - 1), activeUsersID[userIndex]['name'], 'leave');
            }

            //splice the member array
            const userIndexMember = members.indexOf(socketID);

            if(userIndexMember > -1){
                members.splice(userIndexMember, 1);
            }

            //check if the room has no members left
            if(members.length == 0){
                //if room has zero members, clear it by setting all inputs to null or undefined
                const roomIndex = JSON.stringify(availableRoom.findIndex(grpRoom => roomName == grpRoom['roomName']));

                availableRoom[roomIndex]['roomName'] = undefined;
                availableRoom[roomIndex]['members'] = [];
                availableRoom[roomIndex]['roomCapacity'] = 0;
                availableRoom[roomIndex]['available'] = 0;
            }
        } catch{
            socket.emit('force-reload');
        }
    })

    //for notify the group, joining room
    socket.on('notify-group-chat', (roomName, maxCap, available, user, status)=>{
        socket.to(roomName).emit('notify-group-chat', roomName, maxCap, available, user, status);
    })

    //for user joining
    socket.on('join-group-room', (roomName, maxCap, available, user, socketID)=>{
        socket.emit('join-group-room', roomName, maxCap, available, user, socketID);
    })

    //if the room is invalid, this include if room has same name, not exist, or full
    socket.on('invalid-room', (roomName, status)=>{
        socket.emit('invalid-room', roomName, status);
    })

    //if room successfully created
    socket.on('connect-room', (roomName, maxCap, available)=>{
        socket.to(roomName).emit('connect-room', roomName, maxCap, available);
    })

    //for sending a message to a group chat
    socket.on('group-message', (user, message, roomName, socketID)=>{
        //check if the ID is present on the list, if not we will force the users to reload because server is restarted
        let filterUser = JSON.stringify(activeUsersID.findIndex(ID => socketID == ID['socketID']));
        if(filterUser == -1){
            socket.emit('force-reload');
        }
        socket.to(roomName).emit('group-message', user, message);
    });

    //for restarting the server, notify the user
    socket.on('force-reload', ()=>{
        socket.emit('force-reload');
    })

    //end of room stuff----------------------------------------------

    //for the found match, to alert specific users
    socket.on('found-match', (user, roomID, socketID)=>{
        socket.on(roomID).emit('found-match', user, roomID, socketID);
    })

    //to let user join in a room
    socket.on('join-room', (roomID)=>{
        socket.join(roomID);
    })

    //if user left private room
    socket.on('leave-room', (user, roomID)=>{
        socket.leave(roomID);
    })

    //if user decline match, notify the other end
    socket.on('decline-match', (user, roomID)=>{
        socket.to(roomID).emit('decline-match', user, roomID);
    })

    //if both user accepted
    socket.on('both-accept', (user, match, roomID)=>{
        socket.to(roomID).emit('both-accept', user, match, roomID);
    })

    //if all paired users is good, then start chatting
    socket.on('start-message', (user, match, roomID)=>{
        server.to(roomID).emit('start-message', user, match, roomID);
    })

    //if a user send a message that will be receive by the client, this is only for private chatting
    socket.on('private-message', (user, message, roomID, socketID)=>{
        //check if the ID is present on the list, if not we will force the users to reload because server is restarted
        let filterUser = JSON.stringify(activeUsersID.findIndex(ID => socketID == ID['socketID']));
        if(filterUser == -1){
            socket.emit('force-reload');
        }
        socket.to(roomID).emit('private-message', user, message, roomID);
    })

    //if user disconnect to the server
    socket.on('user-disconnect-server', (user, roomID)=>{
        const userIndex = JSON.stringify(availableList.indexOf(name => user == name['tempName']));
        const activeMemberIndex = JSON.stringify(activeUsersID.findIndex(ID => socket.id == ID['socketID']));

        //for removing tempUser
        if(userIndex > -1){
            availableList.splice(userIndex, 1)
        }

        socket.to(roomID).emit('user-disconnect-server', user);

        //set the element to undefined
        const checkingActiveIndex = ()=>{
            if(activeMemberIndex > -1){
                //set the info to undefine
                activeUsersID[activeMemberIndex]['name'] = undefined;
                activeUsersID[activeMemberIndex]['socketID'] = undefined;
            }
        }
        checkingActiveIndex();
    })

    //hide the stuff whenever the user disconnect the chat
    socket.on('user-left-chat', (room, user)=>{
        socket.leave(room);
        socket.to(room).emit('user-left-chat', room, user);
    })

    socket.on('disconnect', ()=>{
        socket.disconnect();
    })
})

//require the path for env port
require('dotenv').config({ path: require('path').resolve(__dirname, '../port.env') });
const PORT = process.env.PORT;
expressServer.listen(PORT, ()=>{
    console.log('Listening to port ' + PORT);
})