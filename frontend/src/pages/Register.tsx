import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "organizer">("customer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { username, password, role });
      if (!res.data?.message) {
        alert("Registration failed: unexpected server response. Check API configuration.");
        return;
      }
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Create an account</h2>
        <p className="text-sm text-slate-600">Register to buy tickets or publish events as an organizer.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Choose a username, password, and role to get started.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="john.doe"
              autoComplete="username"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={role}
              onChange={(e) => setRole(e.target.value as "customer" | "organizer")}
            >
              <option value="customer">Customer (buy tickets)</option>
              <option value="organizer">Organizer (create events)</option>
            </select>
          </div>

          <Button onClick={handleRegister} disabled={loading}>
            {loading ? "Creating account" : "Create account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
