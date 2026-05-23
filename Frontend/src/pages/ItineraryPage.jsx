import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  FileText,
  Globe2,
  Loader2,
  Lock,
  Share2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../api/axios";
import ItineraryDetails from "../components/ItineraryDetails";

export default function ItineraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/itineraries/${id}`);
        setItinerary(data.itinerary);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const shareUrl =
    itinerary?.isPublic && itinerary?.shareToken
      ? `${window.location.origin}/share/${itinerary.shareToken}`
      : null;

  const handleToggleShare = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/itineraries/${id}/share`, {
        isPublic: !itinerary.isPublic,
      });
      setItinerary({ ...itinerary, ...data });
      toast.success(data.isPublic ? "Sharing enabled" : "Sharing disabled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update sharing");
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: itinerary.title,
          text: `Check out my trip: ${itinerary.title}`,
          url: shareUrl,
        });
      } catch {
        // user cancelled - ignore
      }
    } else {
      handleCopy();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this itinerary? This cannot be undone.")) return;
    try {
      await api.delete(`/itineraries/${id}`);
      toast.success("Deleted");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="grid h-64 place-items-center text-sm text-ink-500">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!itinerary) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Action bar */}
      <div className="surface mb-6 flex flex-wrap items-center gap-2 p-2 sm:p-2.5 animate-fade-in-up">
        <button
          onClick={handleToggleShare}
          disabled={busy}
          title={itinerary.isPublic ? "Click to make private" : "Click to make public and share"}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            itinerary.isPublic
              ? "bg-primary-50 text-primary-700 hover:bg-primary-100"
              : "bg-ink-100 text-ink-700 hover:bg-ink-200"
          } disabled:opacity-60`}
        >
          {itinerary.isPublic ? <Globe2 size={16} /> : <Lock size={16} />}
          {itinerary.isPublic ? "Public" : "Private"}
        </button>

        {!itinerary.isPublic && (
          <span className="hidden text-xs text-ink-500 sm:inline">
            Click to make public and share
          </span>
        )}

        {itinerary.isPublic && (
          <>
            <button
              onClick={handleCopy}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-100 px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-200 sm:flex-none"
            >
              <Copy size={16} /> <span className="hidden sm:inline">Copy link</span>
            </button>
            <button
              onClick={handleNativeShare}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-3 py-2 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:shadow-pop sm:flex-none"
            >
              <Share2 size={16} /> Share
            </button>
          </>
        )}

        <div className="ml-auto" />
        <button
          onClick={handleDelete}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {shareUrl && (
        <div className="surface mb-6 flex flex-wrap items-center gap-2 bg-gradient-to-r from-primary-50 to-accent-50 p-4 text-sm text-primary-800 animate-fade-in-up">
          <Globe2 size={16} />
          <span className="font-semibold">Public link:</span>
          <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-1.5 font-mono text-xs shadow-soft">
            {shareUrl}
          </code>
          <button
            onClick={handleCopy}
            className="rounded-lg bg-white p-2 text-primary-700 shadow-soft transition-all hover:shadow-card"
            aria-label="Copy link"
          >
            <Copy size={14} />
          </button>
        </div>
      )}

      <ItineraryDetails itinerary={itinerary} />

      {itinerary.files?.length > 0 && (
        <section className="mt-10 animate-fade-in-up">
          <h2 className="mb-3 text-lg font-semibold text-ink-900">Source documents</h2>
          <ul className="space-y-2">
            {itinerary.files.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-soft transition-shadow hover:shadow-card"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-100 text-ink-700">
                    <FileText size={16} />
                  </span>
                  <span className="truncate text-sm font-medium text-ink-900">
                    {f.originalName}
                  </span>
                </div>
                {f.url ? (
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-primary-700 hover:text-primary-800"
                  >
                    Open
                  </a>
                ) : (
                  <span className="text-xs text-ink-500">Not stored</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
