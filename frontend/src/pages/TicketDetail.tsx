import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
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
  const [approving, setApproving] = useState(false);
  const [viewBlob, setViewBlob] = useState<string | null>(null);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !id) {
      setError("Unable to load ticket.");
      setLoading(false);
      return;
    }

    api
      .get(`/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTicket(res.data))
      .catch((err) => setError(err.response?.data || "Failed to load ticket."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!ticket?.code) {
      setQrData("");
      return;
    }
    QRCode.toDataURL(ticket.code)
      .then(setQrData)
      .catch(() => setQrData(""));
  }, [ticket]);

  const pricePaid =
    ticket && typeof ticket.purchasePrice === "number" && !Number.isNaN(ticket.purchasePrice)
      ? ticket.purchasePrice
      : ticket?.event?.price ?? 0;

  const downloadStudentProof = async () => {
    const token = localStorage.getItem("token");
    if (!token || !ticket?.studentDocument) {
      return;
    }

    try {
      const response = await api.get(
        `/documents/${ticket.studentDocument.id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const fileBlob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], {
              type: ticket.studentDocument.mimetype || "application/octet-stream",
            });
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = ticket.studentDocument.originalName || "student-proof";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data || "Failed to download student proof.");
    }
  };

  const viewStudentProof = async () => {
    const token = localStorage.getItem("token");
    if (!token || !ticket?.studentDocument) {
      return;
    }

    try {
      const response = await api.get(
        `/documents/${ticket.studentDocument.id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const fileBlob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], {
              type: ticket.studentDocument.mimetype || "application/octet-stream",
            });
      const url = window.URL.createObjectURL(fileBlob);
      const mimeType = fileBlob.type || ticket.studentDocument.mimetype || "";

      if (mimeType.startsWith("image/")) {
        setViewBlob(url);
      } else {
        window.open(url, "_blank");
      }
    } catch (err: any) {
      alert(err.response?.data || "Failed to view student proof.");
    }
  };

  const approveDiscount = async () => {
    const token = localStorage.getItem("token");
    if (!token || !ticket) return;

    try {
      setApproving(true);
      await api.post(
        `/tickets/${ticket.id}/review/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).then((res) => {
        setTicket((current) =>
          current
            ? {
                ...current,
                code: res.data.code ?? current.code,
                discountReviewStatus: "approved",
              }
            : current
        );
      });
    } catch (err: any) {
      alert(err.response?.data || "Failed to approve student discount.");
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-600">Loading ticket</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;
  if (!ticket) return <p className="text-sm text-slate-600">Ticket not found.</p>;

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Ticket details</h2>
        <p className="text-sm text-slate-600">
          {role === "organizer"
            ? "Review ticket purchases and student discount proof for your event."
            : "Keep this ticket handy for easy access to the QR code."}
        </p>
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
            {role === "organizer" && ticket.buyerUsername ? (
              <p className="text-sm text-slate-600">Buyer: {ticket.buyerUsername}</p>
            ) : null}
            <p className="text-sm text-slate-600">
              Purchased: {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>Paid ${pricePaid.toFixed(2)}</Badge>
            <Badge variant={ticket.discountApplied ? "success" : "secondary"}>
              {ticket.discountApplied ? "Student discount" : "No discount"}
            </Badge>
            {ticket.discountApplied && ticket.discountReviewStatus === "pending" ? (
              <Badge variant="warning">Pending review</Badge>
            ) : null}
            {ticket.discountApplied && ticket.discountReviewStatus === "approved" ? (
              <Badge variant="success">Discount approved</Badge>
            ) : null}
            {ticket.code ? <Badge variant="secondary">Code: {ticket.code}</Badge> : null}
          </div>

          {role === "organizer" && ticket.discountApplied ? (
            ticket.studentDocument ? (
              <div className="grid gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="grid gap-1">
                  <p className="text-sm font-medium text-slate-900">Student proof</p>
                  <p className="text-sm text-slate-700">
                    {ticket.studentDocument.originalName || "student-proof"}
                  </p>
                  <p className="text-xs text-slate-600">
                    Uploaded{" "}
                    {ticket.studentDocument.uploadedAt
                      ? new Date(ticket.studentDocument.uploadedAt).toLocaleString()
                      : "unknown"}
                  </p>
                </div>
                <Button variant="outline" onClick={downloadStudentProof}>
                  Download student proof
                </Button>
                <Button variant="secondary" onClick={viewStudentProof}>
                  View student proof
                </Button>
                {ticket.discountReviewStatus === "pending" ? (
                  <Button onClick={approveDiscount} disabled={approving}>
                    {approving ? "Approving..." : "Approve student discount"}
                  </Button>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-amber-700">No student proof found for this discounted ticket.</p>
            )
          ) : null}

          {ticket.discountApplied && ticket.discountReviewStatus === "pending" && role !== "organizer" ? (
            <p className="text-sm text-amber-700">
              Your ticket will be generated after the organizer approves your student discount.
            </p>
          ) : null}

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

          <Button
            variant="secondary"
            onClick={() => navigate(role === "organizer" ? "/my-events" : "/tickets")}
          >
            {role === "organizer" ? "Back to my events" : "Back to tickets"}
          </Button>
        </CardContent>
      </Card>

      {ticket?.studentDocument && viewBlob ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {ticket.studentDocument.originalName || "Student proof"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setViewBlob((current) => {
                    if (current) {
                      URL.revokeObjectURL(current);
                    }
                    return null;
                  });
                }}
              >
                Close
              </Button>
            </div>
            <img
              src={viewBlob}
              alt={ticket.studentDocument.originalName || "Student proof"}
              className="mt-4 w-full rounded-xl border border-slate-200"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
