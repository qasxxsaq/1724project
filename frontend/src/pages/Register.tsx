import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "organizer">("customer");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:4000/auth/register", { username, password, role });
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data || "Registration failed");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />
      <select value={role} onChange={e => setRole(e.target.value as "customer" | "organizer")}>
        <option value="customer">Customer</option>
        <option value="organizer">Organizer</option>
      </select>
      <br />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

