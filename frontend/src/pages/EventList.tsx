import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import type { Event } from "../types";

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:4000/events").then(res => setEvents(res.data));
  }, []);

  const buyTicket = (id: string) => {
    const token = localStorage.getItem("token");
    axios.post(`http://localhost:4000/events/${id}/buy`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        alert(res.data.message);
        navigate("/tickets");
      })
      .catch(err => alert(err.response?.data || "Purchase failed."));
  };
  const role = localStorage.getItem("role");

  return (
    <div>
      <h2>Events</h2>
      {events.length === 0 && <p>No events yet.</p>}
      {events.map(e => (
        <div key={e.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
          <h3>{e.title}</h3>
          <p>{e.location} | {e.date} {e.time}</p>
          <p>${e.price} | Tickets left: {e.ticketsLeft}</p>
          <p>{e.info}</p>
          <div style={{ marginTop: "8px" }}>
            <Link to={`/events/${e.id}`} style={{ marginRight: "8px" }}>View Details</Link>
            {role === "customer" && (
              <button onClick={() => buyTicket(e.id)}>Buy Ticket</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

