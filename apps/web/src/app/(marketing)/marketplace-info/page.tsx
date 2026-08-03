import Link from "next/link";
import { ShoppingBag, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { MarketplaceFinder } from "@/components/marketing/page-experiences";
import { Reveal } from "@/components/marketing/premium-interactions";

const CATEGORIES = [
  { name: "Career",    emoji: "💼", count: "240+", desc: "Mentors, recruiters, career coaches" },
  { name: "Finance",   emoji: "📈", count: "180+", desc: "Financial advisors, investment tools" },
  { name: "Health",    emoji: "🏃", count: "320+", desc: "Trainers, nutritionists, wellness apps" },
  { name: "Travel",    emoji: "✈️",  count: "150+", desc: "Travel planners, booking services" },
  { name: "Business",  emoji: "🚀", count: "210+", desc: "Consultants, designers, developers" },
  { name: "Education", emoji: "🎓", count: "500+", desc: "Courses, tutors, certifications" },
];

const FEATURED_PROVIDERS = [
  { name: "CareerStack",    category: "Career",    rating: 4.9, reviews: 1240, tagline: "Land your dream role with 1-on-1 coaching" },
  { name: "MoneyMentor",   category: "Finance",   rating: 4.8, reviews:  890, tagline: "AI-powered savings and investment planning" },
  { name: "FitForge",      category: "Health",    rating: 4.9, reviews: 2100, tagline: "Custom fitness plans backed by sports science" },
  { name: "LearnWithPro",  category: "Education", rating: 4.7, reviews: 3400, tagline: "Expert-led courses for every career goal" },
];

const PROVIDER_TYPES = [
  "Mentors & Coaches",
  "Online Courses",
  "Freelance Experts",
  "Software & Tools",
  "Books & Resources",
  "Financial Products",
  "Insurance & Legal",
  "Travel Services",
];

export default function MarketingMarketplacePage() {
  return (
    <div className="marketing-page-shell overflow-hidden">
      {/* Hero */}
      <section className="marketing-story-hero text-center">
        <div className="mx-auto max-w-3xl">
          <Badge variant="secondary" className="mb-6 gap-2 px-3 py-1">
            <ShoppingBag className="h-3.5 w-3.5" />
            Life Marketplace
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[hsl(var(--text-primary))]">
            Every resource you need to
            <span className="block lifekit-gradient-text">achieve your goals</span>
          </h1>
          <p className="mt-5 text-lg text-[hsl(var(--text-secondary))] max-w-xl mx-auto">
            A curated marketplace of mentors, courses, tools, and services — all matched to your active missions by AI.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild rightIcon={<ArrowRight className="h-4 w-4" />}>
              <Link href={ROUTES.SIGN_UP}>Browse Marketplace</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={ROUTES.CONTACT}>Become a Provider</Link>
            </Button>
          </div>
        </div>
      </section>

      <MarketplaceFinder />
      {/* Categories */}
      <section className="py-16 px-4 bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[hsl(var(--text-primary))]">Browse by category</h2>
            <p className="mt-2 text-[hsl(var(--text-secondary))]">
              Over 1,600 vetted providers across every life goal.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                href={ROUTES.SIGN_UP}
                className="flex flex-col items-center gap-2 rounded-xl border border-[hsl(var(--border))] p-4 text-center hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--secondary))] transition-all group"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{cat.name}</p>
                <p className="text-xs text-[hsl(var(--text-secondary))]">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured providers */}
      <section className="py-16 px-4 bg-[hsl(var(--background-subtle))]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[hsl(var(--text-primary))]">Featured providers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_PROVIDERS.map(p => (
              <Reveal key={p.name}><Card className="marketing-premium-card h-full">
                <CardContent className="p-5">
                  <div className="h-10 w-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--primary))] font-bold text-lg mb-3">
                    {p.name[0]}
                  </div>
                  <p className="font-semibold text-[hsl(var(--text-primary))]">{p.name}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mb-3">{p.tagline}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-[hsl(var(--text-primary))]">{p.rating}</span>
                    <span className="text-xs text-[hsl(var(--text-secondary))]">({p.reviews.toLocaleString()})</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                </CardContent>
              </Card></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Provider types */}
      <section className="py-16 px-4 bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-[hsl(var(--text-primary))] mb-4">What you&apos;ll find</h2>
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {PROVIDER_TYPES.map(t => (
              <span
                key={t}
                className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium text-[hsl(var(--text-secondary))]"
              >
                {t}
              </span>
            ))}
          </div>

          {/* For providers CTA */}
          <Card className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--background-subtle))]">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-[hsl(var(--text-primary))] mb-2">Are you a provider?</h3>
              <p className="text-[hsl(var(--text-secondary))] mb-5 max-w-md mx-auto">
                List your services, reach goal-driven users who are already looking for what you offer, and grow your business with AI-powered matching.
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-sm text-[hsl(var(--text-secondary))] mb-6">
                {["No listing fees", "AI-matched leads", "Mission-aligned customers", "Verified badge"].map(f => (
                  <span key={f} className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />{f}
                  </span>
                ))}
              </div>
              <Button asChild rightIcon={<ArrowRight className="h-4 w-4" />}>
                <Link href={ROUTES.CONTACT}>Apply as a provider</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
