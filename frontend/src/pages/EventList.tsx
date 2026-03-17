import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import type { Event } from "../types";

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "soldout" | "discount" | "upcoming" | "past">("all");
  const [sort, setSort] = useState<"soonest" | "latest" | "lowPrice" | "highPrice">("soonest");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:4000/events").then(res => setEvents(res.data));
  }, []);

  const buyTicket = (id: string) => {
    const token = localStorage.getItem("token");
    axios.post(`http://localhost:4000/events/${id}/buy`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        alert(res.data.message);
        navigate("/tickets");
      })
      .catch(err => alert(err.response?.data || "Purchase failed."));
  };

  const role = localStorage.getItem("role");
  const normalizedSearch = search.trim().toLowerCase();
  const now = new Date();

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.location.toLowerCase().includes(normalizedSearch) ||
        event.info.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      const eventDateTime = new Date(`${event.date}T${event.time}`);

      if (filter === "available") return event.ticketsLeft > 0;
      if (filter === "soldout") return event.ticketsLeft <= 0;
      if (filter === "discount") return event.studentDiscount;
      if (filter === "upcoming") return !Number.isNaN(eventDateTime.getTime()) && eventDateTime > now;
      if (filter === "past") return !Number.isNaN(eventDateTime.getTime()) && eventDateTime < now;
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
    <div>
      <h2>Events</h2>
      <div className="filters">
        <input
          className="search"
          placeholder="Search by title, location, or description"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ minWidth: "260px" }}
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as "all" | "available" | "soldout" | "discount" | "upcoming" | "past")}
          style={{ marginRight: "8px" }}
        >
          <option value="all">All events</option>
          <option value="available">Available</option>
          <option value="soldout">Sold out</option>
          <option value="discount">Student discount</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as "soonest" | "latest" | "lowPrice" | "highPrice")}>
          <option value="soonest">Sort: Soonest</option>
          <option value="latest">Sort: Latest</option>
          <option value="lowPrice">Sort: Lowest price</option>
          <option value="highPrice">Sort: Highest price</option>
        </select>
      </div>
      {filteredEvents.length === 0 && <p>{events.length === 0 ? "No events yet." : "No matching events found."}</p>}
      {filteredEvents.map(e => (
        <div key={e.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
          <h3>{e.title}</h3>
          <p>{e.location} | {e.date} {e.time}</p>
          <p>${e.price} | Tickets left: {e.ticketsLeft}</p>
          <div className="badges">
            <span className={`badge ${e.ticketsLeft <= 0 ? "status_soldout" : "status_available"}`}>
              {e.ticketsLeft <= 0 ? "Sold out" : "Available"}
            </span>
            {e.ticketsLeft > 0 && e.ticketsLeft <= 3 && (
              <span className="badge status_low_availability">
                Low availability
              </span>
            )}
          </div>
          <p>{e.info}</p>
          <div style={{ marginTop: "8px" }}>
            <Link to={`/events/${e.id}`} style={{ marginRight: "8px" }}>View Details</Link>
            {role === "customer" && (
              <button onClick={() => buyTicket(e.id)} disabled={e.ticketsLeft <= 0}>
                {e.ticketsLeft <= 0 ? "Sold Out" : "Buy Ticket"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
