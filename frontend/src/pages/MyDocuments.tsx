import React, { useState, useEffect } from "react";
import { Document } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const MyDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<string>("student_id");
  const [loading, setLoading] = useState(false);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [viewBlob, setViewBlob] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:4000/documents/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("document", file);
    formData.append("type", type);

    try {
      const response = await fetch("http://localhost:4000/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        fetchDocuments();
        setFile(null);
        setType("student_id");
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleView = async (doc: Document) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (doc.mimetype.startsWith("image/")) {
          setViewDoc(doc);
          setViewBlob(url);
        } else {
          window.open(url, "_blank");
        }
      }
    } catch (error) {
      console.error("Error viewing document:", error);
    }
  };

  const handleDownload = async (doc: Document) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.originalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">My Documents</h2>
        <p className="text-sm text-slate-600">Upload, view, and download documents securely.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Upload a document</CardTitle>
          <CardDescription>Select a file and choose a type to upload.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleUpload} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Document type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="student_id">Student ID</option>
                <option value="proof_of_age">Proof of Age</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Select file</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-sm text-slate-700"
                accept="image/*,.pdf"
              />
            </div>

            <Button type="submit" disabled={!file || loading}>
              {loading ? "Uploading" : "Upload document"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-900">Uploaded documents</h3>
        <p className="text-sm text-slate-600">Manage your files and download or view them anytime.</p>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-slate-900">{doc.originalName}</p>
                <p className="text-sm text-slate-500">Type: {doc.type}</p>
                <p className="text-sm text-slate-500">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
              </div>
              <Badge>{doc.mimetype}</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleView(doc)}>
                View
              </Button>
              <Button variant="default" size="sm" onClick={() => handleDownload(doc)}>
                Download
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {viewDoc && viewBlob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">{viewDoc.originalName}</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setViewDoc(null);
                setViewBlob(null);
                URL.revokeObjectURL(viewBlob);
              }}>
                Close
              </Button>
            </div>
            <img src={viewBlob} alt={viewDoc.originalName} className="mt-4 w-full rounded-xl border border-slate-200" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDocuments;
