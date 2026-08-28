'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { askPlannerAssistant } from '@/lib/plannerApi';
import { useSWRConfig } from 'swr';
import { Bot, X, Send, GraduationCap, BookOpen, CalendarDays, UploadCloud } from 'lucide-react';

type Tab = 'general' | 'syllabus' | 'planner';
interface Msg { role: 'bot' | 'user'; text: string; }

// Backend now handles all LLM replies, no local generalReply needed.

const GREETINGS: Record<Tab, string> = {
  general: "Hello! I'm your General Academic Assistant. How can I help you today?",
  syllabus: "I'm your Syllabus Assistant. Upload a syllabus and I'll help you break it into a study plan.",
  planner: "I'm your Timetable Planner. I have access to your tasks, sessions, and progress. Ask me 'What should I study next?' or 'How much workload is left?'",
};

export function AiAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('general');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [threads, setThreads] = useState<Record<Tab, Msg[]>>({
    general: [{ role: 'bot', text: GREETINGS.general }],
    syllabus: [{ role: 'bot', text: GREETINGS.syllabus }],
    planner: [{ role: 'bot', text: GREETINGS.planner }],
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = threads[tab];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, tab]);

  const push = (t: Tab, msg: Msg) => setThreads((prev) => ({ ...prev, [t]: [...prev[t], msg] }));

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || sending) return;
    const current = tab;
    push(current, { role: 'user', text: q });
    setInput('');
    setSending(true);
    try {
      // Send chat history (excluding the new user msg)
      const data = await askPlannerAssistant(q, current, messages);
      
      if (data.error) {
        push(current, { role: 'bot', text: data.reply });
        return;
      }
      
      push(current, { role: 'bot', text: data.reply });
      
      if (data.action === 'REFRESH_PLANNER') {
        const { mutate } = require('swr');
        mutate('/api/planner/sessions/');
        window.dispatchEvent(new Event('refresh_planner'));
      }
    } catch (error: any) {
      console.error("Chat API Error Details:", error);
      push(current, { role: 'bot', text: 'Network error: Could not reach the planner assistant.' });
    } finally {
      setSending(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'general', label: 'General', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { key: 'syllabus', label: 'Syllabus', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'planner', label: 'Planner', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  ];

  const quickPrompts: Record<Tab, string[]> = {
    general: ['How do I remember more?', 'Tips to beat procrastination'],
    syllabus: ['What subjects are in my syllabus?', 'What topics should I cover?'],
    planner: ['What should I study next?', "How much workload is left?", "What's my progress?"],
  };

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="FocusPath AI Assistant"
          className="fixed bottom-8 right-8 w-14 h-14 bg-indigo text-white rounded-full shadow-2xl hover:bg-indigo-dark hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-50 cursor-pointer"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-border dark:border-slate-800 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-indigo text-white">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Bot className="w-5 h-5" /> FocusPath AI Assistant
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 border-b border-border dark:border-slate-800">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                  tab === t.key
                    ? 'text-indigo dark:text-indigo-400 bg-indigo-light/40 dark:bg-indigo-950/30 border-b-2 border-indigo'
                    : 'text-textSecondary dark:text-slate-400 hover:text-textPrimary dark:hover:text-slate-200'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Syllabus quick upload action */}
          {tab === 'syllabus' && (
            <button
              onClick={() => { 
                setOpen(false); 
                const onboardingRoute = window.location.pathname.startsWith('/parent') ? '/parent/onboarding' : '/adult/onboarding';
                router.push(onboardingRoute); 
              }}
              className="mx-3 mt-3 flex items-center justify-center gap-2 py-2 rounded-xl border border-indigo/30 text-indigo dark:text-indigo-400 text-xs font-bold hover:bg-indigo-light/40 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" /> Upload Syllabus
            </button>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-textPrimary dark:text-slate-100 rounded-bl-sm'
                  }`}
                >
                  {msg.role === 'bot' ? (
                    <div className="space-y-2 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>h3]:font-bold [&>h3]:mt-3 [&>h3]:text-sm">
                      <ReactMarkdown>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-textSecondary text-xs">…</div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {quickPrompts[tab].map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-border dark:border-slate-700 text-textSecondary dark:text-slate-300 hover:border-indigo/50 hover:text-indigo dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 px-3 py-3 border-t border-border dark:border-slate-800"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tab === 'planner' ? 'Ask what to study…' : tab === 'syllabus' ? 'Ask about syllabus…' : 'Ask a question…'}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-9 h-9 shrink-0 bg-indigo text-white rounded-xl flex items-center justify-center hover:bg-indigo-dark disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
