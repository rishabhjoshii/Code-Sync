import React, { useEffect, useRef, useState } from 'react'
import Client from '../components/Client'
import logo from "../assets/logo.png"
import CodeEditor from '../components/CodeEditor'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const EditorPage = () => {
    const navigate = useNavigate();
    const {roomId} = useParams();

    const clients = [
        {
            username: 'Rishabh',
            socketId: 1
        },
        {
            username: 'Pawan',
            socketId: 2
        },
        {
            username: 'Geeta',
            socketId: 3
        }

    ];

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
                <CodeEditor/>
            </div>
        </div>
  )
}

export default EditorPage

