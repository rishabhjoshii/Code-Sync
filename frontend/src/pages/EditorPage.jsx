import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client'
import logo from "../assets/logo.png"
import CodeEditor from '../components/CodeEditor'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { initSocket } from '../socket'

const EditorPage = () => {
    const navigate = useNavigate();
    const {roomId} = useParams();
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const [clients, setClients] = useState([]);

    useEffect(()=>{
        const init = async function(){
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(err) {
                console.log('socket error',err);
                toast.error('Socket Connection Failed, try again later.');
                navigate('/');
            }
            
            socketRef.current.emit('join', {
                roomId: roomId,
                username: location.state?.username
            })

            socketRef.current.on('joined', ({clients, username, socketId}) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} has joined the room.`);
                    console.log(`${username} joined`);
                }
                setClients(clients);
                socketRef.current.emit('sync-code', {
                    code: codeRef.current,
                    socketId,
                });
            })

            socketRef.current.on('disconnected', ({ socketId, username }) => {
                toast.success(`${username} has left the room.`);
                setClients((prev) => {
                    return prev.filter((client) => client.socketId !== socketId);
                });
            });
        }
        
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off('joined');
            socketRef.current.off('disconnected');
        }

    },[])

    async function copyRoomId(){
        try{
            await navigator.clipboard.writeText(roomId)
            toast.success('Room ID copied to clipboard');
        }
        catch(err){
            toast.error(`Couldn't copy Room ID`);
            console.log("error while copying room id" , err);
        }
    }

    function leaveRoom(){
        try{
            navigate('/');
        }
        catch(err){
            toast.error('Oops! Some error occurred');
            console.log("error while leaving",err);
        }
    }

    if(location.state == null || location.state.username == null){
        return navigate('/');
    }

  return (
    <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src={logo}
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}  >
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom} >
                    Leave
                </button>
            </div>
            <div className="editorWrap">
                <CodeEditor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {codeRef.current = code}}
                />
            </div>
        </div>
  )
}

export default EditorPage

