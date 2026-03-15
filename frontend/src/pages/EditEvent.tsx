import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import type { Event } from "../types";

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState(0);
  const [ticketsLeft, setTicketsLeft] = useState(0);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    axios
      .get(`http://localhost:4000/events/${id}`)
      .then((res) => {
        const found = res.data as Event;
        const userId = localStorage.getItem("userId");
        if (found.organizerId !== userId) {
          setError("You can only edit events you created.");
          navigate("/events");
          return;
        }
        setEvent(found);
        setTitle(found.title);
        setLocation(found.location);
        setDate(found.date);
        setTime(found.time);
        setPrice(found.price);
        setTicketsLeft(found.ticketsLeft);
        setInfo(found.info);
      })
      .catch((err) => {
        alert(err.response?.data || "Failed to load event");
        navigate("/my-events");
      });
  }, [id, navigate]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    setError("");
    if (!token) {
      setError("Please login first.");
      navigate("/login");
      return;
    }

    if (!title || !location || !date || !time) {
      setError("Please fill title, location, date, and time.");
      return;
    }
    const selectedDateTime = new Date(`${date}T${time}`);
    if (Number.isNaN(selectedDateTime.getTime()) || selectedDateTime <= new Date()) {
      setError("Date and time must be in the future.");
      return;
    }
    if (price < 0) {
      setError("Price cannot be negative.");
      return;
    }
    if (ticketsLeft < 0) {
      setError("Tickets left cannot be negative.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:4000/events/${id}`,
        {
          title,
          location,
          date,
          time,
          price,
          ticketsLeft,
          info,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.dispatchEvent(new Event("eventsUpdated"));
      navigate("/my-events");
    } catch (err: any) {
      setError(err.response?.data || "Failed to update event");
    }
  };

  if (!event) {
    return <div>Loading event...</div>;
  }

  return (
    <div>
      <h2>Edit Event</h2>
      <label>Title</label>
      <br />
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <br />
      <label>Location</label>
      <br />
      <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <br />
      <label>Date</label>
      <br />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <br />
      <label>Time</label>
      <br />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <br />
      <label>Price</label>
      <br />
      <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      <br />
      <label>Tickets left</label>
      <br />
      <input type="number" placeholder="Tickets left" value={ticketsLeft} onChange={(e) => setTicketsLeft(Number(e.target.value))} />
      <br />
      <label>Info (optional)</label>
      <br />
      <textarea placeholder="Info" value={info} onChange={(e) => setInfo(e.target.value)} />
      <br />
      {error && <div style={{ color: "red", margin: "8px 0" }}>{error}</div>}
      <button onClick={handleSubmit}>Save Changes</button>
    </div>
  );
}
