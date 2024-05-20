const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {           // web socket server
    cors: {
        origin: "*",
    },
}); 

app.use(cors());

const userSocketMap = {};

function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}


io.on('connection', function(socket){
    console.log('socket connected' , socket.id);

    socket.on('join', ({roomId, username}) => {
        userSocketMap[socket.id]=username;
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit('joined', {
                clients,
                username,
                socketId : socket.id,
            })
        })
    })

    socket.on('code-change', ({roomId,code}) => {
        socket.to(roomId).emit('code-change', {code});  //socket.in
    })
    socket.on('sync-code', ({socketId, code}) => {
        io.to(socketId).emit('code-change', {code});
    })

    socket.on('mssg', ({user, mssg, roomId}) => {
        socket.in(roomId).emit('mssg', {user,mssg});
    })

    socket.on('lang', ({lang, roomId}) => {
        socket.in(roomId).emit('lang', {lang});
    })
    socket.on("input-change", ({ inp, roomId }) => {
        socket.to(roomId).emit("input-change", { inp });  //socket.in
    });

    socket.on("output-change", ({ out, roomId }) => {
        socket.in(roomId).emit("output-change", { out });
    });

    socket.on("sync-lang", ({ socketId, lang }) => {
        io.to(socketId).emit("lang", { lang });
    });

    socket.on("sync-input", ({ socketId, inp }) => {
        io.to(socketId).emit("input-change", { inp});
    });

    socket.on("sync-output", ({ socketId, out }) => {
        io.to(socketId).emit("output-change", { out});
    });

    socket.on("sync-mssg", ({ allMssg,socketId }) => {
        io.to(socketId).emit("all-mssg", allMssg);
    });


    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms]; // getting all the rooms to which this socket is connected & converting the retrieved data into an array
        rooms.forEach((roomId) => {
            socket.to(roomId).emit('disconnected', {   //socket.in
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
        console.log(`socket ${socket.id} disconnected`);
    });

})

app.get('/', (req, res) => {
    res.json({msg:"hello there"});
})


server.listen(3000, () => {
    console.log(`web server listening on port eb socket 3000`);
})