import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Event } from "../types";

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "soldout" | "discount">("all");
  const [sort, setSort] = useState<"soonest" | "latest" | "lowTickets" | "highRevenue">("soonest");
  const navigate = useNavigate();

  const loadEvents = useCallback(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    axios
      .get("http://localhost:4000/events/my", {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
          Authorization: `Bearer ${token}`
        }
      });
      window.dispatchEvent(new Event("eventsUpdated"));
    } catch (err: any) {
      alert(err.response?.data || "Failed to delete event");
    }
  };

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

      if (filter === "upcoming") return !Number.isNaN(eventDateTime.getTime()) && eventDateTime > now;
      if (filter === "past") return !Number.isNaN(eventDateTime.getTime()) && eventDateTime < now;
      if (filter === "soldout") return event.ticketsLeft <= 0;
      if (filter === "discount") return event.studentDiscount;
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

  return (
    <div>
      <h2>My Events</h2>
      {loading && <p>Updating dashboard...</p>}
      <div className="filters">
        <input
          className="search"
          placeholder="Search your events"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as "all" | "upcoming" | "past" | "soldout" | "discount")}
          style={{ marginRight: "8px" }}
        >
          <option value="all">All events</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="soldout">Sold out</option>
          <option value="discount">Student discount</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as "soonest" | "latest" | "lowTickets" | "highRevenue")}>
          <option value="soonest">Sort: Soonest</option>
          <option value="latest">Sort: Latest</option>
          <option value="lowTickets">Sort: Lowest tickets</option>
          <option value="highRevenue">Sort: Highest revenue</option>
        </select>
      </div>
      {filteredEvents.length === 0 ? (
        <p>{events.length === 0 ? "You have not created any events yet." : "No matching events found."}</p>
      ) : (
        filteredEvents.map((e) => (
          <div key={e.id} style={{ border: "1px solid #ececec", margin: "8px", padding: "8px", borderRadius: "6px" }}>
            <h3>{e.title}</h3>
            <p>Location: {e.location}</p>
            <p>Date: {e.date} | Time: {e.time}</p>
            <p>Price: ${e.price}</p>
            <p>Tickets left: {e.ticketsLeft}</p>
            <p>Tickets sold: {e.soldCount ?? 0}</p>
            <p>Revenue: ${e.revenue ?? 0}</p>
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
            <p>Description: {e.info}</p>
            <div style={{ margin: "10px 0" }}>
              <strong>Sales details</strong>
              {e.sales && e.sales.length > 0 ? (
                e.sales.map((sale) => (
                  <div key={sale.id} style={{ borderTop: "1px dashed #ddd", padding: "6px 0" }}>
                    <div>Buyer: {sale.buyerUsername}</div>
                    <div>Purchased: {new Date(sale.purchasedAt).toLocaleString()}</div>
                    <div>Price paid: ${sale.purchasePrice}</div>
                    <div>Student discount: {sale.discountApplied ? "Yes" : "No"}</div>
                  </div>
                ))
              ) : (
                <p>No tickets sold yet.</p>
              )}
            </div>
            <button onClick={() => navigate(`/my-events/edit/${e.id}`)}>Edit</button>
            <button onClick={() => {
              if (window.confirm("Confirm delete this event?")) {
                handleDelete(e.id);
              }
            }}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}
