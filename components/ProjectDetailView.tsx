import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProjectBySlug, ProjectStatus } from "../src/config/projects";
import ProjectChatDrawer from "./ProjectChatDrawer";

const statusColorClass: Record<ProjectStatus, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-400",
  red: "bg-red-500",
};

const formatPhase = (phase: string) => phase.charAt(0).toUpperCase() + phase.slice(1);

const parseDateValue = (dateValue: string) => {
  const [yearStr, monthStr, dayStr] = dateValue.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
    return new Date(year, month - 1, day);
  }
  return new Date(dateValue);
};

const formatDate = (dateValue: string, withYear = true) => {
  const parsed = parseDateValue(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }
  return parsed.toLocaleDateString("en-US", withYear ? { month: "short", day: "numeric", year: "numeric" } : { month: "short", day: "numeric" });
};

const ProjectDetailView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProjectBySlug(slug) : undefined;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check authentication
    const auth = sessionStorage.getItem("isAuthenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Passcode Logic
  const handlePasscodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);

    const newPasscode = [...passcode];
    newPasscode[index] = value;
    setPasscode(newPasscode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newPasscode.join("") === "212388") {
      sessionStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !passcode[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Canvas Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles: any[] = [];
    let mouse = { x: -1000, y: -1000 };

    class Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      alpha: number;
      vx: number;
      vy: number;
      angle: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 20 + 10;
        const colors = ["#004d36", "#5e871c", "#059669", "#065f46", "#064e3b"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.4 + 0.1;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotationSpeed;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        if (distance < maxDist) {
          const force = (maxDist - distance) / maxDist;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 5 * 0.3;
          this.vy += Math.sin(angle) * force * 5 * 0.3;
          this.rotationSpeed += (Math.random() - 0.5) * 0.1;
        }

        if (Math.abs(this.vx) > 0.5) this.vx *= 0.98;
        if (Math.abs(this.vy) > 0.5) this.vy *= 0.98;
        if (Math.abs(this.rotationSpeed) > 0.02) this.rotationSpeed *= 0.99;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = this.size + 'px "Source Sans 3", sans-serif';
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillText("$", -this.size / 3, this.size / 3);
        ctx.restore();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((width * height) / 10000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    initParticles();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-300 font-sans text-slate-900 dark:text-white">
      {/* Passcode Overlay */}
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center transition-opacity duration-500">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Enter Passcode</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Enter the 6-digit code to access the dashboard.
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              <Link
                to="/leo-ai"
                className="font-semibold underline decoration-slate-300 hover:decoration-emerald-600 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors"
              >
                Go to Leo AI (separate login)
              </Link>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {passcode.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePasscodeChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 border-2 border-slate-200 dark:border-slate-600 rounded-lg text-center text-xl font-bold text-slate-900 dark:text-white bg-transparent focus:border-emerald-600 dark:focus:border-lime-500 focus:outline-none transition-colors"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div id="canvas-container" className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <canvas ref={canvasRef} id="floatCanvas"></canvas>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            dvo88<span className="text-lime-600">.com</span>
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/ai-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors"
            >
              AI & dev tools
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors"
            >
              Client Onboarding
            </a>
            <a
              href="/calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors"
            >
              Capacity Calculator
            </a>
            <a
              href="https://672elmstreet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors"
            >
              672elmstreet.com
            </a>
            <a
              href="https://riabuilder.dvo88.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors"
            >
              RIA Builder
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md hidden md:inline-block"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-28 pb-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-semibold text-emerald-700 dark:text-lime-500 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            {project?.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-semibold text-emerald-700 dark:text-lime-500 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors"
              >
                Visit Site ↗
              </a>
            )}
          </div>

          {!project ? (
            <div className="text-center bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-10">
              <h1 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white mb-3">Project not found</h1>
              <Link
                to="/"
                className="inline-flex items-center text-sm font-semibold text-emerald-700 dark:text-lime-500 hover:text-emerald-600 dark:hover:text-lime-400 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="bg-white/90 dark:bg-slate-800/90 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-4 h-4 rounded-full ${statusColorClass[project.status]}`}></span>
                  <h1 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{project.name}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Phase: {formatPhase(project.phase)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Security: {formatPhase(project.securityStatus)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Last updated: {formatDate(project.lastUpdated)}
                  </span>
                </div>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors break-all"
                  >
                    {project.url}
                  </a>
                )}
              </section>

              <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
                <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">Description</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{project.description}</p>
              </section>

              <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
                <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={`${project.slug}-${tech}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
                  <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">Recent Changes</h2>
                  {project.recentChanges.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">No recent changes recorded.</p>
                  ) : (
                    <ul className="space-y-4">
                      {project.recentChanges.map((change, idx) => (
                        <li key={`${project.slug}-change-${idx}`}>
                          <p className="font-semibold text-xs text-slate-400 mb-1">{formatDate(change.date)}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{change.summary}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
                  <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">What's Next</h2>
                  {project.nextSteps.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">No next steps defined.</p>
                  ) : (
                    <ol className="space-y-3">
                      {project.nextSteps.map((step, idx) => (
                        <li key={`${project.slug}-next-${idx}`} className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>

              <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
                <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">Roadmap</h2>
                {project.roadmap.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">No roadmap items defined.</p>
                ) : (
                  <ul className="space-y-3">
                    {project.roadmap.map((item, idx) => (
                      <li key={`${project.slug}-roadmap-${idx}`} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full ${statusColorClass[item.status]}`}></span>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{item.milestone}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{item.target}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6">
                <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-4">Known Issues</h2>
                {project.knownIssues.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">No known issues - looking good!</p>
                ) : (
                  <ul className="space-y-2">
                    {project.knownIssues.map((issue, idx) => (
                      <li key={`${project.slug}-issue-${idx}`} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="text-amber-500">⚠</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <ProjectChatDrawer />
    </div>
  );
};

export default ProjectDetailView;
