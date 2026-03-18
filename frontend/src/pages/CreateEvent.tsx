import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

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
  const [fieldError, setFieldError] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    price: "",
    ticketsLeft: "",
  });
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
      setFieldError((prev) => ({ ...prev, date: "", time: "" }));
      setError("Date and time must be in the future.");
      return;
    }

    if (price < 0) {
      setFieldError((prev) => ({ ...prev, price: "Price cannot be negative." }));
      setError("Please fix the errors.");
      return;
    }

    if (ticketsLeft < 0) {
      setFieldError((prev) => ({ ...prev, ticketsLeft: "Tickets left cannot be negative." }));
      setError("Please fix the errors.");
      return;
    }

    try {
      await api.post(
        "/events",
        { title, location, date, time, price, ticketsLeft, info, studentDiscount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/events");
    } catch (err: any) {
      setError(err.response?.data || "Failed to create event");
    }
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Create Event</h2>
        <p className="text-sm text-slate-600">Fill in the details below to publish a new event.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Event details</CardTitle>
          <CardDescription>Provide the information required to list your event.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Concert, workshop, meetup..."
              />
              {fieldError.title && <p className="text-xs text-rose-600">{fieldError.title}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Venue name or address"
              />
              {fieldError.location && <p className="text-xs text-rose-600">{fieldError.location}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              {fieldError.date && <p className="text-xs text-rose-600">{fieldError.date}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              {fieldError.time && <p className="text-xs text-rose-600">{fieldError.time}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0"
              />
              {fieldError.price && <p className="text-xs text-rose-600">{fieldError.price}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ticketsLeft">Tickets available</Label>
              <Input
                id="ticketsLeft"
                type="number"
                value={ticketsLeft}
                onChange={(e) => setTicketsLeft(Number(e.target.value))}
                placeholder="0"
              />
              {fieldError.ticketsLeft && <p className="text-xs text-rose-600">{fieldError.ticketsLeft}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="studentDiscount">Student discount</Label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  id="studentDiscount"
                  type="checkbox"
                  checked={studentDiscount}
                  onChange={(e) => setStudentDiscount(e.target.checked)}
                  className="h-4 w-4 rounded border-input bg-background text-indigo-500 focus:ring-indigo-500"
                />
                Enable student discount
              </label>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="info">Description (optional)</Label>
            <textarea
              id="info"
              className="min-h-[120px] resize-none rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Add more details about the event."
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCreate}>Create event</Button>
            <Button variant="secondary" onClick={() => navigate("/events")}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
