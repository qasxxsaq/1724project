import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import type { Event } from "../types";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios
      .get(`http://localhost:4000/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  const buy = async () => {
    if (!id) return;
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `http://localhost:4000/events/${id}/buy`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      navigate("/tickets");
    } catch (err: any) {
      alert(err.response?.data || "Purchase failed.");
    }
  };

  if (loading) return <div>Loading event...</div>;
  if (!event) return <div>Event not found.</div>;

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const canEdit = role === "organizer" && userId && userId === event.organizerId;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{event.title}</h2>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Date:</strong> {event.date}</p>
      <p><strong>Time:</strong> {event.time}</p>
      <p><strong>Price:</strong> ${event.price}</p>
      <p><strong>Tickets left:</strong> {event.ticketsLeft}</p>
      <p><strong>Description:</strong> {event.info}</p>
      <div style={{ marginTop: "8px" }}>
        {role === "customer" && (
          <button onClick={buy} style={{ marginRight: "8px" }}>
            Buy Ticket
          </button>
        )}
        {canEdit && (
          <button onClick={() => navigate(`/my-events/edit/${event.id}`)} style={{ marginRight: "8px" }}>
            Edit Event
          </button>
        )}
        <button onClick={() => navigate("/events")}>Back to list</button>
      </div>
    </div>
  );
}
