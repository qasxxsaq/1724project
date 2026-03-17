import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Event } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "soldout" | "discount">("all");
  const [sort, setSort] = useState<"soonest" | "latest" | "lowTickets" | "highRevenue">("soonest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlySoonAvailable, setOnlySoonAvailable] = useState(false);
  const navigate = useNavigate();

  const loadEvents = useCallback(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get("http://localhost:4000/events/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setEvents(res.data))
      .catch((err) => {
        console.error(err);
        alert(err.response?.data || "Failed to load my events");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadEvents();

    const handler = () => {
      loadEvents();
    };
    window.addEventListener("eventsUpdated", handler);

    const interval = setInterval(loadEvents, 6000);
    return () => {
      window.removeEventListener("eventsUpdated", handler);
      clearInterval(interval);
    };
  }, [loadEvents]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:4000/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      window.dispatchEvent(new Event("eventsUpdated"));
    } catch (err: any) {
      alert(err.response?.data || "Failed to delete event");
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const now = new Date();

  const totalRevenue = events.reduce((sum, event) => sum + (event.revenue ?? 0), 0);
  const totalTicketsSold = events.reduce((sum, event) => sum + (event.soldCount ?? 0), 0);
  const soldOutCount = events.filter((event) => event.ticketsLeft <= 0).length;

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
    setSort("soonest");
    setStartDate("");
    setEndDate("");
    setMinPrice("");
    setMaxPrice("");
    setOnlySoonAvailable(false);
  };

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.location.toLowerCase().includes(normalizedSearch) ||
        event.info.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const eventDay = new Date(`${event.date}T00:00:00`);

      if (filter === "upcoming") return !Number.isNaN(eventDateTime.getTime()) && eventDateTime > now;
      if (filter === "past") return !Number.isNaN(eventDateTime.getTime()) && eventDateTime < now;
      if (filter === "soldout") return event.ticketsLeft <= 0;
      if (filter === "discount") return event.studentDiscount;

      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);
        if (eventDay < start) return false;
      }
      if (endDate) {
        const end = new Date(`${endDate}T23:59:59`);
        if (eventDay > end) return false;
      }
      if (minPrice && event.price < Number(minPrice)) return false;
      if (maxPrice && event.price > Number(maxPrice)) return false;
      if (onlySoonAvailable && !(event.ticketsLeft > 0 && !Number.isNaN(eventDateTime.getTime()) && eventDateTime > now)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time}`).getTime();
      const bDate = new Date(`${b.date}T${b.time}`).getTime();

      if (sort === "latest") return bDate - aDate;
      if (sort === "lowTickets") return a.ticketsLeft - b.ticketsLeft;
      if (sort === "highRevenue") return (b.revenue ?? 0) - (a.revenue ?? 0);
      return aDate - bDate;
    });

  const isPastEvent = (event: Event) => {
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    return !Number.isNaN(eventDateTime.getTime()) && eventDateTime <= now;
  };

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">My Events</h2>
          <p className="text-sm text-slate-600">Monitor and manage events you have published.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge>Revenue: ${totalRevenue.toFixed(2)}</Badge>
          <Badge>Sold tickets: {totalTicketsSold}</Badge>
          <Badge>Sold out: {soldOutCount}</Badge>
        </div>
      </header>

      {loading && <p className="text-sm text-slate-600">Updating dashboard</p>}

      <Card>
        <CardHeader>
          <CardTitle>Search & filters</CardTitle>
          <CardDescription>Quickly locate events by keyword and status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your events"
            />

            <select
              className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All events</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="soldout">Sold out</option>
              <option value="discount">Student discount</option>
            </select>

            <select
              className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="soonest">Sort: Soonest</option>
              <option value="latest">Sort: Latest</option>
              <option value="lowTickets">Sort: Lowest tickets</option>
              <option value="highRevenue">Sort: Highest revenue</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-input bg-background text-indigo-500 focus:ring-indigo-500"
                checked={onlySoonAvailable}
                onChange={(e) => setOnlySoonAvailable(e.target.checked)}
              />
              Upcoming with tickets
            </label>
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Reset
            </Button>
            <span className="text-sm text-slate-500">Showing {filteredEvents.length} of {events.length} events</span>
          </div>
        </CardContent>
      </Card>

      {filteredEvents.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          {events.length === 0 ? "You have not created any events yet." : "No matching events found."}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredEvents.map((e) => {
            const isSoldOut = e.ticketsLeft <= 0;
            const isLow = e.ticketsLeft > 0 && e.ticketsLeft <= 3;
            const isPast = isPastEvent(e);

            return (
              <Card key={e.id} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{e.title}</h3>
                    <p className="text-sm text-slate-600">
                      {e.location} • {e.date} @ {e.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Price</p>
                    <p className="text-base font-medium text-slate-900">${e.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isSoldOut ? "danger" : "success"}>
                    {isSoldOut ? "Sold out" : "Available"}
                  </Badge>
                  {isLow && <Badge variant="warning">Low availability</Badge>}
                  {isPast && <Badge variant="secondary">Past event</Badge>}
                </div>

                <div className="grid gap-2">
                  <p className="text-sm text-slate-600">{e.info}</p>
                  <p className="text-xs text-slate-500">Tickets sold: {e.soldCount ?? 0} • Revenue: ${e.revenue ?? 0}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigate(`/my-events/edit/${e.id}`)} disabled={isPast}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm("Confirm delete this event?")) {
                        handleDelete(e.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
