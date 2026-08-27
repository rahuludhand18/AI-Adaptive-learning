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
      {/* Breakdown Section */}
      <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">AI Breakdown</h2>
        </div>
        
        {loading && !breakdown && (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">NotebookLM is analyzing the transcript...</span>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {breakdown && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            <ReactMarkdown>{breakdown}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[500px] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-primary/5 to-transparent flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Ask a Question</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {chat.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-primary text-white'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
              }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && chat.length > 0 && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-tl-sm">
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f17]">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="E.g. What does this mean? Can you simplify it?"
              className="w-full pl-4 pr-12 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="absolute right-2 w-8 h-8 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
