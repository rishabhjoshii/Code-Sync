import React, { useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";
import { useLocation, useParams } from "react-router-dom";

function ChatBox({socketRef,onMssgChange}) {
  const messagesEndRef=useRef(null);
  const {roomId } = useParams();
  const [mssg, setMssg] = useState([]);
  const [input,setInput]=useState("");
  const location = useLocation();
  const username = location.state?.username;
  console.log("username ", username);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("mssg", (data) => {
        console.log('data', data);
        setMssg((prev) => [...prev, data]);
      });

      socketRef.current.on("all-mssg",(data)=>{
        setMssg(data);
      })

      console.log("mssg: ", mssg);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off("mssg");
        socketRef.current.off("all-mssg");
      }
    };
  }, [socketRef.current]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mssg]);

  const sendMssg= () => {
    if(input.trim()==="")return;
    onMssgChange([...mssg,{user: username, mssg: input}]);
    setMssg((prev) => [...prev, { user: username, mssg: input }]);
    socketRef.current.emit("mssg", { user:username, mssg: input, roomId });
    setInput("");
  }

const handleKeyDown=(event)=>{
  if (event.key === 'Enter') {
    sendMssg();
  }
}
console.log("mssg ", mssg);
  return (
    <div className='text-white border border-gray-400 h-screen w-full p-2 flex flex-col '>
      <h1 className="text-white text-xl text-center">Start chat here...</h1>
      <hr></hr>
      <div className="overflow-y-auto flex-1 mb-2" style={{ width: "100%" }}>
      {mssg.map(({ user, mssg }, index) => {
        console.log('here ', user)
        return user === username ? (
          <MyMssg key={index} user={user} mssg={mssg} />
        ) : (
          <OtherMssg key={index} user={user} mssg={mssg} />
        );
      })}
      <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center">
      <input
        placeholder=" Message"
        onChange={(e)=>setInput(e.target.value)}
        value={input}
        className="chatBoxInput border-white border-2 my-2 mx-2 bg-gray-700 text-slate-50 p-1 text-sm  rounded-xl"
        style={{ height: "50px", width: "80%" }} onKeyDown={handleKeyDown}
      ></input>
      <button style={{heigth:"50px",width:"12%"}}onClick={sendMssg} className="bg-green-500 p-1 rounded-xl text-zinc-950 text-xs hover:text-pink-600 hover:bg-white font-medium">
        send
      </button>
      </div>
    </div>
  );
};

function MyMssg({ user, mssg }) {
  return (
    <div
      style={{ width: "fit-content", maxWidth: "250px", marginLeft: "auto" }}
      className="break-words text-slate-50 text-sm bg-emerald-600 p-2 my-2 mr-2 rounded-md"
    >
      {mssg}
    </div>
  );
}


function OtherMssg({ user, mssg }) {
  console.log("user prop :", user)
  return (
    <div
      style={{ width: "fit-content", maxWidth: "250px" }}
      className="  bg-gray-700 ml-2 my-2 rounded-md"
    >
      <div className="items-center pl-2 pt-1">
        <Avatar name={user} size={30} round="20px" className="" />
        <span className="text-sm font-medium text-pink-600 ml-1 mr-2">{user}</span>
      </div>
      <div className=" break-words  text-slate-50 text-sm p-2">{mssg}</div>
    </div>
  );
}


export default ChatBox;
