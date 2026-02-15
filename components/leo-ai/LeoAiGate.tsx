import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LEO_AI_CONFIG } from '../../src/config/leoAi';
import LeoAiHome from './LeoAiHome';

const LeoAiGate: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState<string[]>(
    () => Array.from({ length: LEO_AI_CONFIG.passcodeLength }, () => '')
  );
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const auth = sessionStorage.getItem(LEO_AI_CONFIG.sessionStorageKey);
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const passcodeValue = useMemo(() => passcode.join(''), [passcode]);

  const completeAuth = () => {
    sessionStorage.setItem(LEO_AI_CONFIG.sessionStorageKey, 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(LEO_AI_CONFIG.sessionStorageKey);
    setIsAuthenticated(false);
    setPasscode(Array.from({ length: LEO_AI_CONFIG.passcodeLength }, () => ''));
    inputsRef.current[0]?.focus();
  };

  const handlePasscodeChange = (index: number, value: string) => {
    const normalized = value.slice(0, 1);
    const next = [...passcode];
    next[index] = normalized;
    setPasscode(next);

    if (normalized && index < LEO_AI_CONFIG.passcodeLength - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (next.join('') === LEO_AI_CONFIG.passcode) {
      completeAuth();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !passcode[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  if (isAuthenticated) {
    return <LeoAiHome onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-slate-50 to-emerald-50/40 dark:from-slate-950 dark:to-emerald-950/20 text-slate-900 dark:text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-3xl font-extrabold tracking-tight">
            {LEO_AI_CONFIG.ui.appName}
            <span className="text-emerald-700 dark:text-lime-500">.</span>
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            <Link
              to="/"
              className="font-semibold hover:text-emerald-700 dark:hover:text-lime-500 transition-colors"
            >
              Back to dvo88
            </Link>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-950/40 backdrop-blur p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold mb-2">{LEO_AI_CONFIG.ui.loginTitle}</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
            {LEO_AI_CONFIG.ui.loginSubtitle}
          </p>

          <div className="flex justify-center gap-2 mb-4">
            {passcode.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputsRef.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePasscodeChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-center text-xl font-bold text-slate-900 dark:text-white bg-transparent focus:border-emerald-600 dark:focus:border-lime-500 focus:outline-none transition-colors"
              />
            ))}
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            {passcodeValue.length > 0 && passcodeValue.length < LEO_AI_CONFIG.passcodeLength && (
              <span>Enter all {LEO_AI_CONFIG.passcodeLength} digits.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeoAiGate;

