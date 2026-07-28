import React, { useState } from 'react';
import { Rocket, Sparkles, Plus, ArrowRight, Zap, Target, CheckCircle2 } from 'lucide-react';
import { Mission, TabType } from '../../types';

interface HomeScreenViewProps {
  missions: Mission[];
  onSelectMission: (missionId: string) => void;
  onNavigateTab: (tab: TabType) => void;
  onAddMission: (mission: Mission) => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  missions,
  onSelectMission,
  onNavigateTab,
  onAddMission,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Career' | 'Finance' | 'Health' | 'Business' | 'Education' | 'Travel'>('Business');
  const [newDuration, setNewDuration] = useState('3 months');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: Mission = {
      id: `m_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      duration: newDuration,
      iconName: 'rocket',
      tasks: [
        { id: `t_${Date.now()}_1`, title: 'Define key success metrics', isCompleted: false, difficulty: 'Medium' },
        { id: `t_${Date.now()}_2`, title: 'Execute initial action milestone', isCompleted: false, difficulty: 'High' },
      ],
    };

    onAddMission(created);
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="p-4 space-y-5 pb-20 text-slate-900 select-none">
      {/* Header Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Good Morning, Aditya</h1>
            <span className="text-lg">👋</span>
          </div>
          <p className="text-xs text-slate-500">LifeKit Goal Execution Command Center</p>
        </div>
        <button
          onClick={() => onNavigateTab('profile')}
          className="relative w-11 h-11 rounded-full bg-violet-100 border-2 border-[#7C3AED] flex items-center justify-center font-bold text-[#7C3AED] shadow-sm hover:scale-105 transition-transform"
        >
          AK
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
        </button>
      </div>

      {/* AI Suggestion Widget */}
      <div className="bg-gradient-to-br from-[#4C0FBD] to-[#7C3AED] p-4 rounded-2xl text-white shadow-lg shadow-indigo-200 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl text-white backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">AI Execution Intelligence</span>
          </div>
          <span className="bg-emerald-400/30 text-emerald-100 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-emerald-300/40">
            High Impact
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold text-violet-100 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-violet-200" />
            Action Recommendation for Today:
          </p>
          <p className="text-xs text-violet-100 mt-1 leading-relaxed">
            Complete <strong className="text-white">"Deploy Backend Server & API Routes"</strong> for Build Startup mission. Blocking a 45-min focus sprint today increases completion likelihood by 40%.
          </p>
        </div>

        <button
          onClick={() => onSelectMission('m1')}
          className="w-full bg-white hover:bg-slate-50 text-[#4C0FBD] text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 fill-[#4C0FBD]" />
          Start Focus Block (45m)
        </button>
      </div>

      {/* Active Missions Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Active Missions</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold text-[#7C3AED] hover:text-[#4C0FBD] flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Goal
          </button>
        </div>

        <div className="space-y-3">
          {missions.map((mission) => {
            const completedCount = mission.tasks.filter((t) => t.isCompleted).length;
            const progress = mission.tasks.length > 0 ? Math.round((completedCount / mission.tasks.length) * 100) : 0;

            return (
              <div
                key={mission.id}
                onClick={() => onSelectMission(mission.id)}
                className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-[#7C3AED] cursor-pointer transition-all space-y-3 group shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-[#7C3AED]">
                      <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#7C3AED] transition-colors">
                        {mission.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="bg-violet-100 text-[#7C3AED] text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {mission.category}
                        </span>
                        <span className="text-[11px] text-slate-500">{mission.duration}</span>
                      </div>
                    </div>
                  </div>

                  <span className="bg-slate-100 text-slate-800 font-extrabold text-xs px-2.5 py-1 rounded-xl border border-slate-200">
                    {progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#4C0FBD] to-[#7C3AED] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {completedCount} of {mission.tasks.length} tasks completed
                    </span>
                    <span className="text-[#7C3AED] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Execute <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Mission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">Launch New LifeKit Mission</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Save ₹5 Lakh or Master Flutter"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="Business">Business</option>
                    <option value="Career">Career</option>
                    <option value="Finance">Finance</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Duration</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  >
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 text-xs font-semibold py-2.5 rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#7C3AED] hover:bg-[#4C0FBD] text-white text-xs font-bold py-2.5 rounded-xl shadow-md"
                >
                  Launch Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
