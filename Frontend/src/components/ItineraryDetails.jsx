import {
  CalendarDays,
  MapPin,
  Users,
  Plane,
  Hotel,
  Train,
  Bus,
  Car,
  Ship,
  Ticket,
  Utensils,
  StickyNote,
  Clock,
  Lightbulb,
} from "lucide-react";

const BOOKING_ICONS = {
  flight: Plane,
  hotel: Hotel,
  train: Train,
  bus: Bus,
  car: Car,
  cruise: Ship,
  activity: Ticket,
  other: StickyNote,
};

const ACTIVITY_ICONS = {
  flight: Plane,
  hotel: Hotel,
  transport: Bus,
  activity: Ticket,
  meal: Utensils,
  note: StickyNote,
};

const ACTIVITY_TINTS = {
  flight: "bg-primary-50 text-primary-700",
  hotel: "bg-accent-50 text-accent-700",
  transport: "bg-emerald-50 text-emerald-700",
  activity: "bg-amber-50 text-amber-700",
  meal: "bg-rose-50 text-rose-700",
  note: "bg-ink-100 text-ink-700",
};

const formatRange = (a, b) => {
  if (!a && !b) return "";
  if (a && b && a !== b) return `${a} → ${b}`;
  return a || b;
};

export default function ItineraryDetails({ itinerary }) {
  const {
    title,
    destination,
    startDate,
    endDate,
    travelers,
    summary,
    bookings = [],
    days = [],
    tips = [],
  } = itinerary;

  return (
    <article className="space-y-8">
      {/* Hero header */}
      <header className="relative overflow-hidden rounded-3xl bg-brand-gradient p-6 text-white shadow-pop sm:p-10 animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/0 via-black/0 to-white/10" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {destination && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                <MapPin size={14} /> {destination}
              </span>
            )}
            {(startDate || endDate) && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                <CalendarDays size={14} /> {formatRange(startDate, endDate)}
              </span>
            )}
            {travelers > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                <Users size={14} /> {travelers} traveler{travelers === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {summary && (
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg">
              {summary}
            </p>
          )}
        </div>
      </header>

      {/* Bookings */}
      {bookings.length > 0 && (
        <section className="animate-fade-in-up">
          <h2 className="mb-4 text-lg font-semibold text-ink-900 sm:text-xl">Bookings</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {bookings.map((b, i) => {
              const Icon = BOOKING_ICONS[b.type] || StickyNote;
              return (
                <div
                  key={i}
                  className="surface-pop p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {b.title || b.type}
                      </p>
                      {b.provider && (
                        <p className="truncate text-xs text-ink-500">{b.provider}</p>
                      )}
                      <div className="mt-3 space-y-1.5 text-xs text-ink-700">
                        {b.reference && (
                          <div>
                            Ref:{" "}
                            <span className="rounded-md bg-ink-100 px-1.5 py-0.5 font-mono text-ink-900">
                              {b.reference}
                            </span>
                          </div>
                        )}
                        {(b.origin || b.destination) && (
                          <div className="font-medium text-ink-900">
                            {b.origin}
                            {b.origin && b.destination && " → "}
                            {b.destination}
                          </div>
                        )}
                        {(b.startDate || b.endDate) && (
                          <div className="inline-flex items-center gap-1">
                            <CalendarDays size={12} />{" "}
                            {formatRange(b.startDate, b.endDate)}
                          </div>
                        )}
                        {b.location && (
                          <div className="inline-flex items-center gap-1">
                            <MapPin size={12} /> {b.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Day-by-day */}
      {days.length > 0 && (
        <section className="animate-fade-in-up">
          <h2 className="mb-4 text-lg font-semibold text-ink-900 sm:text-xl">Day by day</h2>
          <div className="space-y-5">
            {days.map((d, i) => (
              <div key={i} className="surface overflow-hidden">
                <div className="flex items-center gap-3 bg-gradient-to-r from-primary-50 to-accent-50 px-5 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient text-sm font-bold text-white shadow-glow">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-ink-900 sm:text-lg">
                      {d.date || `Day ${i + 1}`}
                    </h3>
                    {d.summary && (
                      <p className="mt-0.5 text-sm leading-snug text-ink-700">{d.summary}</p>
                    )}
                  </div>
                </div>

                {d.activities?.length > 0 && (
                  <ul className="divide-y divide-ink-100 px-5 py-2">
                    {d.activities.map((a, j) => {
                      const Icon = ACTIVITY_ICONS[a.type] || StickyNote;
                      const tint = ACTIVITY_TINTS[a.type] || ACTIVITY_TINTS.note;
                      return (
                        <li key={j} className="flex gap-3 py-3">
                          <span
                            className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}
                          >
                            <Icon size={16} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              {a.time && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
                                  <Clock size={12} /> {a.time}
                                </span>
                              )}
                              <p className="text-sm font-semibold text-ink-900">
                                {a.title}
                              </p>
                            </div>
                            {a.description && (
                              <p className="mt-1 text-sm leading-relaxed text-ink-700">
                                {a.description}
                              </p>
                            )}
                            {a.location && (
                              <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
                                <MapPin size={12} /> {a.location}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <section className="animate-fade-in-up">
          <h2 className="mb-4 text-lg font-semibold text-ink-900 sm:text-xl">Tips</h2>
          <div className="surface p-5 sm:p-6">
            <ul className="space-y-3">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink-700">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
                    <Lightbulb size={14} />
                  </span>
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
