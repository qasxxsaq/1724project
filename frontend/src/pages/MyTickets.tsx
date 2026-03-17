import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import type { Ticket } from "../types";

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

  if (loading) return <div>Loading your tickets...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  if (!tickets.length) {
    return <div>You have no tickets yet. Buy one from the events list.</div>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>My Tickets</h2>
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: 8,
            marginBottom: "1rem",
            maxWidth: 420,
          }}
        >
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Event:</strong> {ticket.event?.title || "Unknown"}
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Date:</strong> {ticket.event?.date} {ticket.event?.time}
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Location:</strong> {ticket.event?.location}
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Ticket ID:</strong> {ticket.id}
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Purchased:</strong> {new Date(ticket.createdAt).toLocaleString()}
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Price paid:</strong> ${getPricePaid(ticket)}
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Student discount:</strong> {ticket.discountApplied ? "Used" : "Not used"}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <img
              src={qrData[ticket.id]}
              alt="Ticket QR code"
              style={{ width: 180, height: 180 }}
            />
          </div>
          <a
            href={qrData[ticket.id]}
            download={`ticket-${ticket.id}.png`}
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              background: "#1976d2",
              color: "white",
              borderRadius: 4,
              textDecoration: "none",
            }}
          >
            Download Ticket
          </a>
          <button onClick={() => navigate(`/tickets/${ticket.id}`)} style={{ marginLeft: "8px" }}>
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}
