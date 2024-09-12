//change theme per click
let isDark = true;

function changeTheme(){
    if(isDark){
        //change the background
        document.body.style.backgroundColor = "rgba(18, 18, 18, 0.8)";

        //for the header
        var headerContainer = document.getElementById('header-title');

        for(let i = 0; i < headerContainer.childElementCount; i++){
            var child = headerContainer.children[i];
            child.style.color = "white";
        }
        document.getElementById('nickname').style.color = "white";
        document.getElementById('socket').style.color = "white";

        //for find and join chat
        document.getElementById('find-chat-p').style.color = "white";

        //for the room inputs stuff
        document.getElementById('createRoomLabel').style.color = "white";
        document.getElementById('limitLabel').style.color = "white";
        document.getElementById('createRoomInput').style.borderColor = "white";
        document.getElementById('createRoomInput').style.color = "white";
        document.getElementById('createRoomInput').style.backgroundColor = "transparent";
        document.getElementById('createRoomMaxGroup').style.borderColor = "white";
        document.getElementById('createRoomMaxGroup').style.color = "white";
        document.getElementById('createRoomMaxGroup').style.backgroundColor = "transparent";

        document.getElementById('joinRoomLabel').style.color = "white";
        document.getElementById('roomInput').style.borderColor = "white";
        document.getElementById('roomInput').style.color = "white";
        document.getElementById('roomInput').style.backgroundColor = "transparent";

        //for message inputs
        document.getElementById('messageInput').style.borderColor = "white";
        document.getElementById('messageInput').style.color = "white";
        document.getElementById('messageInput').style.backgroundColor = "transparent";

        //for the message container
        document.getElementById('conversation-container').style.borderColor = "white";

        //credits
        document.getElementById('credit').style.color = "white";

        //change the icon
        document.getElementById('toggle-theme').style.color = "white";
        document.getElementById('toggle-theme').style.borderColor = "white";
        document.getElementById('toggle-theme').innerHTML = '<i class="fa fa-sun-o fa-2x"></i>';

        isDark = false;
    }
    else{
        //change the background
        document.body.style.backgroundColor = "#f5f5f5";

        //for the header
        var headerContainer = document.getElementById('header-title');

        for(let i = 0; i < headerContainer.childElementCount; i++){
            var child = headerContainer.children[i];
            child.style.color = "#121212";
        }
        document.getElementById('nickname').style.color = "#121212";
        document.getElementById('socket').style.color = "#121212";

        //for find and join chat
        document.getElementById('find-chat-p').style.color = "#121212";

        //for the room inputs stuff
        document.getElementById('createRoomLabel').style.color = "#121212";
        document.getElementById('limitLabel').style.color = "#121212";
        document.getElementById('createRoomInput').style.borderColor = "#121212";
        document.getElementById('createRoomInput').style.color = "#121212";
        document.getElementById('createRoomInput').style.backgroundColor = "white";
        document.getElementById('createRoomMaxGroup').style.borderColor = "#121212";
        document.getElementById('createRoomMaxGroup').style.color = "#121212";
        document.getElementById('createRoomMaxGroup').style.backgroundColor = "white";

        document.getElementById('joinRoomLabel').style.color = "#121212";
        document.getElementById('roomInput').style.borderColor = "#121212";
        document.getElementById('roomInput').style.color = "#121212";
        document.getElementById('roomInput').style.backgroundColor = "white";

        //for message inputs
        document.getElementById('messageInput').style.borderColor = "#121212";
        document.getElementById('messageInput').style.color = "#121212";
        document.getElementById('messageInput').style.backgroundColor = "white";

        //for the message container
        document.getElementById('conversation-container').style.borderColor = "#121212";

        //credits
        document.getElementById('credit').style.color = "#121212";

        //change the icon
        document.getElementById('toggle-theme').style.color = "#121212";
        document.getElementById('toggle-theme').style.borderColor = "#121212";
        document.getElementById('toggle-theme').innerHTML = '<i class="fa fa-moon-o fa-2x"></i>';

        isDark = true;
    }
}

//if user is active, remove the div pop up and reset the timer
let idleTimeout;

function yes(){
    closePopUp();
    clearTimeout(idleTimeout);

    setTimeout(() => {
        userIdle();
    }, 1000);
}

//if user is idle, force reload the page
function userIdle(){
    const idle = () =>{
        var popUp = document.createElement('div');
        popUp.setAttribute('class', 'flex justify-center items-center w-full h-full');
        popUp.setAttribute('id', 'popUpDiv');
        document.body.appendChild(popUp);

        var contentWrapper = document.createElement('div');
        contentWrapper.setAttribute('id', 'popUpContent');
        contentWrapper.setAttribute('class', 'absolute top-[-5rem] border-2 border-[#121212] p-4 w-[20rem] h-fit bg-white rounded-[2rem] flex items-center flex-col space-y-2');
        popUp.appendChild(contentWrapper);

        var pContent = document.createElement('p');
        pContent.setAttribute('class', 'text-center text-[#121212]');
        pContent.appendChild(document.createTextNode("You still there?"));
        contentWrapper.appendChild(pContent);

        var yesBtn = document.createElement('button');
        yesBtn.setAttribute('class', 'text-[#F5F5F5] font-bold rounded-[2rem] bg-[#F05454] text-[12px] px-4 py-1 active:bg-[#30475E] md:text-lg');
        yesBtn.appendChild(document.createTextNode('Yes'));
        yesBtn.setAttribute('onclick', 'yes()');
        contentWrapper.appendChild(yesBtn);

        //set timeout for force reloading page with clear cache if the user didn't respond within 30 secs
        idleTimeout = setTimeout(() => {
            location.reload(true);
            window.history.forward(1);
        }, 30000);
    }

    //start the timeout at five minutes
    idleTimeout = setTimeout(() => {
        idle();
    }, 5 * 60 * 1000);
}

//for submitting the user name
function submitNickname(){
    let promptInput = document.getElementById('prompt-input');

    //function for checking whitespace
    const checkWhitespace = (str)=>{
        return /\s/.test(str);
    }

    if(checkWhitespace(promptInput.value)){
        document.getElementById('warningText').innerText = 'set a proper nickname! It should not have any whitespace on it.';
        document.getElementById('prompt-input').style.borderColor = '#F05454';
    }
    else if(promptInput.value.length <= 3){
        document.getElementById('warningText').innerText = 'Make at least 4 character long username.';
        document.getElementById('prompt-input').style.borderColor = '#F05454';
    }
    else{
        let username = promptInput.value;
        sessionStorage.setItem('name', username);
        document.getElementById('nickname').innerText = "Nickname: " + sessionStorage.getItem('name');
        document.getElementById('prompt-div').style.display = "none";
        document.getElementById('saving-nickname').value = sessionStorage.getItem('name');
    }
}