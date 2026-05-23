import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, MapPinned } from "lucide-react";
import toast from "react-hot-toast";

import api from "../api/axios";
import ItineraryCard from "../components/ItineraryCard";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/itineraries");
        setItems(data.items || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load trips");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">My trips</h1>
          <p className="mt-1 text-sm text-ink-700">
            All the itineraries you've generated.
          </p>
        </div>
        <Link to="/itineraries/new" className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> New itinerary
        </Link>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl bg-white shadow-soft"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="surface flex flex-col items-center p-10 text-center sm:p-14 animate-fade-in-up">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
              <MapPinned size={22} />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-ink-900 sm:text-xl">
              No trips yet
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-ink-700">
              Upload your first booking — a flight ticket, hotel confirmation,
              anything — and we'll build a clean itinerary for you.
            </p>
            <Link to="/itineraries/new" className="btn-primary mt-6">
              <Plus size={16} /> Upload bookings
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <div
                key={it._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <ItineraryCard itinerary={it} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
