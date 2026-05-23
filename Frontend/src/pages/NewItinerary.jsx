import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import api from "../api/axios";
import FileDropzone, { MAX_TOTAL_BYTES } from "../components/FileDropzone";

export default function NewItinerary() {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please add at least one document");
      return;
    }
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      toast.error(
        "Combined upload exceeds 4.5 MB — Vercel's free tier limit. Remove some files."
      );
      return;
    }

    setLoading(true);
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    try {
      const { data } = await api.post("/itineraries", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      toast.success("Itinerary generated!");
      navigate(`/itineraries/${data.itinerary._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate itinerary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">New itinerary</h1>
        <p className="mt-1 text-sm text-ink-700">
          Upload your flight, hotel and ticket documents. We'll do the rest.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="surface p-5 sm:p-6 animate-fade-in-up">
          <FileDropzone files={files} setFiles={setFiles} disabled={loading} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-xs text-ink-500">
            <ShieldCheck size={14} className="text-primary-600" />
            Documents stay private. Originals stored in your S3 bucket.
          </p>
          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate itinerary
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
