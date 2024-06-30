import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

socket.on('connect', () => {
  console.log(`connected ${socket.id}`);

  socket.emit('test', { message: 'Hello, server!' });
});

socket.on('test:received', (data) => {
  console.log('Received test:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});
