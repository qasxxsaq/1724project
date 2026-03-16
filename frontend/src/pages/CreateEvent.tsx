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
  const [studentDiscount, setStudentDiscount] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({ title: "", location: "", date: "", time: "", price: "", ticketsLeft: "" });
  const navigate = useNavigate();

  const handleCreate = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setError("");
    if (!token) {
      setError("Please login first to create events.");
      navigate("/login");
      return;
    }
    if (role !== "organizer") {
      setError("Only organizers can create events.");
      return;
    }

    setFieldError({ title: "", location: "", date: "", time: "", price: "", ticketsLeft: "" });
    if (!title || !location || !date || !time) {
      setFieldError({
        title: !title ? "Title is required." : "",
        location: !location ? "Location is required." : "",
        date: !date ? "Date is required." : "",
        time: !time ? "Time is required." : "",
        price: "",
        ticketsLeft: "",
      });
      setError("Please fill required fields.");
      return;
    }
    const selectedDateTime = new Date(`${date}T${time}`);
    if (Number.isNaN(selectedDateTime.getTime()) || selectedDateTime <= new Date()) {
      setFieldError(prev => ({ ...prev, date: "", time: "", }));
      setError("Date and time must be in the future.");
      return;
    }
    if (price < 0) {
      setFieldError(prev => ({ ...prev, price: "Price cannot be negative." }));
      setError("Please fix the errors.");
      return;
    }
    if (ticketsLeft < 0) {
      setFieldError(prev => ({ ...prev, ticketsLeft: "Tickets left cannot be negative." }));
      setError("Please fix the errors.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/events",
        { title, location, date, time, price, ticketsLeft, info, studentDiscount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/events");
    } catch (err: any) {
      setError(err.response?.data || "Failed to create event");
    }
  };

  return (
    <div>
      <h2>Create Event</h2>
      <label>Title</label>
      <br />
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      {fieldError.title && <div style={{ color: "red" }}>{fieldError.title}</div>}
      <br />
      <label>Location</label>
      <br />
      <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
      {fieldError.location && <div style={{ color: "red" }}>{fieldError.location}</div>}
      <br />
      <label>Date</label>
      <br />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      {fieldError.date && <div style={{ color: "red" }}>{fieldError.date}</div>}
      <br />
      <label>Time</label>
      <br />
      <input type="time" value={time} onChange={e => setTime(e.target.value)} />
      {fieldError.time && <div style={{ color: "red" }}>{fieldError.time}</div>}
      <br />
      <label>Price</label>
      <br />
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(Number(e.target.value))} />
      {fieldError.price && <div style={{ color: "red" }}>{fieldError.price}</div>}
      <br />
      <label>Tickets Left</label>
      <br />
      <input type="number" placeholder="Tickets Left" value={ticketsLeft} onChange={e => setTicketsLeft(Number(e.target.value))} />
      {fieldError.ticketsLeft && <div style={{ color: "red" }}>{fieldError.ticketsLeft}</div>}
      <br />
      <label>Info (optional)</label>
      <br />
      <textarea placeholder="Info" value={info} onChange={e => setInfo(e.target.value)} />
      <br />
      <label>
        <input type="checkbox" checked={studentDiscount} onChange={e => setStudentDiscount(e.target.checked)} />
        Student Discount Available
      </label>
      <br />
      {error && <div style={{ color: "red", margin: "8px 0" }}>{error}</div>}
      <button onClick={handleCreate}>Create Event</button>
    </div>
  );
}

