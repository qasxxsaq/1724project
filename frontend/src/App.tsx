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
import TicketDetail from "./pages/TicketDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import { Container } from "./components/Container";
import EventNotifications from "./components/EventNotifications";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <EventNotifications />
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route
              path="/create"
              element={
                <ProtectedRoute roles={["organizer"]}>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-events"
              element={
                <ProtectedRoute roles={["organizer"]}>
                  <MyEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-events/edit/:id"
              element={
                <ProtectedRoute roles={["organizer"]}>
                  <EditEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/tickets/:id"
              element={
                <ProtectedRoute roles={["organizer"]}>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <MyDocuments />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Container>
      </div>
    </BrowserRouter>
  );
}
