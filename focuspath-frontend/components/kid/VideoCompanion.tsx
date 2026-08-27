'use client';

import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/api';
import { Sparkles, Send, Bot, User, Loader2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

export default function VideoCompanion({ videoId }: { videoId: string }) {
  const [breakdown, setBreakdown] = useState<string>('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Fetch breakdown on load
  useEffect(() => {
    let active = true;
    const fetchBreakdown = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiRequest<{reply: string}>('/api/learn/video-chat/', {
          method: 'POST',
          body: JSON.stringify({ video_id: videoId, is_breakdown: true })
        });
        if (active && res && res.reply) {
          setBreakdown(res.reply);
          setChat([{ role: 'bot', text: "Hi! I'm your AI Study Buddy. Ask me anything about this video!" }]);
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Could not load AI companion.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchBreakdown();
    return () => { active = false; };
  }, [videoId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await apiRequest<{reply: string}>('/api/learn/video-chat/', {
        method: 'POST',
        body: JSON.stringify({ video_id: videoId, message: userMsg, history: chat })
      });
      if (res && res.reply) {
        setChat(prev => [...prev, { role: 'bot', text: res.reply }]);
      }
    } catch (err: any) {
      setChat(prev => [...prev, { role: 'bot', text: "Oops, my brain disconnected. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Breakdown Section — Authentic Paper Notebook Surface with Spiral Edge */}
      <div className="relative rounded-[32px] border-2 border-amber-200 dark:border-slate-800 bg-[#fffdfa] dark:bg-[#131b2a] p-6 sm:p-8 shadow-md space-y-4 overflow-hidden">
        {/* Left Spiral Rings Decoration */}
        <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around py-4 pointer-events-none opacity-40">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-600 border border-slate-500" />
          ))}
        </div>

        <div className="pl-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <BookOpen className="h-5 w-5" />
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">AI Companion Notes 📓</h2>
          </div>
          
          {loading && !breakdown && (
            <div className="flex items-center gap-2 text-slate-400 mt-4">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              <span className="text-sm font-bold">Analyzing transcript...</span>
            </div>
          )}

          {error && <p className="text-sm font-bold text-rose-500 mt-2">{error}</p>}

          {breakdown && (
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-3">
              <ReactMarkdown>{breakdown}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section — Color Coded Bubbles (Kid = Orange Right, AI = Sky Left with Mascot) */}
      <div className="rounded-[32px] border-2 border-sky-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex flex-col h-[500px] shadow-md overflow-hidden">
        <div className="p-5 border-b border-sky-100 dark:border-slate-800 bg-gradient-to-r from-sky-100/60 to-indigo-50/40 dark:from-slate-800 dark:to-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-400 text-white flex items-center justify-center animate-kid-bob">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Ask Study Buddy 🦉</h2>
          </div>
          <span className="text-[10px] font-extrabold bg-sky-200 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-3 py-1 rounded-full border border-sky-300 dark:border-sky-800">
            Interactive AI
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chat.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                msg.role === 'user' ? 'bg-orange-500 text-white font-extrabold' : 'bg-sky-400 text-white'
              }`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <span className="text-lg animate-kid-bob">🦉</span>}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-xs font-bold leading-relaxed shadow-xs ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-xs' 
                  : 'bg-sky-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-sky-200 dark:border-slate-700 rounded-tl-xs'
              }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && chat.length > 0 && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-sky-400 text-white flex items-center justify-center shrink-0">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-sky-50 dark:bg-slate-800 text-slate-500 rounded-tl-xs text-xs font-bold">
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-sky-100 dark:border-slate-800 bg-sky-50/40 dark:bg-slate-900/60">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask Buddy a question about this video..."
              className="w-full pl-4 pr-12 py-3 rounded-full border-2 border-sky-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 shadow-xs transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="absolute right-2 w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
