"use client";

import { BarChart3, TrendingUp, Target, CheckSquare, Zap, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/shared/metric-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryBadge } from "@/components/shared/category-badge";
import { MOCK_ANALYTICS } from "@/constants/mock-data";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const DONUT_COLORS = ["#6b21a8", "#7c3aed", "#a78bfa", "#e9d5ff", "#f3e8ff"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-lg text-xs">
      {label && <p className="font-semibold text-[hsl(var(--text-primary))] mb-1">{label}</p>}
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const a = MOCK_ANALYTICS;

  const taskStatusData = [
    { name: "Completed", value: a.taskStatusDistribution.completed },
    { name: "In Progress", value: a.taskStatusDistribution.inProgress },
    { name: "Not Started", value: a.taskStatusDistribution.notStarted },
    { name: "Blocked", value: a.taskStatusDistribution.blocked },
    { name: "Skipped", value: a.taskStatusDistribution.skipped },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-[hsl(var(--primary))]" /> Analytics
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Track your progress, identify patterns, and stay on course.
        </p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Mission Completion" value={`${a.missionCompletionRate}%`} icon={<Target className="h-5 w-5" />} accent />
        <MetricCard title="Task Completion" value={`${a.taskCompletionRate}%`} icon={<CheckSquare className="h-5 w-5" />} trend={{ value: 8, label: "vs last week" }} />
        <MetricCard title="Current Streak" value={`${a.currentStreak} days`} icon={<Zap className="h-5 w-5" />} description={`Best: ${a.longestStreak} days`} />
        <MetricCard title="Milestones Done" value={a.completedMilestones} icon={<Award className="h-5 w-5" />} description={`${a.totalTasksCompleted} tasks total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress over time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Planned vs Actual Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={a.progressOverTime} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fontSize: 11, fill: "hsl(var(--text-secondary))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--text-secondary))" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="planned" stroke="#a78bfa" strokeWidth={2} strokeDasharray="4 4" name="Planned" dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#6b21a8" strokeWidth={2} name="Actual" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly productivity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={a.weeklyProductivity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--text-secondary))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--text-secondary))" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tasksCompleted" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task status donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex items-center justify-center gap-6">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {taskStatusData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 shrink-0">
              {taskStatusData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: DONUT_COLORS[i] }} />
                  <span className="text-[hsl(var(--text-secondary))]">{d.name}</span>
                  <span className="font-semibold text-[hsl(var(--text-primary))] ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Progress by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {a.categoryProgress.map(cat => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <CategoryBadge category={cat.category} size="sm" />
                  <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{cat.completionRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                  <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all" style={{ width: `${cat.completionRate}%` }} />
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                  {cat.activeMissions} active · {cat.completedMissions} completed
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {a.recommendedFocusAreas.length > 0 && (
        <Card className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--background-subtle))]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
              <p className="text-sm font-semibold text-[hsl(var(--primary))]">Recommended Focus Areas</p>
            </div>
            <ul className="space-y-2">
              {a.recommendedFocusAreas.map((area, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
                  <span className="font-bold text-[hsl(var(--primary))] shrink-0">{i + 1}.</span>{area}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Empty state note */}
      <p className="text-xs text-center text-[hsl(var(--text-secondary))]">
        Analytics update as you complete tasks and milestones. The more you execute, the deeper the insights.
      </p>
    </div>
  );
}
