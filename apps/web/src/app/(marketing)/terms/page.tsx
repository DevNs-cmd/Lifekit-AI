import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LegalExplorer } from "@/components/marketing/premium-interactions";

export const metadata = { title: "Terms of Service | LifeKit" };

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By creating a LifeKit account or using any part of our service, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use LifeKit. We may update these terms from time to time; continued use after changes constitutes your acceptance.`,
  },
  {
    title: "2. Description of Service",
    body: `LifeKit is an AI-powered goal execution platform and marketplace. We help users transform personal and professional goals into structured Life Missions with AI-generated roadmaps, task management, resource discovery, and progress tracking. Features may vary by subscription plan.`,
  },
  {
    title: "3. User Accounts",
    body: `You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorised access. We reserve the right to terminate accounts that violate these terms.`,
  },
  {
    title: "4. Acceptable Use",
    body: `You agree not to use LifeKit to: (a) violate any applicable laws or regulations; (b) upload malicious code or interfere with the platform's operation; (c) impersonate any person or entity; (d) collect other users' data without consent; (e) use the AI features to generate harmful, illegal, or misleading content; (f) resell or sublicense LifeKit services without written permission.`,
  },
  {
    title: "5. AI-Generated Content",
    body: `LifeKit uses artificial intelligence to generate mission plans, recommendations, and coaching responses. AI-generated content is provided for informational and planning purposes only. It does not constitute professional advice (financial, medical, legal, or otherwise). You are solely responsible for decisions made based on AI outputs. We do not guarantee accuracy or suitability of AI-generated content for your specific circumstances.`,
  },
  {
    title: "6. Marketplace & Payments",
    body: `Marketplace transactions are between you and the service provider. LifeKit acts as a platform facilitating discovery and connection, not as a party to the transaction unless explicitly stated. All payments are processed securely via Razorpay or Stripe. Refund and cancellation policies are set by individual providers. Subscription fees are billed in advance and are non-refundable except as required by law.`,
  },
  {
    title: "7. Intellectual Property",
    body: `LifeKit and its content, features, and functionality are owned by AlgoForce AI and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of the goals, plans, and content you create on LifeKit. By using the service, you grant us a non-exclusive licence to use your content solely to provide and improve the service.`,
  },
  {
    title: "8. Privacy & Data",
    body: `Your use of LifeKit is also governed by our Privacy Policy. We collect and process data as described therein to provide personalised AI experiences, memory-based coaching, and platform analytics. You can delete your data at any time from Settings > Privacy. We do not sell your personal data to third parties.`,
  },
  {
    title: "9. Disclaimers & Limitation of Liability",
    body: `LifeKit is provided "as is" and "as available" without warranties of any kind. To the fullest extent permitted by law, AlgoForce AI is not liable for indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "10. Termination",
    body: `You may delete your account at any time from Settings > Privacy > Delete Account. We may suspend or terminate your access for violation of these terms, at our sole discretion, with or without notice. Upon termination, your right to use LifeKit ceases immediately. Sections on intellectual property, disclaimers, and limitation of liability survive termination.`,
  },
  {
    title: "11. Governing Law",
    body: `These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka, India. If any provision of these terms is found unenforceable, the remaining provisions remain in full effect.`,
  },
  {
    title: "12. Contact",
    body: `If you have questions about these Terms of Service, please contact us at legal@lifekit.ai or write to us at AlgoForce AI, Bengaluru, Karnataka, India.`,
  },
];

export default function TermsPage() {
  const explorerSections = SECTIONS.map((section) => ({
    title: section.title,
    searchText: section.body,
    important: /AI-Generated|Payments|Liability|Termination/.test(section.title),
    content: <p>{section.body}</p>,
  }));
  return (
    <div className="marketing-page-shell px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>

        <div className="marketing-story-hero mb-8">
          <span className="mb-4 inline-flex rounded-full border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--primary))]">Clear terms, plain navigation</span>
          <h1 className="text-4xl font-black text-[hsl(var(--text-primary))] sm:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-[hsl(var(--text-secondary))]">Last updated: July 2026 · Effective immediately for new accounts.</p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[hsl(var(--text-secondary))]">Everything governing your LifeKit account, organised so you can find the clause you need without reading a wall of text.</p>
        </div>
        <LegalExplorer sections={explorerSections} />

        <div className="mt-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-subtle))] p-5 text-center">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Ready to get started?{" "}
            <Link href={ROUTES.SIGN_UP} className="font-medium text-[hsl(var(--primary))] hover:underline">
              Create your free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
