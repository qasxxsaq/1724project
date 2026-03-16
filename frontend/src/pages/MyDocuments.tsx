import React, { useState, useEffect } from "react";
import { Document } from "../types";

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Documents</h1>

      <form onSubmit={handleUpload} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Document Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="student_id">Student ID</option>
            <option value="proof_of_age">Proof of Age</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded w-full"
            accept="image/*,.pdf"
          />
        </div>
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <h2 className="text-xl font-bold mb-4">Uploaded Documents</h2>
      <div className="grid gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-medium">{doc.originalName}</p>
              <p className="text-sm text-gray-600">Type: {doc.type}</p>
              <p className="text-sm text-gray-600">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(doc)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                View
              </button>
              <button
                onClick={() => handleDownload(doc)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Download
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {viewDoc && viewBlob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded max-w-3xl max-h-3xl overflow-auto">
            <h3 className="text-lg font-bold mb-2">{viewDoc.originalName}</h3>
            <img src={viewBlob} alt={viewDoc.originalName} className="max-w-full max-h-full" />
            <button
              onClick={() => {
                setViewDoc(null);
                setViewBlob(null);
                URL.revokeObjectURL(viewBlob);
              }}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDocuments;