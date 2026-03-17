import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode";
import type { Ticket } from "../types";

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
      : (ticket?.event?.price ?? 0);

  if (loading) return <div>Loading ticket...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!ticket) return <div>Ticket not found.</div>;

  return (
    <div style={{ padding: "1rem", maxWidth: "520px" }}>
      <h2>Ticket Detail</h2>
      <p><strong>Event:</strong> {ticket.event?.title}</p>
      <p><strong>Date:</strong> {ticket.event?.date} {ticket.event?.time}</p>
      <p><strong>Location:</strong> {ticket.event?.location}</p>
      <p><strong>Purchase time:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
      <p><strong>Purchase price:</strong> ${pricePaid}</p>
      <p><strong>Student discount used:</strong> {ticket.discountApplied ? "Yes" : "No"}</p>
      <p><strong>Ticket ID:</strong> {ticket.id}</p>
      <p><strong>Code:</strong> {ticket.code}</p>
      {qrData && (
        <div style={{ margin: "1rem 0" }}>
          <img src={qrData} alt="Ticket QR code" style={{ width: 180, height: 180 }} />
        </div>
      )}
      {qrData && (
        <a
          href={qrData}
          download={`ticket-${ticket.id}.png`}
          style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            background: "#1976d2",
            color: "white",
            borderRadius: 4,
            textDecoration: "none",
            marginRight: "8px",
          }}
        >
          Download Ticket
        </a>
      )}
      <button onClick={() => navigate("/tickets")}>Back to My Tickets</button>
    </div>
  );
}
