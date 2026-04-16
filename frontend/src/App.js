import React from "react";
import {Route, Routes} from "react-router";
import Home from "./components/Home/Home";
import LoginPage from "./components/Login/LoginPage";
import RegisterPage from "./components/Register/RegisterPage";
import UserDashboard from "./components/Dashboard/UserDashboard";
import UserResourceView from "./components/Dashboard/UserResourceView";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import ResourceManagement from "./components/AdminDashboard/ResourceManagement";

function App(){
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Home></Home>}/>
          <Route path="/login" element={<LoginPage></LoginPage>}/>
          <Route path="/register" element={<RegisterPage></RegisterPage>}/>
          <Route path="/dashboard" element={<UserDashboard></UserDashboard>}/>
          <Route path="/user/resources" element={<UserResourceView></UserResourceView>}/>
          <Route path="/admin-dashboard" element={<AdminDashboard></AdminDashboard>}/>
          <Route path="/admin/resources" element={<ResourceManagement></ResourceManagement>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;