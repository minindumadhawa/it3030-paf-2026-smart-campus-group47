import React from "react";
import {Route, Routes} from "react-router";
import Home from "./components/Home/Home";


function App(){
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Home></Home>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}