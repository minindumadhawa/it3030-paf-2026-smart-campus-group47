import React from "react";
import {Route, Routes} from "react-router";
import Home from "./components/Home/Home";
import LoginPage from "./components/Login/LoginPage";
import RegisterPage from "./components/Register/RegisterPage";

function App(){
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Home></Home>}/>
          <Route path="/login" element={<LoginPage></LoginPage>}/>
          <Route path="/register" element={<RegisterPage></RegisterPage>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;