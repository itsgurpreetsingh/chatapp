const port= 3000;
const socket = io("https://chat-app-cr7k.onrender.com");
const joinForm = document.getElementById('joinForm');
const messageForm = document.getElementById('send-container');
const messageinput = document.getElementById('messageinput');
const messagecontainer = document.querySelector('.container');
const roomidInput = document.getElementById('roomInput');
const generateIDButton = document.getElementById('generateID');
const members=document.querySelector('.join-form');
let room = ''; // Store the current room ID
let name = '';

const generateUniqueId = () => {
  const uniqueId = Math.random().toString(36).substr(2, 9);
  roomidInput.value = uniqueId;
};

const append = (message, position) => {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageElement.classList.add('message');
  messageElement.classList.add(position);
  messagecontainer.append(messageElement);
};

joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  name = e.target.elements.name.value.trim();
  room = e.target.elements.room.value.trim();

  if (name !== '' && room !== '') {
    socket.emit('new-user-joined', { name, room });
    joinForm.style.display = 'none';
    messageForm.style.display = 'block';
  }
});

generateIDButton.addEventListener('click', (e) => {
  e.preventDefault();
  generateUniqueId();
});
socket.on('memberlist',(name)=>{
  const newmember = document.createElement('div');
  newmember.innerText = name;
  newmember.classList.add('nmember');
  members.append(newmember);
})
socket.on('user-joined', (data) => {
  append(`${data.name} joined the chat`, 'left');
});

socket.on('receive', (data) => {
  append(`${data.name} : ${data.message}`, 'left');
});

socket.on('left', (names) => {
  append(`${names.name} left the chat`, 'left');
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageinput.value;
  if (message.trim() !== '') {
    append(`You: ${message}`, 'right');
    socket.emit('sendmsg', { message, name, room });
    messageinput.value = '';
  }
});
window.addEventListener('beforeunload', () => {
  socket.emit('leave room');
});
roomidInput.addEventListener('change', () => {
  const newRoom = roomidInput.value;
  if (newRoom !== room) {
    socket.emit('leave room');
    socket.emit('join room', newRoom);
    room = newRoom;
  }
});
