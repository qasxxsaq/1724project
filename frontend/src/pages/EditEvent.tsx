import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import type { Event } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

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
  const [studentDiscount, setStudentDiscount] = useState(false);
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
        const foundDateTime = new Date(`${found.date}T${found.time}`);
        if (!Number.isNaN(foundDateTime.getTime()) && foundDateTime <= new Date()) {
          setError("Past events cannot be edited.");
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
        setStudentDiscount(found.studentDiscount);
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
        { title, location, date, time, price, ticketsLeft, info, studentDiscount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.dispatchEvent(new Event("eventsUpdated"));
      navigate("/my-events");
    } catch (err: any) {
      setError(err.response?.data || "Failed to update event");
    }
  };

  if (!event) {
    return <p className="text-sm text-slate-600">Loading event</p>;
  }

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Edit Event</h2>
        <p className="text-sm text-slate-600">Update the details for your event and save your changes.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Event settings</CardTitle>
          <CardDescription>Change any information and click Save when youre ready.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
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
              />
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
            <Label htmlFor="info">Description</Label>
            <textarea
              id="info"
              className="min-h-[120px] resize-none rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSubmit}>Save changes</Button>
            <Button variant="secondary" onClick={() => navigate("/my-events")}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
