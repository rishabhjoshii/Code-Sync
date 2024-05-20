import React, { useState, useRef, useEffect } from 'react'
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CodeEditor = ({socketRef, roomId, onCodeChange, onLanguageChange, onInputChange,onOutputChange}) => {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('// write your code here');
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('vs-dark');


  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on('code-change', ({ code }) => {
        if (code !== null) {
          setCode(code);
        }
      });

      socketRef.current.on('input-change',({inp})=>{
          setInput(inp);
      })
      socketRef.current.on('output-change',({out})=>{
        setOutput(out);
      })
      socketRef.current.on('lang', ({lang})=>{
        setLanguage(lang);
      })

      return () => {
        if (socketRef.current) {
          socketRef.current.off("code-change");
          socketRef.current.off("input-change");
          socketRef.current.off("output-change");
          socketRef.current.off("lang");
        }
      };
    }
  }, [socketRef.current]);

  const languageOptions = [
    { id: 54, name: 'cpp' },        // Judge0 language ID for C++
    { id: 63, name: 'javascript' }, // Judge0 language ID for JavaScript
    { id: 74, name: 'typescript' }, // Judge0 language ID for TypeScript
    { id: 71, name: 'python' },     // Judge0 language ID for Python
    { id: 62, name: 'java' },       // Judge0 language ID for Java
  ];

  const themeOptions = [
    { value: 'vs-dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'hc-black', label: 'High Contrast' },
  ];
  

  const handleCompile = async () => {
    setLoading(true);
    setOutput('');

    const selectedLanguage = languageOptions.find((lang) => lang.name === language);

    const options = {
      method: "POST",
      url: `https://judge0.p.rapidapi.com/submissions`,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": import.meta.env.VITE_RAPIDAPI_HOST,
        "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
      },
      data: {
        language_id: selectedLanguage.id,
        source_code: btoa(code),
        stdin: btoa(input),
      },
    };

    try {
      // Submit the code for compilation
      const response = await axios(options)

      const token = response.data.token;

      // Poll the Judge0 API until the result is ready
      let resultResponse;
      const options2 = {
        method: "GET",
        url: `https://judge0.p.rapidapi.com/submissions/${token}`,
        params: { base64_encoded: "true", fields: "*" },
        headers: {
          "X-RapidAPI-Host": import.meta.env.VITE_RAPIDAPI_HOST,
          "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
        },
      };

      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before polling again
        resultResponse = await axios(options2);
      } while (resultResponse.data.status.id <= 2); // Status IDs <= 2 indicate the process is still running

      console.log("response after compilation: ",resultResponse);

      const resultData = resultResponse.data;
      onOutputChange(resultData);
      setOutput(resultData);
      socketRef.current.emit('output-change', {
        roomId,
        out: resultData,
      });
    } 
    catch (error) {
      console.log('compilation error: ', error);
      setOutput('Error: ' + (error.response ? error.response.data : error.message));
    }

    setLoading(false);

  }

  const handleEditorChange = (value) => {
    setCode(value);
    onCodeChange(value);
    socketRef.current.emit('code-change', {
        roomId,
        code: value,
    });
  };

  const handleLanguageChange = (e) => {
    onLanguageChange(e.target.value);
    setLanguage(e.target.value);
    socketRef.current.emit('lang', {
      roomId,
      lang: e.target.value,
    })
  }

  const handleInputchange = (e) => {
    setInput(e.target.value);
    onInputChange(e.target.value);
    socketRef.current.emit('input-change', {
      roomId,
      inp: e.target.value,
    })
  }

  return (
    <div className='huihui  '>
      <div className='topbar flex justify-between items-center '>
        <div>
          <select className='hover:cursor-pointer text-white border-double border-4 border-blue-500 mt-4 mr-4 p-1 ' onChange={handleLanguageChange} value={language}>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <select className='hover:cursor-pointer text-white border-double border-4 border-blue-500 mt-4 mr-4 p-1' onChange={(e) => setTheme(e.target.value)} value={theme}>
            {themeOptions.map((themeOption) => (
              <option key={themeOption.value} value={themeOption.value}>
                {themeOption.label}
              </option>
            ))}
          </select>
        </div>

        <div className='mr-10'>
          <button
            onClick={handleCompile}
            disabled={loading}
            className='mt-4 p-2 bg-blue-500 text-white rounded'
          >
            {loading ? 'Compiling...' : 'Compile and Run'}
          </button>
        </div>
        
      </div>

      <Editor 
        className='realtimeEditor ' 
        theme={theme}
        language={language} 
        value={code}
        onChange={handleEditorChange}
        options={{
          fontSize: "14",
        }}
      />

      <div className='terminal border border-gray-400  flex mt-1 '>
        <textarea
          className='inputBox  m-1 p-2  text-white'
          placeholder='Enter input here...'
          value={input}
          onChange={handleInputchange}
        />

        <div className='outputBox  m-1 p-2  '>
          <h3 className='text-white'>Output:</h3>
          <ShowOutput output={output}></ShowOutput>
        </div>
      </div>

      

    </div>
   
  )
}

function ShowOutput({ output }) {
  let statusId = output?.status?.id;
  if (statusId === 6) {
    return (
      <pre
        style={{ width: "100%", height: "100%" }}
        className=" px-2 py-1 font-normal text-sm text-red-500"
      >
        {output?.compile_output ? atob(output?.compile_output) : ""}
      </pre>
    );
  } else if (statusId === 3) {
    return (
      <pre className=" px-2 py-1 font-normal text-sm text-green-500">
        {output?.stdout ? atob(output.stdout) : ""}
      </pre>
    );
  } else if (statusId === 5) {
    return (
      <pre
        style={{ width: "100%", height: "100%" }}
        className="px-2 py-1 font-normal text-sm text-red-500"
      >
        Time Limit Exceeded
      </pre>
    );
  } else {
    return (
      <pre
        style={{ width: "100%", height: "100%" }}
        className="px-2 py-1 font-normal text-sm text-red-500"
      >
        {output?.stderr ? atob(output?.stderr) : ""}
      </pre>
    );
  }
}

export default CodeEditor;



