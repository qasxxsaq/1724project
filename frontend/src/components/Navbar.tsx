import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Menu, X, LogOut } from "lucide-react";

const navLinks = [
  { to: "/events", label: "Events" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [menuOpen, setMenuOpen] = useState(false);

  const links = useMemo(() => {
    const base = [...navLinks];

    if (!token) {
      base.push({ to: "/login", label: "Login" });
      base.push({ to: "/register", label: "Register" });
      return base;
    }

    if (role === "customer") {
      base.push({ to: "/tickets", label: "My Tickets" });
      base.push({ to: "/documents", label: "My Documents" });
    }

    if (role === "organizer") {
      base.push({ to: "/create", label: "Create Event" });
      base.push({ to: "/my-events", label: "My Events" });
    }

    return base;
  }, [role, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleNavigate = (to: string) => {
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold text-slate-900 hover:text-indigo-600"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            🎫
          </span>
          <span>Ticketing</span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm md:flex">
          {links.map((link) => (
            <Button key={link.to} variant="ghost" size="sm" asChild>
              <Link to={link.to}>{link.label}</Link>
            </Button>
          ))}

          {token && (
            <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {token && (
            <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:block">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Button
                key={link.to}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => handleNavigate(link.to)}
              >
                {link.label}
              </Button>
            ))}
            {token && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="justify-start"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
