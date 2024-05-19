import React, { useState, useRef } from 'react'
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import axios from 'axios';

const CodeEditor = () => {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('// write your code here');
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('vs-dark');

  const monaco = useMonaco();

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
    const requestPayload = {
      source_code: code,
      language_id: selectedLanguage.id,
      stdin: input,
    };

    try {
      // Submit the code for compilation
      const response = await axios.post('https://judge0.p.rapidapi.com/submissions', requestPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': 'import.meta.env.VITE_RAPIDAPI_HOST',
          'X-RapidAPI-Key': 'import.meta.env.VITE_RAPIDAPI_KEY', // Replace with your actual RapidAPI key
        },
      });

      const token = response.data.token;

      // Poll the Judge0 API until the result is ready
      let resultResponse;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before polling again
        resultResponse = await axios.get(`https://judge0.p.rapidapi.com/submissions/${token}`, {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Host': 'import.meta.env.VITE_RAPIDAPI_HOST',
            'X-RapidAPI-Key': 'import.meta.env.VITE_RAPIDAPI_KEY',
          },
        });
      } while (resultResponse.data.status.id <= 2); // Status IDs <= 2 indicate the process is still running

      console.log("response after compilation: ",resultResponse);

      setOutput(resultResponse.data.stdout || resultResponse.data.stderr);
    } 
    catch (error) {
      console.log('compilation error: ', error);
      setOutput('Error: ' + (error.response ? error.response.data : error.message));
    }

    setLoading(false);

  }

  return (
    <div>
      <div className='flex justify-between items-center'>
        <div>
          <select className='border-double border-4 border-blue-500 mt-4 mr-4 p-1 ' onChange={(e)=> setLanguage(e.target.value)} value={language}>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <select className='border-double border-4 border-blue-500 mt-4 mr-4 p-1' onChange={(e) => setTheme(e.target.value)} value={theme}>
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
            className='mt-4 p-2 bg-blue-500 text-white'
          >
            {loading ? 'Compiling...' : 'Compile and Run'}
          </button>
        </div>
        
      </div>

      <Editor 
        className='realtimeEditor' 
        theme={theme}
        language={language} 
        value={code}
        onChange={(value)=> setCode(value)}
        options={{
          fontSize: "15",
        }}
      />

      <div className='terminal border border-gray-400  flex mt-1 '>
        <textarea
          className='inputBox w-full m-1 p-2  text-white'
          placeholder='Enter input here...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className='outputBox w-full m-1 p-2 '>
          <h3 className='text-white'>Output:</h3>
          <pre className='text-white'>{output}</pre>
        </div>
      </div>

      

    </div>
   
  )
}

export default CodeEditor;

