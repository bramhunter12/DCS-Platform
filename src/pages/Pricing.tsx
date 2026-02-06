import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const roles = [
  {
    name: 'Buyer',
    price: 'Free',
    period: '',
    commission: '$0',
    description: 'Browse and purchase with confidence on a trust-first exchange.',
    features: [
      'Browse all approved listings',
      'Save watches to collection',
      'Message verified sellers',
      'Purchase with buyer protection',
      'Identity verification at checkout',
    ],
    cta: 'Create Account',
    ctaLink: '/auth',
    highlighted: false,
  },
  {
    name: 'Private Holder',
    price: 'Free',
    period: '',
    commission: '3.5% per transaction',
    description: 'Designed for individuals selling a personal timepiece with no monthly commitment.',
    features: [
      'List up to 3 watches',
      'Message buyers directly',
      'Complete secure transactions',
      'Identity verification required',
      'Standard verification queue',
    ],
    cta: 'Start Selling',
    ctaLink: '/auth',
    highlighted: false,
  },
  {
    name: 'Verified Dealer',
    price: '$50',
    period: '/month',
    commission: '2.5% per transaction',
    description: 'Built for repeat sellers who value speed, tools, and professional credibility.',
    features: [
      'List up to 25 watches',
      'Priority listing review',
      'Faster dispute handling',
      'Saved listing templates',
      'Duplicate & relist tools',
      'Basic performance insights',
      'Verified Dealer designation',
    ],
    cta: 'Apply Now',
    ctaLink: '/auth',
    highlighted: false,
  },
  {
    name: 'Certified Exchange Partner',
    price: '$195',
    period: '/month',
    commission: '0%',
    description: 'Institutional-grade access for high-volume dealers aligned with exchange standards.',
    features: [
      'Unlimited listings',
      'Branded storefront profile',
      'Priority verification lanes',
      'Enhanced analytics dashboard',
      'Market insight previews',
      'Streamlined bulk actions',
      'Dedicated support escalation',
      'Certified Partner designation',
    ],
    cta: 'Apply Now',
    ctaLink: '/auth',
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight mb-4">
              Exchange Roles
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each role serves a specific purpose within the exchange. 
              Choose based on how you intend to participate.
            </p>
          </div>
        </section>

        {/* Launch Period Notice */}
        <section className="bg-muted/30 border-b border-border py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">90-Day Launch Period</span>
              {' — '}
              All seller tiers currently operate with zero fees. 
              Standard fees activate automatically after the launch window.
            </p>
          </div>
        </section>

        {/* Role Cards */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {roles.map((role) => (
                <div
                  key={role.name}
                  className={`border p-6 flex flex-col ${
                    role.highlighted
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <h3 className="font-serif text-xl font-medium mb-2">
                    {role.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-3xl font-light">{role.price}</span>
                    <span className="text-muted-foreground text-sm">{role.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Commission: {role.commission}
                  </p>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {role.description}
                  </p>
                  <ul className="space-y-2.5 mb-6 flex-grow">
                    {role.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant={role.highlighted ? 'default' : 'outline'}
                    className="w-full"
                  >
                    <Link to={role.ctaLink}>{role.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role Comparison */}
        <section className="border-t border-border py-16 md:py-24 bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-serif text-3xl font-light text-center mb-12">
              Understanding the Roles
            </h2>
            <div className="space-y-8">
              <div className="border-l-2 border-muted-foreground/30 pl-6">
                <h4 className="font-medium mb-2">Why Private Holder exists</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  For collectors selling one or two personal pieces without ongoing selling intent. 
                  No subscription required—simply pay a transaction fee when your watch sells.
                </p>
              </div>
              <div className="border-l-2 border-secondary pl-6">
                <h4 className="font-medium mb-2">When Verified Dealer becomes necessary</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Once you're regularly listing watches, the operational advantages become valuable: 
                  faster review times, listing templates, and the credibility signal of dealer verification. 
                  The lower commission rate typically pays for itself after a few transactions.
                </p>
              </div>
              <div className="border-l-2 border-primary pl-6">
                <h4 className="font-medium mb-2">Why Certified Exchange Partner is earned</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  This tier is designed for established dealers operating at institutional scale. 
                  Zero commission, advanced tools, and a branded presence—but with the expectation 
                  of consistent alignment with exchange standards and volume.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-serif text-3xl font-light text-center mb-12">
              Common Questions
            </h2>
            <div className="space-y-8">
              <div>
                <h4 className="font-medium mb-2">What is identity verification?</h4>
                <p className="text-muted-foreground text-sm">
                  All sellers undergo third-party identity verification before listing. 
                  Buyers verify at checkout. This maintains exchange integrity and protects all parties.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">How do transaction fees work?</h4>
                <p className="text-muted-foreground text-sm">
                  Private Holders pay 3.5% on completed sales. Verified Dealers pay 2.5%. 
                  Certified Exchange Partners pay 0%—the subscription covers all transaction costs.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">What is the 90-day launch period?</h4>
                <p className="text-muted-foreground text-sm">
                  During launch, all seller tiers operate with zero fees to establish the exchange. 
                  Standard fees activate automatically after this window closes.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Can I change my role?</h4>
                <p className="text-muted-foreground text-sm">
                  Roles can be adjusted based on your selling activity. 
                  Changes take effect at the start of your next billing cycle.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}