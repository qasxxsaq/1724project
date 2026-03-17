import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import type { Ticket } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) {
      setError("Unable to load ticket.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:4000/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTicket(res.data))
      .catch((err) => setError(err.response?.data || "Failed to load ticket."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!ticket) return;
    QRCode.toDataURL(ticket.code)
      .then(setQrData)
      .catch(() => setQrData(""));
  }, [ticket]);

  const pricePaid =
    ticket && typeof ticket.purchasePrice === "number" && !Number.isNaN(ticket.purchasePrice)
      ? ticket.purchasePrice
      : ticket?.event?.price ?? 0;

  if (loading) return <p className="text-sm text-slate-600">Loading ticket</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!ticket) return <p className="text-sm text-slate-600">Ticket not found.</p>;

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Ticket details</h2>
        <p className="text-sm text-slate-600">Keep this ticket handy for easy access to the QR code.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{ticket.event?.title ?? "Event ticket"}</CardTitle>
          <CardDescription>Ticket ID: {ticket.id}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <p className="text-sm text-slate-600">{ticket.event?.date} at {ticket.event?.time}</p>
            <p className="text-sm text-slate-600">{ticket.event?.location}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>Paid ${pricePaid.toFixed(2)}</Badge>
            <Badge variant={ticket.discountApplied ? "success" : "secondary"}>
              {ticket.discountApplied ? "Student discount" : "No discount"}
            </Badge>
            <Badge variant="secondary">Code: {ticket.code}</Badge>
          </div>

          {qrData && (
            <div className="flex justify-center">
              <img className="h-44 w-44 rounded-xl border border-slate-200 bg-slate-50" src={qrData} alt="Ticket QR code" />
            </div>
          )}

          {qrData && (
            <Button asChild>
              <a href={qrData} download={`ticket-${ticket.id}.png`}>
                Download ticket
              </a>
            </Button>
          )}

          <Button variant="secondary" onClick={() => navigate("/tickets")}>Back to tickets</Button>
        </CardContent>
      </Card>
    </div>
  );
}
