const chatform = document.getElementById("chat-form")
const socket = io();

const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


//Get username and room from url

const { username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

socket.emit('joinRoom',{username,room});

//Get Room and Users 
socket.on('roomUsers', ({ room, users }) =>{
    outputRoomName(room);
    outputUsers(users)
});

// Get room messages
socket.on('roomMessages', (messages) => {
    console.log("Room Messages:", messages);
    displayRoomMessages(messages);
});

socket.on('message',(message) =>{
    console.log(message);
    //message from server
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
//e stands dor event e.preventdefault so it doesnt submit to a file and target is current element
chatform.addEventListener('submit',(e)=>{
    e.preventDefault();
    //Get message text grom form in chat.html and message is the id of the message form 
    const msg = e.target.elements.msg.value;
    //Emit message to the server
    socket.emit('chatMessage',msg);
    //clear input
    e.target.elements.msg.value = '';
    e.target.element.msg.focus();//The focus method ensures that the cursor remains in the input field,

});

function displayRoomMessages(messages) {
    chatMessages.innerHTML = ''; // Clear previous messages
    messages.forEach((message) => {
        outputMessage(message);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the latest message
}

//output message to DOM
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span> ${message.time}</span></p>
						<p class="text">
							${message.text}
						</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}
 //add room name to doc
function outputRoomName(room){
    roomName.innerText = room;
}

function outputUsers(users){
    userList.innerHTML=`
    ${users.map(user => `<li>${user.username}</li>`).join('')}`;
    
}