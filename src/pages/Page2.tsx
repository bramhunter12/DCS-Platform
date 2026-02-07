import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Watch, Shield, Users, ArrowRight, Check } from 'lucide-react';

export default function Page2() {
  return (
    <Layout>
      {/* Trust Pillars */}
      <section className="py-24 bg-secondary">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">
              Built on Trust
            </h2>
            <p className="text-muted-foreground">
              In high-value markets, liquidity follows trust.
              Every feature of the Exchange reinforces credibility.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="bg-card p-8 border border-border">
              <Shield className="h-10 w-10 text-primary mb-6" />
              <h3 className="font-serif text-xl font-medium mb-3">
                Verified Sellers
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every seller completes identity verification before listing.
                No anonymous actors. No unknown parties.
              </p>
            </div>

            <div className="bg-card p-8 border border-border">
              <Watch className="h-10 w-10 text-primary mb-6" />
              <h3 className="font-serif text-xl font-medium mb-3">
                Authenticated Listings
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Structured photo requirements and admin review ensure
                every listing meets exchange standards.
              </p>
            </div>

            <div className="bg-card p-8 border border-border">
              <Users className="h-10 w-10 text-primary mb-6" />
              <h3 className="font-serif text-xl font-medium mb-3">
                Protected Transactions
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Secure payment processing with buyer protection.
                Funds held until confirmed delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">
              Membership Tiers
            </h2>
            <p className="text-muted-foreground">
              Tiered access ensures quality participation at every level.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="border border-border p-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Free Access
              </p>
              <h3 className="font-serif text-2xl font-medium mb-4">Buyer</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Browse and purchase with confidence on a trust-first exchange.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Browse all listings</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Save watches</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Message sellers</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Purchase watches</span>
                </li>
              </ul>
              <Link to="/auth?mode=signup">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/80">
                  Create Free Account
                </Button>
              </Link>
            </div>

            <div className="border border-border p-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Free • 3.5% commission
              </p>
              <h3 className="font-serif text-2xl font-medium mb-4">Private Holder</h3>
              <p className="text-muted-foreground text-sm mb-6">
                For individuals selling a personal timepiece with no monthly commitment.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>1–3 active listings</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Message buyers</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Complete transactions</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Identity verification</span>
                </li>
              </ul>
              <Link to="/auth?mode=signup">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/80">
                  Start Selling
                </Button>
              </Link>
            </div>

            <div className="border border-primary p-8 relative">
              <div className="absolute -top-3 left-8 bg-primary text-primary-foreground px-3 py-1 text-xs uppercase tracking-widest">
                Popular
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                $50/month • 2.5% commission
              </p>
              <h3 className="font-serif text-2xl font-medium mb-4">Verified Dealer</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Built for repeat sellers who value speed, tools, and professional credibility.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Up to 25 active listings</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Priority listing review</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Saved listing templates</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Basic performance insights</span>
                </li>
              </ul>
              <Link to="/auth?mode=signup">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/80">
                  Become a Dealer
                </Button>
              </Link>
            </div>

            <div className="border border-border p-8 bg-secondary text-secondary-foreground">
              <p className="text-xs uppercase tracking-widest text-secondary-foreground/60 mb-2">
                $195/month • 0% commission
              </p>
              <h3 className="font-serif text-2xl font-medium mb-4">Certified Partner</h3>
              <p className="text-secondary-foreground/70 text-sm mb-6">
                Institutional-grade access for high-volume dealers aligned with exchange standards.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Unlimited listings</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Zero commission</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Branded storefront</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <Link to="/auth?mode=signup">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/80">
                  Apply for Partnership
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            All new sellers enjoy a 90-day zero-fee launch period.
          </p>
        </div>
      </section>

      {/* Market Context */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary mb-4">
                Market Intelligence
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-medium mb-6">
                Pricing Context, Not Promises
              </h2>
              <p className="text-secondary-foreground/70 leading-relaxed mb-6">
                We provide market context based on recent observations—not automated
                valuations or AI appraisals. Reference ranges help inform decisions,
                not guarantee outcomes.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 border border-primary flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">
                    Low / Expected / Premium price ranges per reference
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 border border-primary flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">
                    Based on verified market observations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 border border-primary flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">
                    Clearly labeled for decision support only
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-card text-card-foreground border border-border p-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
                Example: Market Context
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">Rolex Submariner 126610LN</span>
                </div>
                <div className="separator-gold" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Low</p>
                    <p className="font-serif text-xl">$12,800</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Expected</p>
                    <p className="font-serif text-xl text-primary">$14,200</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Premium</p>
                    <p className="font-serif text-xl">$16,500</p>
                  </div>
                </div>
                <div className="separator-gold" />
                <p className="text-xs text-muted-foreground text-center">
                  Based on recent market observations. For reference purposes only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">
            Join the Exchange
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Whether you're looking to acquire your next timepiece or find the right buyer
            for a piece in your collection, start with trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/browse">
              <Button size="lg" variant="outline" className="text-base px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Browse Listings
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-base px-8 bg-primary text-primary-foreground hover:bg-primary/80">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
