import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Users, ArrowUpRight } from "lucide-react";

const formatRange = (start, end) => {
  if (!start && !end) return "";
  if (start && end && start !== end) return `${start} → ${end}`;
  return start || end;
};

export default function ItineraryCard({ itinerary }) {
  return (
    <Link
      to={`/itineraries/${itinerary._id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-pop"
    >
      <div className="h-1.5 bg-brand-gradient" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-ink-900 group-hover:text-primary-700">
            {itinerary.title}
          </h3>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-100 text-ink-700 transition-colors group-hover:bg-primary-100 group-hover:text-primary-700">
            <ArrowUpRight size={16} />
          </span>
        </div>

        {itinerary.summary && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-700">
            {itinerary.summary}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {itinerary.destination && (
            <span className="chip">
              <MapPin size={12} /> {itinerary.destination}
            </span>
          )}
          {(itinerary.startDate || itinerary.endDate) && (
            <span className="chip">
              <CalendarDays size={12} /> {formatRange(itinerary.startDate, itinerary.endDate)}
            </span>
          )}
          {itinerary.travelers > 0 && (
            <span className="chip">
              <Users size={12} /> {itinerary.travelers}
            </span>
          )}
          {itinerary.isPublic && (
            <span className="chip-primary">Public</span>
          )}
        </div>
      </div>
    </Link>
  );
}
