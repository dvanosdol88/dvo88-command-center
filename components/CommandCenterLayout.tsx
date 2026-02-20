import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PROJECTS, type ProjectConfig } from "../src/config/projects";
import { useProjectLastUpdated } from "../src/hooks/useProjectLastUpdated";
import {
  LayoutGrid,
  Activity,
  Map,
  Settings,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface CommandCenterLayoutProps {
  children: React.ReactNode;
}

/* ── helpers ── */
const statusDotClass: Record<string, string> = {
  green: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
  yellow: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
  red: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]",
};

/** Build a cross-project activity feed sorted newest-first.
 *  Merges static recentChanges with dynamic lastUpdated overrides so that
 *  real-time GitHub push activity appears even without manual config edits. */
function buildActivityFeed(
  projects: ProjectConfig[],
  overrides: Record<string, string>,
) {
  const items: { date: string; project: string; summary: string; status: string }[] = [];
  for (const p of projects) {
    // Static entries from config
    for (const c of p.recentChanges) {
      items.push({ date: c.date, project: p.name, summary: c.summary, status: p.status });
    }

    // Dynamic entry from live lastUpdated override
    const overrideTs = overrides[p.slug];
    if (overrideTs) {
      const overrideDate = overrideTs.slice(0, 10); // "YYYY-MM-DD"
      const latestStaticDate = p.recentChanges[0]?.date ?? "";
      if (overrideDate > latestStaticDate) {
        items.push({
          date: overrideDate,
          project: p.name,
          summary: "Latest commit activity",
          status: p.status,
        });
      }
    }
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  return items.slice(0, 10);
}

function relativeDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const activityDotClass: Record<string, string> = {
  green: "bg-emerald-400",
  yellow: "bg-amber-400",
  red: "bg-red-400",
};

/* ── nav items ── */
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, path: "/" },
  { label: "Activity Log", icon: Activity, path: "/activity" },
  { label: "Roadmap", icon: Map, path: "/roadmap" },
  { label: "Error Triage", icon: ShieldAlert, path: "/error-triage" },
  { label: "Settings", icon: Settings, path: "/settings" },
];


/* ── Passcode Gate (reused logic from SharedLayout) ── */
const PasscodeGate: React.FC<{ onAuthenticated: () => void }> = ({ onAuthenticated }) => {
  const [passcode, setPasscode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => inputsRef.current[0]?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    const next = [...passcode];
    next[index] = value;
    setPasscode(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
    if (next.join("") === "212388") {
      sessionStorage.setItem("isAuthenticated", "true");
      onAuthenticated();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !passcode[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#070b12]/95 backdrop-blur-md">
      <div className="bg-[#0f1520] border border-slate-700/60 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Enter Passcode</h2>
        <p className="text-slate-400 text-sm mb-6">6-digit code to access the command center.</p>
        <div className="flex justify-center gap-2">
          {passcode.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputsRef.current[idx] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 border-2 border-slate-600 rounded-lg text-center text-xl font-bold text-white bg-transparent focus:border-lime-500 focus:outline-none transition-colors"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Dollar Particle Canvas ── */
const DollarCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    let animId: number;

    class P {
      x: number; y: number; s: number; a: number; vx: number; vy: number; angle: number; rs: number; c: string;
      constructor() {
        this.x = Math.random() * w; this.y = Math.random() * h;
        this.s = Math.random() * 14 + 8; this.a = Math.random() * 0.18 + 0.05;
        this.vx = (Math.random() - 0.5) * 0.15; this.vy = (Math.random() - 0.5) * 0.15;
        this.angle = Math.random() * Math.PI * 2; this.rs = (Math.random() - 0.5) * 0.015;
        const cs = ["#b5f542", "#84cc16", "#65a30d", "#4d7c0f"];
        this.c = cs[Math.floor(Math.random() * cs.length)];
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.angle += this.rs;
        if (this.x < 0) this.x = w; if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h; if (this.y > h) this.y = 0;
      }
      draw() {
        ctx!.save(); ctx!.globalAlpha = this.a; ctx!.fillStyle = this.c;
        ctx!.font = `${this.s}px "Source Sans 3", sans-serif`;
        ctx!.translate(this.x, this.y); ctx!.rotate(this.angle);
        ctx!.fillText("$", -this.s / 3, this.s / 3); ctx!.restore();
      }
    }

    let particles: P[] = [];
    const init = () => { particles = []; for (let i = 0; i < Math.floor((w * h) / 18000); i++) particles.push(new P()); };
    const loop = () => {
      ctx!.clearRect(0, 0, w, h);
      particles.forEach((p) => { p.update(); p.draw(); });
      animId = requestAnimationFrame(loop);
    };
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; init(); };
    window.addEventListener("resize", resize);
    init(); loop();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" />;
};

/* ══════════════════════════════════════════════════════════
   CommandCenterLayout — three-column Concept-A shell
   ══════════════════════════════════════════════════════════ */
const CommandCenterLayout: React.FC<CommandCenterLayoutProps> = ({ children }) => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("isAuthenticated") === "true");
  const location = useLocation();
  const { lastUpdatedBySlug } = useProjectLastUpdated(PROJECTS);
  const activity = buildActivityFeed(PROJECTS, lastUpdatedBySlug);

  const counts = { green: 0, yellow: 0, red: 0 };
  PROJECTS.forEach((p) => counts[p.status]++);

  if (!authed) return (
    <>
      <DollarCanvas />
      <PasscodeGate onAuthenticated={() => setAuthed(true)} />
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-200 font-sans flex">
      <DollarCanvas />

      {/* ── LEFT SIDEBAR ── */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#0f1520]/90 backdrop-blur-md border-r border-slate-700/40 flex flex-col z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-700/40">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-white">
            dvo88<span className="text-lime-500">.com</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-lime-500/10 text-lime-400"
                    : "text-slate-400 hover:bg-slate-700/40 hover:text-slate-200"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Recent Activity Feed */}
        <div className="flex-1 overflow-hidden flex flex-col mt-2">
          <h3 className="px-5 text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Recent Activity
          </h3>
          <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
            {activity.map((item, i) => (
              <div
                key={i}
                className="px-2 py-2.5 rounded-lg hover:bg-slate-700/30 transition-colors group cursor-default"
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${activityDotClass[item.status] || "bg-slate-500"}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">{item.summary}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {item.project} · {relativeDate(item.date)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#0f1520]/80 backdrop-blur-md border-b border-slate-700/40 flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">{counts.green} Healthy</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">{counts.yellow} Warning</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-slate-300">{counts.red} Critical</span>
            </div>
          </div>
          <span className="text-xs text-slate-500">{PROJECTS.length} projects tracked</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default CommandCenterLayout;
