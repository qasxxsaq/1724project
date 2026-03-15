import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Ticketing App</h1>
      <Link to="/login">Login</Link> |{" "}
      <Link to="/register">Register</Link> |{" "}
      <Link to="/events">View Events</Link> |{" "}
      <Link to="/create">Create Event</Link>
    </div>
  );
}

