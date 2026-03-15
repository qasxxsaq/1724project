import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <Link to="/">Home</Link> |{" "}
      <Link to="/events">Events</Link> |{" "}

      {!token && (
        <>
          <Link to="/login">Login</Link> |{" "}
          <Link to="/register">Register</Link>
        </>
      )}

      {token && role === "customer" && (
        <>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}

      {token && role === "organizer" && (
        <>
          <Link to="/create">Create Event</Link> |{" "}
          <Link to="/my-events">My Events</Link> |{" "}
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}