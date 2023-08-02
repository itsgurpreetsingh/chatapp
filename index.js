const express = require('express');
const app = express();
const cors = require('cors');
const server = require('http').createServer(app);
app.use(express.static("public"));
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const users = {};
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
function updateMembersList(room) {
  const membersList = Object.values(users)
    .filter((user) => user.room === room)
    .map((user) => user.name);

  io.to(room).emit('memberlist',{membersList});
}
io.on('connection', (socket) => {
  socket.on('new-user-joined', ({ name, room }) => {
    // console.log(`New user ${name} joined the chat in room ${room}`);
    socket.join(room);
    users[socket.id] = { name, room };
    socket.broadcast.to(room).emit('user-joined', { name });
    // socket.broadcast.to(room).emit('member',{name});
    updateMembersList(room);
  });

  socket.on('sendmsg', ({ message, name, room }) => {
    const user = users[socket.id];
    if (!user) return;

    // console.log(`Message from ${name} in room ${room}:`, message);

    socket.broadcast.to(room).emit('receive', { message, name });
  });

  socket.on('leave room', () => {
    const user = users[socket.id];
    if (!user) return;

    // console.log(`User ${user.name} left room ${user.room}`);
    socket.broadcast.to(user.room).emit('left', { name: user.name });
    socket.leave(user.room);
    delete users[socket.id];
    updateMembersList(user.room);
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (!user) return;

    // console.log(`User ${user.name} disconnected from room ${user.room}`);
    socket.leave(user.room);
    delete users[socket.id];
    updateMembersList(user.room);
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
