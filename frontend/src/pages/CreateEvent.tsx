import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState(0);
  const [ticketsLeft, setTicketsLeft] = useState(0);
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (role !== "organizer") return alert("Only organizers can create events");

    try {
      await axios.post(
        "http://localhost:4000/events",
        { title, location, date, time, price, ticketsLeft, info },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Event created!");
      navigate("/events");
    } catch (err: any) {
      alert(err.response?.data || "Failed to create event");
    }
  };

  return (
    <div>
      <h2>Create Event</h2>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <br />
      <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
      <br />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <br />
      <input type="time" value={time} onChange={e => setTime(e.target.value)} />
      <br />
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(Number(e.target.value))} />
      <br />
      <input type="number" placeholder="Tickets Left" value={ticketsLeft} onChange={e => setTicketsLeft(Number(e.target.value))} />
      <br />
      <textarea placeholder="Info" value={info} onChange={e => setInfo(e.target.value)} />
      <br />
      <button onClick={handleCreate}>Create Event</button>
    </div>
  );
}

