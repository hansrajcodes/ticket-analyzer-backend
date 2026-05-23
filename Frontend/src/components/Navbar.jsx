import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, Plane, Plus, X } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-semibold text-ink-900"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
            <Plane size={18} />
          </span>
          <span className="text-base sm:text-lg">TripPlanner</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-ink-700 hover:bg-ink-100"
                  }`
                }
              >
                My trips
              </NavLink>
              <Link
                to="/itineraries/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-pop"
              >
                <Plus size={16} /> New
              </Link>
              <button
                onClick={handleLogout}
                className="ml-1 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
                title={user.email}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
              >
                Login
              </NavLink>
              <Link
                to="/register"
                className="inline-flex items-center rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-pop"
              >
                Get started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-xl bg-ink-100 text-ink-700 transition-colors hover:bg-ink-200 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden">
          <nav className="mx-4 mb-3 flex flex-col gap-1 rounded-2xl bg-white p-2 shadow-card animate-fade-in-up">
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-ink-700 hover:bg-ink-50"
                    }`
                  }
                >
                  My trips
                </NavLink>
                <Link
                  to="/itineraries/new"
                  className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-glow"
                >
                  <Plus size={16} /> New itinerary
                </Link>
                <div className="my-1 h-px bg-ink-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-ink-700 hover:bg-ink-50"
                >
                  <LogOut size={16} /> Logout
                  <span className="ml-auto text-xs text-ink-500">{user.email}</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
                >
                  Login
                </NavLink>
                <Link
                  to="/register"
                  className="rounded-xl bg-brand-gradient px-4 py-3 text-center text-sm font-semibold text-white shadow-glow"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
