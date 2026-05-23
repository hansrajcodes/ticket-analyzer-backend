import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Copy, Loader2, Share2 } from "lucide-react";
import toast from "react-hot-toast";

import api from "../api/axios";
import ItineraryDetails from "../components/ItineraryDetails";

export default function SharedItinerary() {
  const { token } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/itineraries/share/${token}`);
        setItinerary(data.itinerary);
      } catch (err) {
        setError(err.response?.data?.message || "This trip is not available");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: itinerary.title,
          text: `Check out this trip: ${itinerary.title}`,
          url: window.location.href,
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-sm text-ink-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="surface p-10 animate-fade-in-up">
          <h1 className="text-xl font-bold text-ink-900">Itinerary not available</h1>
          <p className="mt-2 text-sm text-ink-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="surface mb-6 flex flex-wrap items-center gap-2 p-2 sm:p-2.5 animate-fade-in-up">
        <button
          onClick={handleCopy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-100 px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-200 sm:flex-none"
        >
          <Copy size={16} /> Copy link
        </button>
        <button
          onClick={handleNativeShare}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-pop sm:flex-none"
        >
          <Share2 size={16} /> Share
        </button>
      </div>

      <ItineraryDetails itinerary={itinerary} />

      <p className="mt-10 text-center text-xs text-ink-500">
        Generated with TripPlanner.
      </p>
    </div>
  );
}
