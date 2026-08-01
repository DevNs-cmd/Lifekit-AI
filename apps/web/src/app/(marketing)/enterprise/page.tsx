import Link from "next/link";
import { Shield, Users, BarChart3, Puzzle, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

const ENTERPRISE_FEATURES = [
  { icon: Users,    title: "Team Workspaces",        desc: "Shared mission planning and execution for organisations and teams." },
  { icon: Shield,   title: "SSO & Compliance",        desc: "SAML SSO, GDPR compliance, data residency and enterprise security controls." },
  { icon: Puzzle,   title: "Custom Integrations",     desc: "Connect LifeKit with your existing tools — Slack, Jira, Notion, HR systems." },
  { icon: BarChart3,title: "Advanced Analytics",      desc: "Organisation-wide goal tracking, completion rates and performance insights." },
];

export default function EnterprisePage() {
  return (
    <div className="py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-[hsl(var(--text-primary))]">LifeKit for Enterprise</h1>
          <p className="mt-4 text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto">
            Give every employee a personalised AI execution system. Drive productivity, learning and retention at scale.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild rightIcon={<ArrowRight className="h-4 w-4" />}><Link href={ROUTES.CONTACT}>Talk to sales</Link></Button>
            <Button size="lg" variant="outline" asChild><Link href={ROUTES.SIGN_UP}>Start free trial</Link></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {ENTERPRISE_FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title}><CardContent className="p-5 flex gap-4">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Icon className="h-5 w-5" /></div>
              <div><h3 className="font-semibold text-[hsl(var(--text-primary))] mb-1">{title}</h3><p className="text-sm text-[hsl(var(--text-secondary))]">{desc}</p></div>
            </CardContent></Card>
          ))}
        </div>

        <Card className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--background-subtle))]">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-3">Ready to transform your workforce?</h2>
            <p className="text-[hsl(var(--text-secondary))] mb-6 max-w-md mx-auto">Schedule a demo to see how LifeKit can help your organisation achieve goals at scale.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {["Custom pricing", "Dedicated onboarding", "SLA guarantee", "24/7 support"].map(f => (
                <span key={f} className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-secondary))]"><CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />{f}</span>
              ))}
            </div>
            <Button className="mt-6" size="lg" asChild><Link href={ROUTES.CONTACT}>Request a demo</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
