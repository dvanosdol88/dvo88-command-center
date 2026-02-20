import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Zap,
  AlertCircle,
} from "lucide-react";

/* ── Types (mirrors server/services/sentry-triage.ts) ── */

type TriageSeverity = "critical" | "high" | "medium" | "low";

interface TriageResult {
  severity: TriageSeverity;
  impact: string;
  rootCause: string;
  suggestedFix: string;
  affectedProject: string;
}

interface TriagedEvent {
  id: string;
  receivedAt: string;
  sentryEventId: string;
  sentryIssueId: string;
  title: string;
  culprit: string;
  level: string;
  firstSeen: string;
  permalink: string;
  platform: string;
  triage: TriageResult | null;
  triageError: string | null;
  triageDurationMs: number | null;
  status: "triaged" | "error" | "pending";
}

/* ── Severity styling ── */

const severityStyles: Record<TriageSeverity, { badge: string; dot: string; accent: string }> = {
  critical: {
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    dot: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]",
    accent: "text-red-400",
  },
  high: {
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    dot: "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]",
    accent: "text-orange-400",
  },
  medium: {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    accent: "text-amber-400",
  },
  low: {
    badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    dot: "bg-slate-400",
    accent: "text-slate-400",
  },
};

const severityIcons: Record<TriageSeverity, React.FC<{ size?: number }>> = {
  critical: Zap,
  high: AlertTriangle,
  medium: AlertCircle,
  low: ShieldAlert,
};

/* ── Helpers ── */

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

/* ── MetricCard (matches CommandCenter.tsx pattern) ── */

interface MetricCardProps {
  icon: React.FC<{ size?: number }>;
  label: string;
  value: string;
  accent: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-[#131a2b]/80 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4">
    <div className={`p-2.5 rounded-lg bg-slate-700/30 ${accent}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold ${accent}`}>{value}</p>
    </div>
  </div>
);

/* ── Event Card ── */

const EventCard: React.FC<{ event: TriagedEvent }> = ({ event }) => {
  const [expanded, setExpanded] = useState(false);
  const severity = event.triage?.severity ?? "medium";
  const style = severityStyles[severity];
  const SevIcon = severityIcons[severity];

  return (
    <div className="bg-[#131a2b]/80 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/60 transition-all duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${style.dot}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-white truncate">{event.title}</h3>
              {event.triage && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${style.badge}`}>
                  {severity}
                </span>
              )}
              {event.status === "error" && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-red-500/15 text-red-400 border-red-500/30">
                  triage failed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1 truncate">{event.culprit}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-slate-500">{relativeTime(event.receivedAt)}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-slate-700/40 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* AI triage summary (always visible when triaged) */}
      {event.triage && (
        <div className="mt-3 pl-5.5 space-y-1.5">
          <div className="flex items-start gap-2">
            <SevIcon size={14} className={`mt-0.5 shrink-0 ${style.accent}`} />
            <p className="text-xs text-slate-300">
              <span className="text-slate-500 font-medium">Impact:</span> {event.triage.impact}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Zap size={14} className="mt-0.5 shrink-0 text-lime-400" />
            <p className="text-xs text-slate-300">
              <span className="text-slate-500 font-medium">Fix:</span> {event.triage.suggestedFix}
            </p>
          </div>
        </div>
      )}

      {/* Triage error */}
      {event.triageError && (
        <div className="mt-3 pl-5.5">
          <p className="text-xs text-red-400">
            <span className="font-medium">Triage error:</span> {event.triageError}
          </p>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-700/40 pl-5.5 space-y-2">
          {event.triage?.rootCause && (
            <div className="text-xs">
              <span className="text-slate-500 font-medium">Root cause:</span>{" "}
              <span className="text-slate-300">{event.triage.rootCause}</span>
            </div>
          )}
          {event.triage?.affectedProject && event.triage.affectedProject !== "unknown" && (
            <div className="text-xs">
              <span className="text-slate-500 font-medium">Project:</span>{" "}
              <span className="text-slate-300">{event.triage.affectedProject}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Platform: <span className="text-slate-400">{event.platform}</span></span>
            <span>Level: <span className="text-slate-400">{event.level}</span></span>
            {event.triageDurationMs != null && (
              <span>Triage: <span className="text-slate-400">{event.triageDurationMs}ms</span></span>
            )}
            <span>First seen: <span className="text-slate-400">{relativeTime(event.firstSeen)}</span></span>
          </div>
          {event.permalink && (
            <a
              href={event.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-lime-400 hover:text-lime-300 transition-colors mt-1"
            >
              <ExternalLink size={12} />
              View in Sentry
            </a>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   ErrorTriagePanel — main panel component
   ══════════════════════════════════════════════════════════ */

const POLL_INTERVAL_MS = 30_000;

const ErrorTriagePanel: React.FC = () => {
  const [events, setEvents] = useState<TriagedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/sentry-events", {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      if (!payload.ok) throw new Error(payload.error ?? "Unknown error");
      return payload.data as TriagedEvent[];
    } catch (err) {
      if ((err as Error).name === "AbortError") return null;
      throw err;
    }
  };

  // Polling loop
  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;

    const load = async () => {
      try {
        const data = await fetchEvents();
        if (cancelled || !data) return;
        setEvents(data);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) {
          setLoading(false);
          timer = window.setTimeout(load, POLL_INTERVAL_MS);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, []);

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchEvents();
      if (data) {
        setEvents(data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRefreshing(false);
    }
  };

  // Compute severity counts
  const counts = { critical: 0, high: 0, medium: 0, total: events.length };
  for (const ev of events) {
    const sev = ev.triage?.severity;
    if (sev === "critical") counts.critical++;
    else if (sev === "high") counts.high++;
    else if (sev === "medium") counts.medium++;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-500/10">
            <ShieldAlert size={22} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Error Triage</h1>
            <p className="text-xs text-slate-500">AI-powered Sentry error analysis</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-700/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Zap}           label="Critical" value={String(counts.critical)} accent="text-red-400" />
        <MetricCard icon={AlertTriangle}  label="High"     value={String(counts.high)}     accent="text-orange-400" />
        <MetricCard icon={AlertCircle}    label="Medium"   value={String(counts.medium)}   accent="text-amber-400" />
        <MetricCard icon={ShieldAlert}    label="Total"    value={String(counts.total)}    accent="text-slate-300" />
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-400">Failed to fetch events: {error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={20} className="animate-spin text-slate-500" />
          <span className="ml-3 text-sm text-slate-500">Loading events...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && events.length === 0 && (
        <div className="bg-[#131a2b]/80 border border-slate-700/50 rounded-xl p-10 text-center">
          <ShieldAlert size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300 mb-1">No errors received yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Configure a Sentry Internal Integration webhook pointing to{" "}
            <code className="text-lime-400 bg-slate-700/40 px-1.5 py-0.5 rounded text-[11px]">
              https://dvo88.com/api/sentry-webhook
            </code>{" "}
            with the <strong>issue</strong> resource enabled. Errors will appear here with AI-powered triage.
          </p>
        </div>
      )}

      {/* Event list */}
      {!loading && events.length > 0 && (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ErrorTriagePanel;
