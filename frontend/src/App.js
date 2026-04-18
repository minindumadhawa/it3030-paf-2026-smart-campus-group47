import React from "react";
import {Route, Routes} from "react-router";
import Home from "./components/Home/Home";
import LoginPage from "./components/Login/LoginPage";
import RegisterPage from "./components/Register/RegisterPage";
import UserDashboard from "./components/Dashboard/UserDashboard";
import UserResourceView from "./components/Dashboard/UserResourceView";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import ResourceManagement from "./components/AdminDashboard/ResourceManagement";
import CreateTicket from "./components/Tickets/CreateTicket";
import MyTickets from "./components/Tickets/MyTickets";
import TicketDetails from "./components/Tickets/TicketDetails";
import TicketManagement from "./components/Tickets/TicketManagement";
import BookingForm from "./components/Bookings/BookingForm";
import MyBookings from "./components/Bookings/MyBookings";
import AdminBookingManagement from "./components/Bookings/AdminBookingManagement";
import TechnicianDashboard from "./components/Technician/TechnicianDashboard";
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
          {/* Module C - Maintenance & Incident Ticketing */}
          <Route path="/tickets/create" element={<CreateTicket></CreateTicket>}/>
          <Route path="/tickets/my" element={<MyTickets></MyTickets>}/>
          <Route path="/tickets/:id" element={<TicketDetails></TicketDetails>}/>
          <Route path="/admin/tickets" element={<TicketManagement></TicketManagement>}/>
          {/* Module: Bookings */}
          <Route path="/user/bookings" element={<MyBookings></MyBookings>}/>
          <Route path="/user/bookings/new/:resourceId" element={<BookingForm></BookingForm>}/>
          <Route path="/admin/bookings" element={<AdminBookingManagement></AdminBookingManagement>}/>
          {/* Technician Portal */}
          <Route path="/technician-dashboard" element={<TechnicianDashboard></TechnicianDashboard>}/>
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;