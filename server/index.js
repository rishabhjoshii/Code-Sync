const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);

const wss = new Server(server); // web socket server

wss.on('connection', function(socket){
    console.log('socket connected' , socket.id);
})



server.listen(3000, () => {
    console.log(`web server listening on port eb socket 3000`);
})