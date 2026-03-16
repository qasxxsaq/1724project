import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventList from "./pages/EventList";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EventDetail from "./pages/EventDetail";
import Navbar from "./components/Navbar";
import MyEvents from "./pages/MyEvents";
import MyTickets from "./pages/MyTickets";
import MyDocuments from "./pages/MyDocuments";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/my-events/edit/:id" element={<EditEvent />} />
        <Route path="/tickets" element={<MyTickets />} />
        <Route path="/documents" element={<MyDocuments />} />
      </Routes>
    </BrowserRouter>
  );
}
