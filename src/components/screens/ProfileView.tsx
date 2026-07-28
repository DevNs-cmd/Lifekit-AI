import React, { useState } from 'react';
import { User, Zap, Shield, Sparkles, Check, RefreshCw, LogOut, KeyRound } from 'lucide-react';

interface ProfileViewProps {
  onOpenAuth?: (mode?: 'login' | 'signup' | 'forgot-password') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenAuth }) => {
  const [selectedTier, setSelectedTier] = useState<'Free Tier' | 'LifeKit Plus' | 'LifeKit Pro'>('LifeKit Pro');
  const [aiMemory, setAiMemory] = useState(true);
  const [dailyNudges, setDailyNudges] = useState(true);
  const [autoDecompose, setAutoDecompose] = useState(true);

  const tiers = [
    { name: 'Free Tier', price: '₹0/mo', badge: 'Basic', desc: 'Single goal tracking' },
    { name: 'LifeKit Plus', price: '₹499/mo', badge: 'Plus', desc: 'Unlimited goals & AI Coach' },
    { name: 'LifeKit Pro', price: '₹999/mo', badge: 'Pro', desc: 'Marketplace access & priority AI' },
  ];

  return (
    <div className="p-4 space-y-5 pb-20 text-slate-900 select-none">
      {/* Profile Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-violet-100 border-2 border-[#7C3AED] flex items-center justify-center font-black text-lg text-[#7C3AED]">
              AK
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-base text-slate-900">Aditya Kumar</h2>
            <p className="text-xs text-slate-500">aditya.k@lifekit.ai</p>
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#4C0FBD] to-[#7C3AED] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
              <Zap className="w-3 h-3 fill-white" />
              {selectedTier}
            </span>
          </div>
        </div>

        {onOpenAuth && (
          <button
            onClick={() => onOpenAuth('login')}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold flex flex-col items-center gap-1 transition-all"
            title="Switch Account or View Auth Screens"
          >
            <LogOut className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-[10px]">Auth</span>
          </button>
        )}
      </div>

      {/* Quick Auth Shortcuts */}
      {onOpenAuth && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-around text-xs shadow-sm">
          <button
            onClick={() => onOpenAuth('login')}
            className="text-[#7C3AED] hover:underline font-bold flex items-center gap-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Sign In View
          </button>
          <span className="text-slate-200">|</span>
          <button
            onClick={() => onOpenAuth('signup')}
            className="text-[#7C3AED] hover:underline font-bold flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5" />
            Sign Up View
          </button>
          <span className="text-slate-200">|</span>
          <button
            onClick={() => onOpenAuth('forgot-password')}
            className="text-[#7C3AED] hover:underline font-bold flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5" />
            Forgot Password
          </button>
        </div>
      )}

      {/* Subscription Plan Badges */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Subscription Plan Tier</h3>
        <div className="grid grid-cols-3 gap-2">
          {tiers.map((tier) => {
            const isSelected = selectedTier === tier.name;
            return (
              <button
                key={tier.name}
                onClick={() => setSelectedTier(tier.name as any)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-violet-50 border-[#7C3AED] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-violet-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#7C3AED]">{tier.badge}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#7C3AED]" />}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 leading-tight">{tier.name}</div>
                  <div className="text-[11px] font-extrabold text-slate-500 mt-1">{tier.price}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Memory & Preferences */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">AI Execution Memory Settings</h3>
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Goal Context Retention</p>
              <p className="text-[11px] text-slate-500">Retain historical task completion patterns for AI advice.</p>
            </div>
            <input
              type="checkbox"
              checked={aiMemory}
              onChange={(e) => setAiMemory(e.target.checked)}
              className="accent-[#7C3AED] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Smart Morning Nudges</p>
              <p className="text-[11px] text-slate-500">Receive high impact action focus alerts daily.</p>
            </div>
            <input
              type="checkbox"
              checked={dailyNudges}
              onChange={(e) => setDailyNudges(e.target.checked)}
              className="accent-[#7C3AED] w-4 h-4 rounded cursor-pointer"
            />
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Auto Goal Decomposition</p>
              <p className="text-[11px] text-slate-500">Deconstruct goals into tactical sub-tasks automatically.</p>
            </div>
            <input
              type="checkbox"
              checked={autoDecompose}
              onChange={(e) => setAutoDecompose(e.target.checked)}
              className="accent-[#7C3AED] w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Sync Button */}
      <button
        onClick={() => alert('LifeKit AI State successfully synchronized with Cloud Storage!')}
        className="w-full bg-white hover:bg-slate-50 text-[#7C3AED] font-bold text-xs py-3 px-4 rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <RefreshCw className="w-4 h-4 text-[#7C3AED]" />
        Sync LifeKit AI Cloud State
      </button>
    </div>
  );
};
