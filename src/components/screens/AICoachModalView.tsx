import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Mission } from '../../types';

interface AICoachModalViewProps {
  mission: Mission;
  onClose: () => void;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
}

export const AICoachModalView: React.FC<AICoachModalViewProps> = ({ mission, onClose }) => {
  const completedCount = mission.tasks.filter((t) => t.isCompleted).length;
  const progressPercent = mission.tasks.length > 0 ? Math.round((completedCount / mission.tasks.length) * 100) : 0;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `👋 Hello! I am your LifeKit AI Coach for "${mission.title}". You are currently at ${progressPercent}% execution progress. How can I assist you with your roadmap or task execution strategy today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userPrompt = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userPrompt }]);
    setLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          missionTitle: mission.title,
          tasks: mission.tasks,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.response || 'Stay focused on your primary execution objective today!',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `🎯 Execution Advice for "${mission.title}": Break down your next uncompleted task into 15-minute micro-actions. Consistency builds momentum!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col justify-end">
      <div className="bg-white w-full max-w-lg mx-auto rounded-t-3xl border-t border-slate-200 h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4C0FBD] to-[#7C3AED] flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                AI Mission Execution Coach
                <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              </h3>
              <p className="text-xs text-[#7C3AED] font-semibold">Goal: {mission.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#7C3AED] text-white rounded-br-none font-medium shadow-sm'
                    : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200 shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
              AI Coach is analyzing mission state...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
          <button
            onClick={() => {
              setInput('How can I optimize my daily schedule for this goal?');
            }}
            className="bg-white hover:bg-violet-50 text-slate-600 hover:text-[#7C3AED] px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 font-semibold shadow-sm transition-all"
          >
            ⏰ Time Strategy
          </button>
          <button
            onClick={() => {
              setInput('What is the highest friction task I should do first?');
            }}
            className="bg-white hover:bg-violet-50 text-slate-600 hover:text-[#7C3AED] px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 font-semibold shadow-sm transition-all"
          >
            🎯 Priority Task
          </button>
          <button
            onClick={() => {
              setInput('How to stay consistent and overcome motivation drop?');
            }}
            className="bg-white hover:bg-violet-50 text-slate-600 hover:text-[#7C3AED] px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 font-semibold shadow-sm transition-all"
          >
            ⚡ Overcome Friction
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Coach for execution advice..."
            className="flex-1 bg-slate-50 text-slate-900 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED] placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-[#7C3AED] hover:bg-[#4C0FBD] disabled:opacity-50 text-white rounded-xl shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
