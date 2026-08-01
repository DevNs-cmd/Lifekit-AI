import { Zap, Target, Heart, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-[hsl(var(--text-primary))]">About LifeKit</h1>
          <p className="mt-4 text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto">
            We believe every person deserves an intelligent system that turns their goals into reality — not just a to-do list.
          </p>
        </div>

        <div className="prose max-w-none space-y-8 text-[hsl(var(--text-secondary))]">
          <div className="rounded-2xl bg-[hsl(var(--background-subtle))] border border-[hsl(var(--border))] p-8">
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6 text-[hsl(var(--primary))]" /> Our Mission
            </h2>
            <p className="text-base leading-relaxed">
              LifeKit exists to close the gap between human intention and real-world outcome. Most people know what they want but struggle to execute. We built an AI-powered execution platform that understands your goals, creates structured plans, finds the right resources, and keeps you accountable — from the first idea to the final result.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Goal-first design", desc: "Every feature exists to help you achieve measurable outcomes, not just stay busy." },
              { icon: Heart, title: "Human-centred AI", desc: "Our AI assists your judgment — it never replaces your autonomy or decision-making." },
              { icon: Globe, title: "Built for India & beyond", desc: "Designed with the ambitions of the next billion goal-setters in mind." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-[hsl(var(--border))] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-[hsl(var(--text-primary))] mb-2">{title}</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
