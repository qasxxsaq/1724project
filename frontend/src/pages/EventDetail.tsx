import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { API_URL } from "../lib/api";
import type { Event } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingDocuments, setCheckingDocuments] = useState(false);
  const [hasStudentId, setHasStudentId] = useState(false);
  const [useStudentDiscount, setUseStudentDiscount] = useState(false);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (role !== "customer" || !event?.studentDiscount || !token) {
      setHasStudentId(false);
      setUseStudentDiscount(false);
      return;
    }

    setCheckingDocuments(true);
    fetch(`${API_URL}/documents/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((documents) => {
        const uploaded = Array.isArray(documents) && documents.some((doc) => doc.type === "student_id");
        setHasStudentId(uploaded);
        if (!uploaded) {
          setUseStudentDiscount(false);
        }
      })
      .catch(() => {
        setHasStudentId(false);
        setUseStudentDiscount(false);
      })
      .finally(() => setCheckingDocuments(false));
  }, [event?.studentDiscount, role]);

  const buy = async () => {
    if (!id) return;
    const token = localStorage.getItem("token");

    try {
      const res = await api.post(
        `/events/${id}/buy`,
        { useStudentDiscount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { message, discountApplied, finalPrice } = res.data;
      if (discountApplied) {
        alert(`${message} - Student discount applied! Final price: $${finalPrice}`);
      } else {
        alert(message);
      }

      navigate("/tickets");
    } catch (err: any) {
      alert(err.response?.data || "Purchase failed.");
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Loading event details</p>;
  }

  if (!event) {
    return <p className="text-sm text-slate-600">Event not found.</p>;
  }

  const eventDateTime = new Date(`${event.date}T${event.time}`);
  const isPastEvent = !Number.isNaN(eventDateTime.getTime()) && eventDateTime <= new Date();
  const canEdit = role === "organizer" && userId && userId === event.organizerId && !isPastEvent;
  const discountedPrice = Math.floor(event.price * 0.8);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">{event.title}</h2>
        <p className="text-sm text-slate-600">Find the latest details about this event below.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>{event.location}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Date</p>
              <p className="text-base text-slate-900">{event.date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Time</p>
              <p className="text-base text-slate-900">{event.time}</p>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Price</p>
              <p className="text-base text-slate-900">${event.price.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Tickets</p>
              <p className="text-base text-slate-900">{event.ticketsLeft} remaining</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {event.ticketsLeft <= 0 ? (
              <Badge variant="danger">Sold out</Badge>
            ) : (
              <Badge variant="success">Available</Badge>
            )}
            {event.ticketsLeft > 0 && event.ticketsLeft <= 3 && <Badge variant="warning">Low availability</Badge>}
            {event.studentDiscount && <Badge>Student discount</Badge>}
            {isPastEvent && <Badge variant="secondary">Past event</Badge>}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-slate-500">Description</p>
            <p className="text-sm text-slate-700">{event.info}</p>
          </div>

          {role === "customer" && event.studentDiscount ? (
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium text-slate-900">Ticket option</p>
                <p className="text-sm text-slate-600">
                  Regular: ${event.price.toFixed(2)} | Student discount: ${discountedPrice.toFixed(2)}
                </p>
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-input bg-background text-indigo-500 focus:ring-indigo-500"
                  checked={useStudentDiscount}
                  onChange={(e) => setUseStudentDiscount(e.target.checked)}
                  disabled={!hasStudentId || checkingDocuments}
                />
                <span>
                  Use student discount for this purchase
                  {!checkingDocuments && !hasStudentId ? (
                    <span className="mt-1 block text-amber-700">
                      Upload your student ID in My Documents before selecting this option.
                    </span>
                  ) : null}
                </span>
              </label>

              {!checkingDocuments && !hasStudentId ? (
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => navigate("/documents")}>
                    Upload student ID
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {role === "customer" && (
              <Button
                onClick={buy}
                disabled={event.ticketsLeft <= 0}
                className="min-w-[160px]"
              >
                {event.ticketsLeft <= 0 ? "Sold out" : "Buy ticket"}
              </Button>
            )}

            {canEdit && (
              <Button variant="secondary" onClick={() => navigate(`/my-events/edit/${event.id}`)}>
                Edit event
              </Button>
            )}

            <Button variant="ghost" onClick={() => navigate("/events")}>Back to events</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
