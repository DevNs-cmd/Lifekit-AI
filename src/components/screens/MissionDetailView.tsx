import React, { useState } from 'react';
import { ArrowLeft, Share2, Bot, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Mission, Task } from '../../types';

interface MissionDetailViewProps {
  mission: Mission;
  onBack: () => void;
  onToggleTask: (missionId: string, taskId: string) => void;
  onAddTask: (missionId: string, taskTitle: string) => void;
  onOpenAICoach: () => void;
}

export const MissionDetailView: React.FC<MissionDetailViewProps> = ({
  mission,
  onBack,
  onToggleTask,
  onAddTask,
  onOpenAICoach,
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskInput, setTaskInput] = useState('');

  const completedCount = mission.tasks.filter((t) => t.isCompleted).length;
  const progressPercent = mission.tasks.length > 0 ? Math.round((completedCount / mission.tasks.length) * 100) : 0;
  const remainingCount = mission.tasks.length - completedCount;

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    onAddTask(mission.id, taskInput.trim());
    setTaskInput('');
    setShowAddTask(false);
  };

  return (
    <div className="p-4 space-y-4 pb-24 text-slate-900 select-none relative min-h-full">
      {/* Top Navbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-800 transition-all flex items-center gap-1 text-xs font-semibold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#7C3AED]" />
          Back
        </button>
        <h2 className="font-bold text-sm text-slate-900 truncate max-w-[180px]">{mission.title}</h2>
        <button
          onClick={() => alert('Mission roadmap copied to clipboard!')}
          className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-slate-500 shadow-sm"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Mission Header Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-sm text-slate-900">
        <div className="flex items-center gap-2">
          <span className="bg-violet-100 text-[#7C3AED] text-xs font-bold px-2.5 py-0.5 rounded-lg border border-violet-200">
            {mission.category}
          </span>
          <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-lg flex items-center gap-1 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-400" />
            {mission.duration}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Overall Execution Progress</span>
            <span className="text-2xl font-black text-slate-900">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#4C0FBD] to-[#7C3AED] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500">
            <strong className="text-slate-900">{completedCount}</strong> of {mission.tasks.length} Milestones Achieved
          </span>
          {remainingCount > 0 ? (
            <span className="text-amber-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {remainingCount} Remaining
            </span>
          ) : (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Goal Achieved!
            </span>
          )}
        </div>
      </div>

      {/* Checklist Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <span>Execution Roadmap Checklist</span>
          <span className="text-[10px] bg-violet-100 text-[#7C3AED] px-2 py-0.5 rounded-full font-extrabold">
            Interactive
          </span>
        </h3>
        <button
          onClick={() => setShowAddTask(true)}
          className="text-xs font-bold text-[#7C3AED] hover:text-[#4C0FBD] flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Step
        </button>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {mission.tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onToggleTask(mission.id, task.id)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
              task.isCompleted
                ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                : 'bg-white border-slate-200 hover:border-[#7C3AED] text-slate-900 shadow-sm'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                task.isCompleted
                  ? 'bg-[#7C3AED] border-[#7C3AED] text-white'
                  : 'border-slate-300 hover:border-[#7C3AED]'
              }`}
            >
              {task.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-semibold leading-tight ${
                  task.isCompleted ? 'line-through text-slate-400 font-normal' : 'text-slate-900'
                }`}
              >
                {task.title}
              </p>
              {task.difficulty && (
                <span className="inline-block mt-1 text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                  {task.difficulty} Difficulty
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button for AI Coach Modal */}
      <button
        onClick={onOpenAICoach}
        className="fixed bottom-20 right-5 sm:absolute sm:bottom-20 sm:right-5 bg-gradient-to-r from-[#4C0FBD] to-[#7C3AED] text-white font-bold text-xs py-3 px-4 rounded-full shadow-lg shadow-indigo-300 flex items-center gap-2 border border-white/30 hover:scale-105 active:scale-95 transition-transform z-30"
      >
        <Bot className="w-4 h-4" />
        <span>AI Coach</span>
      </button>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xl">
            <h4 className="font-bold text-sm text-slate-900">Add Task Step</h4>
            <form onSubmit={handleAddTaskSubmit} className="space-y-3">
              <input
                type="text"
                autoFocus
                placeholder="e.g., Complete System Architecture Review"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7C3AED]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7C3AED] hover:bg-[#4C0FBD] text-white text-xs font-bold rounded-lg shadow"
                >
                  Add Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
