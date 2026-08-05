import Link from "next/link";
import { ArrowLeft, Shield, Eye, Lock, Trash2, Download, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import type { Metadata } from "next";
import { LegalExplorer } from "@/components/marketing/premium-interactions";

export const metadata: Metadata = {
  title: "Privacy Policy | LifeKit",
  description:
    "Learn how LifeKit collects, uses, and protects your personal data. We are committed to transparency and your right to control your information.",
};

const SECTIONS = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    body: [
      {
        sub: "Account information",
        text: "When you create a LifeKit account, we collect your full name, email address, and optionally your phone number, location, and profile photo.",
      },
      {
        sub: "Goal and mission data",
        text: "We store the goals you describe, the Life Missions we generate, your milestones, tasks, progress updates, and activity history to power your personalised experience.",
      },
      {
        sub: "Life Memory",
        text: "With your permission, we save context about your preferences, decisions, constraints, and achievements to help your AI Coach give personalised responses. You can view, edit, or delete all memories at any time.",
      },
      {
        sub: "Usage data",
        text: "We collect anonymised analytics about how you use the platform — pages visited, features used, session duration — to improve the product. This data is never linked to your identity in any external system.",
      },
      {
        sub: "Payment information",
        text: "Payment details are processed directly by Razorpay or Stripe. LifeKit never stores your card number, UPI ID, or full payment credentials.",
      },
      {
        sub: "Communications",
        text: "If you contact our support team, we retain that correspondence to help resolve your issue.",
      },
    ],
  },
  {
    icon: Shield,
    title: "2. How We Use Your Information",
    body: [
      {
        sub: "Providing the service",
        text: "We use your data to create and maintain your account, generate personalised mission plans, deliver AI coaching, surface marketplace recommendations, and match opportunities to your goals.",
      },
      {
        sub: "AI personalisation",
        text: "Your goal data, preferences, and memory are used exclusively to personalise AI responses and recommendations within LifeKit. They are never used to train publicly available AI models.",
      },
      {
        sub: "Communications",
        text: "We send transactional emails (account verification, password reset, purchase receipts) and, with your permission, product updates and notification emails. You can manage email preferences from Settings.",
      },
      {
        sub: "Analytics and improvement",
        text: "Aggregated, anonymised usage data helps us understand which features are most valuable and where to invest in improvements.",
      },
      {
        sub: "Legal compliance",
        text: "We may use or disclose your data when required by applicable law, court order, or to protect the rights and safety of our users or the public.",
      },
    ],
  },
  {
    icon: Lock,
    title: "3. How We Protect Your Data",
    body: [
      {
        sub: "Encryption in transit",
        text: "All data between your browser and our servers is encrypted using TLS 1.3.",
      },
      {
        sub: "Encryption at rest",
        text: "Sensitive data is encrypted at rest in our databases using industry-standard AES-256 encryption.",
      },
      {
        sub: "Access controls",
        text: "Only authorised employees with a documented business need can access production data. Access is logged and reviewed regularly.",
      },
      {
        sub: "Secure tokens",
        text: "Authentication tokens are stored as HttpOnly cookies and never exposed to JavaScript. Session tokens are rotated on every login.",
      },
      {
        sub: "Third-party vetting",
        text: "We only use third-party services that meet equivalent or higher data security standards. A full sub-processor list is available on request.",
      },
    ],
  },
  {
    icon: Shield,
    title: "4. Data Sharing",
    body: [
      {
        sub: "We do not sell your data",
        text: "LifeKit has never sold and will never sell your personal data to advertisers, data brokers, or any third party.",
      },
      {
        sub: "Service providers",
        text: "We share data with trusted sub-processors (e.g. cloud infrastructure, payment processors, email delivery) strictly to operate the service. All sub-processors are bound by data processing agreements.",
      },
      {
        sub: "Marketplace providers",
        text: "When you purchase a service or contact a provider through the marketplace, limited information necessary to fulfil the transaction is shared with that provider.",
      },
      {
        sub: "Legal requirements",
        text: "We may disclose data to comply with a legal obligation, enforce our terms, or protect the safety of our users, only to the minimum extent required.",
      },
    ],
  },
  {
    icon: Eye,
    title: "5. Cookies and Tracking",
    body: [
      {
        sub: "Essential cookies",
        text: "We use HttpOnly session cookies for authentication. These are strictly necessary and cannot be disabled.",
      },
      {
        sub: "Analytics cookies",
        text: "With your consent, we use first-party analytics to understand usage patterns. We do not use Google Analytics or any third-party advertising cookies.",
      },
      {
        sub: "Managing cookies",
        text: "You can manage cookie preferences via your browser settings. Disabling non-essential cookies will not affect the core functionality of LifeKit.",
      },
    ],
  },
  {
    icon: Download,
    title: "6. Your Rights",
    body: [
      {
        sub: "Access",
        text: "You can view all data we hold about you, including your profile, missions, tasks, memories, and activity, directly in the app.",
      },
      {
        sub: "Correction",
        text: "You can update your personal information at any time from Profile or Settings.",
      },
      {
        sub: "Export",
        text: "You can download a full copy of your data (missions, tasks, memories, activity) from Settings > Privacy > Export my data.",
      },
      {
        sub: "Deletion",
        text: "You can delete individual memories from the Memory page, or delete your entire account and all associated data from Settings > Privacy > Delete Account. Deletion is permanent and irreversible.",
      },
      {
        sub: "Opt-out of AI memory",
        text: "You can disable AI memory at any time from Settings > Privacy or Settings > AI Preferences. When disabled, no new memories are saved and the AI Coach will not use past context.",
      },
      {
        sub: "Complaints",
        text: "If you believe your privacy rights have been violated, you have the right to lodge a complaint with the relevant data protection authority in your jurisdiction.",
      },
    ],
  },
  {
    icon: Bell,
    title: "7. Data Retention",
    body: [
      {
        sub: "Active accounts",
        text: "We retain your data for as long as your account is active and as necessary to provide the service.",
      },
      {
        sub: "Deleted accounts",
        text: "When you delete your account, your personal data, missions, tasks, and memories are permanently deleted within 30 days. Anonymised, aggregated analytics data may be retained indefinitely.",
      },
      {
        sub: "Billing records",
        text: "Invoice and transaction records are retained for 7 years as required by Indian financial regulations.",
      },
    ],
  },
  {
    icon: Shield,
    title: "8. Children's Privacy",
    body: [
      {
        sub: "Age requirement",
        text: "LifeKit is not directed at children under 13 years of age. We do not knowingly collect personal data from children under 13. If we discover that a child under 13 has provided us with personal data, we will delete it promptly.",
      },
    ],
  },
  {
    icon: Lock,
    title: "9. International Transfers",
    body: [
      {
        sub: "Data location",
        text: "Our primary infrastructure is located in India. Some of our sub-processors may process data in other countries. In all such cases, we ensure appropriate safeguards are in place, including standard contractual clauses.",
      },
    ],
  },
  {
    icon: Bell,
    title: "10. Changes to This Policy",
    body: [
      {
        sub: "Notification",
        text: "We may update this Privacy Policy from time to time. We will notify you of material changes via email or an in-app notification at least 14 days before the changes take effect.",
      },
      {
        sub: "Continued use",
        text: "Your continued use of LifeKit after changes become effective constitutes your acceptance of the updated policy.",
      },
    ],
  },
  {
    icon: Eye,
    title: "11. Contact Us",
    body: [
      {
        sub: "Privacy enquiries",
        text: "For any privacy-related questions, requests, or complaints, please contact our Data Protection team at privacy@lifekit.ai or write to us at AlgoForce AI, Bengaluru, Karnataka, India.",
      },
    ],
  },
];

const HIGHLIGHTS = [
  { icon: Shield, label: "We never sell your data" },
  { icon: Eye,    label: "Full transparency on what we collect" },
  { icon: Lock,   label: "Encrypted in transit and at rest" },
  { icon: Trash2, label: "Delete everything, any time" },
  { icon: Download, label: "Export your data on demand" },
  { icon: Bell,   label: "Opt out of AI memory any time" },
];

export default function PrivacyPage() {
  const explorerSections = SECTIONS.map((section) => ({
    title: section.title,
    searchText: section.body.map((item) => `${item.sub} ${item.text}`).join(" "),
    important: /Protect|Sharing|Rights|Retention/.test(section.title),
    content: (
      <div className="space-y-4">
        {section.body.map((item) => <div key={item.sub}><p className="font-bold text-[hsl(var(--text-primary))]">{item.sub}</p><p className="mt-1">{item.text}</p></div>)}
      </div>
    ),
  }));
  return (
    <div className="marketing-page-shell">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>

        <div className="marketing-story-hero mb-8">
        <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white"><Shield className="h-3.5 w-3.5" />Privacy by design</div>
        {/* Header */}
        <h1 className="text-3xl font-black text-[hsl(var(--text-primary))] mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-[hsl(var(--text-secondary))] mb-8">
          Last updated: July 2026 · Effective for all LifeKit accounts.
        </p>

        {/* Intro */}
        <p className="mb-8 max-w-5xl text-[hsl(var(--text-secondary))] leading-relaxed">
          At LifeKit, your privacy is not a legal formality — it is a core product principle. We built
          LifeKit on the belief that your personal goals, decisions, and progress data belong to you.
          This policy explains clearly what we collect, why, and how you can control it.
        </p>

        {/* Highlights grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <Card key={label} className="privacy-highlight-card min-h-[130px] border-white/25 bg-white/95 shadow-none backdrop-blur-sm">
              <CardContent className="flex h-full flex-col items-start gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold leading-snug">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>

        <LegalExplorer sections={explorerSections} />

        {/* Controls CTA */}
        <div className="mt-8 rounded-[28px] border border-[hsl(var(--primary))]/20 bg-[hsl(var(--background-subtle))] p-6 sm:p-8">
          <h3 className="font-bold text-[hsl(var(--text-primary))] mb-2">
            Manage your privacy settings
          </h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
            You can control your data, memory, and notification preferences directly from your account settings.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" asChild>
              <Link href="/settings/privacy">Privacy settings</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/memory">View my memories</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/terms">Terms of Service</Link>
            </Button>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-center text-[hsl(var(--text-secondary))]">
          Questions? Email us at{" "}
          <a href="mailto:privacy@lifekit.ai" className="text-[hsl(var(--primary))] hover:underline">
            privacy@lifekit.ai
          </a>
        </p>
      </div>
    </div>
  );
}
