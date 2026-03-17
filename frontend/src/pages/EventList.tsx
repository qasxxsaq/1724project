import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import type { Event } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "soldout" | "discount" | "upcoming" | "past">("all");
  const [sort, setSort] = useState<"soonest" | "latest" | "lowPrice" | "highPrice">("soonest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlySoonAvailable, setOnlySoonAvailable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:4000/events").then((res) => setEvents(res.data));
  }, []);

  const buyTicket = (id: string) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        `http://localhost:4000/events/${id}/buy`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        alert(res.data.message);
        navigate("/tickets");
      })
      .catch((err) => alert(err.response?.data || "Purchase failed."));
  };

  const role = localStorage.getItem("role");
  const normalizedSearch = search.trim().toLowerCase();
  const now = new Date();

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
      const isUpcoming = !Number.isNaN(eventDateTime.getTime()) && eventDateTime > now;
      const isPast = !Number.isNaN(eventDateTime.getTime()) && eventDateTime < now;
      const isAvailable = event.ticketsLeft > 0;
      const isSoldOut = event.ticketsLeft <= 0;
      const hasDiscount = event.studentDiscount;

      if (filter === "available" && !isAvailable) return false;
      if (filter === "soldout" && !isSoldOut) return false;
      if (filter === "discount" && !hasDiscount) return false;
      if (filter === "upcoming" && !isUpcoming) return false;
      if (filter === "past" && !isPast) return false;

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
      if (onlySoonAvailable && !(isAvailable && isUpcoming)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time}`).getTime();
      const bDate = new Date(`${b.date}T${b.time}`).getTime();

      if (sort === "latest") return bDate - aDate;
      if (sort === "lowPrice") return a.price - b.price;
      if (sort === "highPrice") return b.price - a.price;
      return aDate - bDate;
    });

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Events</h2>
          <p className="text-sm text-slate-600">Browse and filter upcoming events.</p>
        </div>
        <Button variant="secondary" onClick={resetFilters} className="w-fit">
          Reset filters
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, location, or description"
            />

            <select
              className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All events</option>
              <option value="available">Available</option>
              <option value="soldout">Sold out</option>
              <option value="discount">Student discount</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>

            <select
              className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="soonest">Sort: Soonest</option>
              <option value="latest">Sort: Latest</option>
              <option value="lowPrice">Sort: Lowest price</option>
              <option value="highPrice">Sort: Highest price</option>
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
            <span className="text-sm text-slate-500">Showing {filteredEvents.length} of {events.length} event(s)</span>
          </div>
        </CardContent>
      </Card>

      {filteredEvents.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          {events.length === 0 ? "No events yet." : "No matching events found."}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((e) => {
            const isSoldOut = e.ticketsLeft <= 0;
            const isLow = e.ticketsLeft > 0 && e.ticketsLeft <= 3;

            return (
              <Card key={e.id} className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{e.title}</h3>
                    <p className="text-sm text-slate-600">
                      {e.location} • {e.date} @ {e.time}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm text-slate-500">${e.price.toFixed(2)}</span>
                    <span className="text-xs text-slate-500">{e.ticketsLeft} left</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3">{e.info}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={isSoldOut ? "danger" : "success"}>
                    {isSoldOut ? "Sold out" : "Available"}
                  </Badge>
                  {isLow && <Badge variant="warning">Low availability</Badge>}
                  {e.studentDiscount && <Badge>Student discount</Badge>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to={`/events/${e.id}`}>View details</Link>
                  </Button>
                  {role === "customer" && (
                    <Button
                      size="sm"
                      disabled={isSoldOut}
                      onClick={() => buyTicket(e.id)}
                      variant={isSoldOut ? "outline" : "default"}
                    >
                      {isSoldOut ? "Sold out" : "Buy ticket"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
