'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { setCookie } from '@/lib/api'; // Assuming setCookie is exported or we can just use document.cookie

// Helper to set cookie if not in lib/api
const setCookieValue = (name: string, value: string, days = 7) => {
  if (typeof window !== 'undefined') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  }
};

export default function SelectProfilePage() {
  const router = useRouter();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChildSelect = () => {
    setCookieValue('activeRole', 'child');
    router.push('/kid/dashboard');
  };

  const handleParentSelect = () => {
    setShowPinModal(true);
    setTimeout(() => inputRefs[0].current?.focus(), 100);
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    // Move to next input automatically
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  useEffect(() => {
    const fullPin = pin.join('');
    if (fullPin.length === 4) {
      verifyPin(fullPin);
    }
  }, [pin]);

  const verifyPin = async (fullPin: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/api/auth/verify-pin/', {
        method: 'POST',
        body: JSON.stringify({ pin: fullPin }),
      });
      
      if (res.success) {
        setCookieValue('activeRole', 'parent');
        setShowPinModal(false);
        router.push('/parent/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect PIN.');
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Who's learning today?</h1>
        <p className="text-slate-500 font-medium">Select your profile to continue</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
        {/* Child Profile */}
        <button
          onClick={handleChildSelect}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
            <User className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">Child / Student</h2>
            <p className="text-sm text-slate-500 mt-1">Access your learning journey</p>
          </div>
        </button>

        {/* Parent Profile */}
        <button
          onClick={handleParentSelect}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-10 w-10 text-indigo-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">Parent</h2>
            <p className="text-sm text-slate-500 mt-1">Manage settings and restrictions</p>
          </div>
        </button>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setShowPinModal(false);
                setPin(['', '', '', '']);
                setError(null);
              }}
              className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center mt-6 mb-8">
              <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Enter Parent PIN</h2>
              <p className="text-xs font-medium text-slate-500 mt-2">
                If no PIN is set, the one you enter will be saved as your PIN.
              </p>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={inputRefs[i]}
                  type="password"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-extrabold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-sm font-semibold text-rose-500 mb-4 animate-in shake">{error}</p>
            )}

            {loading && (
              <div className="flex justify-center text-indigo-500">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
