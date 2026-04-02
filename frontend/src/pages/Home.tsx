import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";

export default function Home() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Welcome to Ticketing!</h1>
          <p className="text-slate-600">
            Discover brilliant events, manage your ticket inventory, or purchase your next experience in a few clicks.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
            {!token ? (
              <Button variant="secondary" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            ) : role === "organizer" ? (
              <Button variant="secondary" asChild>
                <Link to="/create">Create Event</Link>
              </Button>
            ) : (
              <Button variant="secondary" asChild>
                <Link to="/tickets">My Tickets</Link>
              </Button>
            )}
          </div>
        </div>

        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
            <CardDescription>
              Discover your next experience by Browse Events! Sign In to manage your listings, or see tickets and documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-9 w-9 shrink-0items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">📌</span>
              <div>
                <p className="text-sm font-medium text-slate-900">Search with ease</p>
                <p className="text-sm text-slate-600">Find events by title, location, or description using the search box.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">⚡</span>
              <div>
                <p className="text-sm font-medium text-slate-900">Fast actions</p>
                <p className="text-sm text-slate-600">Buy tickets, manage events, or review documents with a responsive and mobile-friendly interface.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
