import { useEffect, useState, useCallback } from "react";
import { getSocket } from "../lib/socket";
import type { Event } from "../types";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

type ToastVariant = "new" | "updated" | "deleted";

type Toast = {
  id: string;
  variant: ToastVariant;
  event: Event;
};

const variantConfig: Record<ToastVariant, { label: string; border: string; accent: string }> = {
  new:     { label: "New event posted!",  border: "border-indigo-200", accent: "text-indigo-600" },
  updated: { label: "Event updated",      border: "border-amber-200",  accent: "text-amber-600" },
  deleted: { label: "Event canceled",      border: "border-red-200",    accent: "text-red-600" },
};

export default function EventNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (variant: ToastVariant, event: Event) => {
      const id = event.id + "-" + variant + "-" + Date.now();
      setToasts((prev) => [...prev, { id, variant, event }]);
      setTimeout(() => dismiss(id), 6000);
    },
    [dismiss],
  );

  useEffect(() => {
    const socket = getSocket();

    const onNew = (event: Event) => pushToast("new", event);
    const onUpdated = (event: Event) => pushToast("updated", event);
    const onDeleted = (payload: { id: string; title: string }) =>
      pushToast("deleted", { id: payload.id, title: payload.title } as Event);

    socket.on("newEvent", onNew);
    socket.on("eventUpdated", onUpdated);
    socket.on("eventDeleted", onDeleted);
    return () => {
      socket.off("newEvent", onNew);
      socket.off("eventUpdated", onUpdated);
      socket.off("eventDeleted", onDeleted);
    };
  }, [pushToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const cfg = variantConfig[t.variant];
        return (
          <div
            key={t.id}
            className={`animate-slide-in rounded-lg border ${cfg.border} bg-white p-4 shadow-lg`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-xs font-medium ${cfg.accent}`}>{cfg.label}</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                  {t.event.title}
                </p>
                {t.variant !== "deleted" && t.event.location && (
                  <p className="text-xs text-slate-500">
                    {t.event.location} &bull; {t.event.date} @ {t.event.time}
                  </p>
                )}
                {t.variant !== "deleted" && (
                  <Link
                    to={`/events/${t.event.id}`}
                    className={`mt-1 inline-block text-xs font-medium ${cfg.accent} hover:underline`}
                    onClick={() => dismiss(t.id)}
                  >
                    View details &rarr;
                  </Link>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
