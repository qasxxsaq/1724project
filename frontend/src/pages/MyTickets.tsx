import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import type { Ticket } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [qrData, setQrData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view your tickets.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    axios
      .get("http://localhost:4000/tickets/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTickets(res.data || []);
      })
      .catch((e) => {
        setError(e.response?.data || "Failed to load tickets.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!tickets.length) return;

    const generate = async () => {
      const entries = await Promise.all(
        tickets.map(async (ticket) => {
          if (!ticket.code) {
            return [ticket.id, ""] as const;
          }
          try {
            const dataUrl = await QRCode.toDataURL(ticket.code);
            return [ticket.id, dataUrl] as const;
          } catch {
            return [ticket.id, ""] as const;
          }
        })
      );
      setQrData(Object.fromEntries(entries));
    };

    generate();
  }, [tickets]);

  const getPricePaid = (ticket: Ticket) => {
    if (typeof ticket.purchasePrice === "number" && !Number.isNaN(ticket.purchasePrice)) {
      return ticket.purchasePrice;
    }
    return ticket.event?.price ?? 0;
  };

  if (loading) return <p className="text-sm text-slate-600">Loading your tickets</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!tickets.length) {
    return <p className="text-sm text-slate-600">You have no tickets yet. Buy one from the events list.</p>;
  }

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">My Tickets</h2>
        <p className="text-sm text-slate-600">Show your tickets and download QR codes for entry.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="space-y-4">
            <CardHeader>
              <CardTitle>{ticket.event?.title ?? "Untitled event"}</CardTitle>
              <CardDescription>
                {ticket.event?.date} at {ticket.event?.time}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Ticket # {ticket.id}</Badge>
                <Badge>Paid ${getPricePaid(ticket)}</Badge>
                <Badge variant={ticket.discountApplied ? "success" : "secondary"}>
                  {ticket.discountApplied ? "Student discount" : "No discount"}
                </Badge>
                {ticket.discountApplied && ticket.discountReviewStatus === "pending" ? (
                  <Badge variant="warning">Pending review</Badge>
                ) : null}
                {ticket.discountApplied && ticket.discountReviewStatus === "approved" ? (
                  <Badge variant="success">Discount approved</Badge>
                ) : null}
              </div>

              <div className="grid gap-2">
                <p className="text-sm text-slate-600">
                  Purchased: {new Date(ticket.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600">Location: {ticket.event?.location}</p>
                {ticket.discountApplied && ticket.discountReviewStatus === "pending" ? (
                  <p className="text-sm text-amber-700">
                    Your discounted ticket will be generated after organizer approval.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">
                  {ticket.code && qrData[ticket.id] ? (
                    <img src={qrData[ticket.id]} alt="Ticket QR code" className="h-40 w-40" />
                  ) : ticket.discountApplied && ticket.discountReviewStatus === "pending" ? (
                    <p className="text-xs text-amber-700">QR code will appear after approval</p>
                  ) : (
                    <p className="text-xs text-slate-500">QR code is loading</p>
                  )}
                </div>

                <div className="flex flex-col items-start justify-between gap-3">
                  {ticket.code && qrData[ticket.id] ? (
                    <Button
                      asChild
                      className="w-full"
                    >
                      <a href={qrData[ticket.id]} download={`ticket-${ticket.id}.png`}>
                        Download ticket
                      </a>
                    </Button>
                  ) : (
                    <Button className="w-full" disabled>
                      Ticket pending approval
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    View details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
