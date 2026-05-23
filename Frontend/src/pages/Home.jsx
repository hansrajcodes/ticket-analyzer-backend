import { Link } from "react-router-dom";
import {
  Sparkles,
  UploadCloud,
  Wand2,
  Share2,
  ArrowRight,
  Plane,
  CalendarDays,
  MapPinned,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-glow">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              Drop in your bookings.{" "}
              <span className="bg-brand-gradient bg-clip-text text-transparent">
                Get a beautiful itinerary
              </span>{" "}
              in seconds.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-ink-700 sm:text-lg">
              Upload your flight, hotel and travel tickets — we read them,
              organize them and build a clean day-by-day plan you can share.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={user ? "/itineraries/new" : "/register"} className="btn-primary w-full sm:w-auto">
                {user ? "Create itinerary" : "Get started free"}
                <ArrowRight size={16} />
              </Link>
              <Link to={user ? "/dashboard" : "/login"} className="btn-ghost w-full sm:w-auto">
                {user ? "My trips" : "Login"}
              </Link>
            </div>
          </div>

          {/* Decorative preview card */}
          <div className="mx-auto mt-14 max-w-3xl">
            <div className="surface relative overflow-hidden p-1">
              <div className="rounded-[14px] bg-gradient-to-br from-primary-50 via-white to-accent-50 p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="chip-primary mb-2">
                      <Plane size={12} /> Sample trip
                    </p>
                    <h3 className="text-xl font-bold text-ink-900 sm:text-2xl">
                      Tokyo & Kyoto getaway
                    </h3>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-700">
                      <span className="inline-flex items-center gap-1">
                        <MapPinned size={14} /> Japan
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={14} /> 7 days
                      </span>
                    </p>
                  </div>
                  <span className="chip-accent">
                    <Sparkles size={12} /> AI generated
                  </span>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {["Day 1 · Tokyo arrival", "Day 4 · Shinkansen to Kyoto", "Day 6 · Fushimi Inari"].map((t) => (
                    <div key={t} className="rounded-xl bg-white px-3 py-2.5 text-xs font-medium text-ink-700 shadow-soft">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <UploadCloud size={22} />,
              tint: "from-primary-500 to-primary-700",
              title: "Upload anything",
              body: "PDFs or screenshots of e-tickets. Up to 8 documents at a time.",
            },
            {
              icon: <Wand2 size={22} />,
              tint: "from-accent-500 to-accent-700",
              title: "AI does the work",
              body: "Each document is parsed and assembled into a chronological itinerary.",
            },
            {
              icon: <Share2 size={22} />,
              tint: "from-primary-600 to-accent-600",
              title: "Share in one click",
              body: "Toggle a public link and share via WhatsApp, email or the native share sheet.",
            },
          ].map((c, i) => (
            <div
              key={c.title}
              className="surface-pop p-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${c.tint} text-white shadow-glow`}
              >
                {c.icon}
              </div>
              <h3 className="text-lg font-semibold text-ink-900">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
