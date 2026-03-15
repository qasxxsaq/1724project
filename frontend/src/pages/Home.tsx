import { Link } from "react-router-dom";

export default function Home() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  return (
    <div>
      <h1>Ticketing App</h1>
      {!token && (
        <>
          <Link to="/login">Login</Link> |{" "}
          <Link to="/register">Register</Link> |{" "}
        </>
      )}
      <Link to="/events">View Events</Link>
      {token && role === "organizer" && (
        <>
          |{" "}<Link to="/create">Create Event</Link>
        </>
      )}
    </div>
  );
}

