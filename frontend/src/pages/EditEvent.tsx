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

  useEffect(() => {
    if (!id) return;
    axios
      .get("http://localhost:4000/events")
      .then((res) => {
        const found = res.data.find((item: Event) => item.id === id);
        if (!found) {
          alert("Event not found");
          navigate("/my-events");
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
    if (!token) {
      alert("Please login first");
      navigate("/login");
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
      alert("Event updated successfully");
      navigate("/my-events");
    } catch (err: any) {
      alert(err.response?.data || "Failed to update event");
    }
  };

  if (!event) {
    return <div>Loading event...</div>;
  }

  return (
    <div>
      <h2>Edit Event</h2>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <br />
      <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <br />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <br />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <br />
      <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      <br />
      <input type="number" placeholder="Tickets left" value={ticketsLeft} onChange={(e) => setTicketsLeft(Number(e.target.value))} />
      <br />
      <textarea placeholder="Info" value={info} onChange={(e) => setInfo(e.target.value)} />
      <br />
      <button onClick={handleSubmit}>Save Changes</button>
    </div>
  );
}
