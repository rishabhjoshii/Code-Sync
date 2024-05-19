import { io } from "socket.io-client";

export const initSocket =  async function(){
    const options = {
        'force new connection': true,
        reconnectionAttempt : "Infinity",
        timeout: 10000,
        transports: ['websocket'],
    };

    return io("http://localhost:3000/", options);
}