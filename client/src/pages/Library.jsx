import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

function Badge({ ok, children }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default function Library() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("all"); // all|book|movie
  const [availability, setAvailability] = useState("all"); // all|available|unavailable
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const params = {};
        if (type !== "all") params.type = type;
        if (availability === "available") params.available = "true";
        if (availability === "unavailable") params.available = "false";
        if (search.trim()) params.search = search.trim();

        const res = await api.get("/items", { params });
        if (!ignore) setItems(res.data);
      } catch (e) {
        if (!ignore) setErr(e?.response?.data?.error || "Failed to load items");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [type, availability, search]);

  const summary = useMemo(() => {
    const total = items.length;
    const available = items.filter((x) => (x.availableCount ?? 0) > 0).length;
    const borrowed = total - available;
    return { total, available, borrowed };
  }, [items]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Library catalog</h1>
        <p className="mt-1 text-sm text-slate-600">
          Total: {summary.total} • Available: {summary.available} • Borrowed:{" "}
          {summary.borrowed}
        </p>

        <div className="mt-6 grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Type</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="book">Books</option>
              <option value="movie">Movies</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Availability
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Borrowed</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Search</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              placeholder="Title or author/producer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <p className="mt-6 text-sm text-slate-600">Loading items…</p>
        )}
        {err && <p className="mt-6 text-sm text-red-600">{err}</p>}

        {!loading && !err && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => {
              const isAvailable = (it.availableCount ?? 0) > 0;
              const totalCount = it.totalCount ?? 0;
              const availableCount = it.availableCount ?? 0;
              const borrowedCount =
                it.borrowedCount ?? Math.max(0, totalCount - availableCount);

              return (
                <div
                  key={it._id}
                  className="rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        {it.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {it.type === "book" ? "Book" : "Movie"}
                        {it.authorOrProducer ? ` • ${it.authorOrProducer}` : ""}
                      </p>
                    </div>
                    <Badge ok={isAvailable}>
                      {isAvailable ? "Available" : "Borrowed"}
                    </Badge>
                  </div>

                  <div className="mt-4 text-sm text-slate-700">
                    <p>
                      <span className="font-medium">Available:</span>{" "}
                      {availableCount}
                    </p>
                    <p>
                      <span className="font-medium">Borrowed:</span>{" "}
                      {borrowedCount}
                    </p>
                    <p>
                      <span className="font-medium">Total:</span> {totalCount}
                    </p>
                  </div>

                  {Array.isArray(it.tags) && it.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {it.tags.slice(0, 6).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
