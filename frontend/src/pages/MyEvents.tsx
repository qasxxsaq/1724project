import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Event } from "../types";

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadEvents = useCallback(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get("http://localhost:4000/events/my", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => setEvents(res.data))
      .catch((err) => {
        console.error(err);
        alert(err.response?.data || "Failed to load my events");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadEvents();

    const handler = () => {
      loadEvents();
    };
    window.addEventListener("eventsUpdated", handler);

    const interval = setInterval(loadEvents, 6000);
    return () => {
      window.removeEventListener("eventsUpdated", handler);
      clearInterval(interval);
    };
  }, [loadEvents]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:4000/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      window.dispatchEvent(new Event("eventsUpdated"));
    } catch (err: any) {
      alert(err.response?.data || "Failed to delete event");
    }
  };

  return (
    <div>
      <h2>My Events</h2>
      {loading && <p>Updating dashboard…</p>}
      {events.length === 0 ? (
        <p>You have not created any events yet.</p>
      ) : (
        events.map((e) => (
          <div key={e.id} style={{ border: "1px solid #ececec", margin: "8px", padding: "8px", borderRadius: "6px" }}>
            <h3>{e.title}</h3>
            <p>Location: {e.location}</p>
            <p>Date: {e.date} | Time: {e.time}</p>
            <p>Price: ${e.price}</p>
            <p>Tickets left: {e.ticketsLeft}</p>
            <p>Description: {e.info}</p>
            <button onClick={() => navigate(`/my-events/edit/${e.id}`)}>Edit</button>
            <button onClick={() => {
              if (window.confirm("Confirm delete this event?")) {
                handleDelete(e.id);
              }
            }}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}
