import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import "./App.css";
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <>
      <div>
        <Toaster
          position="top-center"
          reverseOrder={false}
        ></Toaster>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/editor/:roomId" element={<EditorPage/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
