import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check authentication
    const auth = sessionStorage.getItem('isAuthenticated');
    if (auth === 'true') {
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

    if (newPasscode.join('') === '212388') {
        sessionStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !passcode[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Canvas Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
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
            const colors = ['#004d36', '#5e871c', '#059669', '#065f46', '#064e3b'];
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
            ctx.font = this.size + "px \"Source Sans 3\", sans-serif";
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillText('$', -this.size/3, this.size/3);
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
        particles.forEach(p => {
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

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    initParticles();
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-300 font-sans text-slate-900 dark:text-white">
      {/* Passcode Overlay */}
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center transition-opacity duration-500">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Enter Passcode</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Enter the 6-digit code to access the dashboard.</p>
                
                <div className="flex justify-center gap-2 mb-4">
                    {passcode.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={el => inputsRef.current[idx] = el}
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
                  <a href="/ai-tools" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors">AI & dev tools</a>
                  <a href="#" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors">Client Onboarding</a>
                  {/* CHANGED LINK HERE */}
                  <a href="#/calculator" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors">Capacity Calculator</a>
                  <a href="https://672elmstreet.com" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors">672elmstreet.com</a> <a href="https://riabuilder.dvo88.com" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors">RIA Builder</a>
              </nav>

              <div className="flex items-center gap-4">
                  <a href="#" className="bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md hidden md:inline-block">
                      Get Started
                  </a>
              </div>
          </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center pt-20 px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                  Experience the <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-lime-500">Command Center</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                  A physics-defying approach to wealth management technology. 
                  Powerful, intuitive, and designed for <strong className="text-slate-800 dark:text-slate-200 font-semibold">modern advisors</strong>.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="#/calculator" target="_blank" rel="noopener noreferrer" className="bg-emerald-700 text-white px-8 py-4 rounded-full font-bold text-lg w-full sm:w-auto shadow-lg hover:translate-y-[-2px] transition-transform text-center">
                      Launch Platform
                  </a>
                  <a href="#" className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto border border-transparent dark:border-slate-700">
                      Watch Demo
                  </a>
              </div>
          </div>
      </main>
    </div>
  );
};

export default LandingPage;
