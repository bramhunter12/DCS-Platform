import { Link } from 'react-router-dom';
import { Watch } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Watch className="h-5 w-5 text-primary" />
              <span className="font-serif text-lg font-medium">
                Prestige Exchange
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A trust-first luxury watch exchange. 
              Verified sellers. Authenticated timepieces. 
              Transparent transactions.
            </p>
          </div>

          {/* Exchange */}
          <div>
            <h4 className="font-serif text-sm font-medium mb-4">Exchange</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/browse" className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                  Browse Watches
                </Link>
              </li>
              <li>
                <Link to="/sell" className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                  Sell a Watch
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                  Membership Tiers
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-serif text-sm font-medium mb-4">Community</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/community" className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                  Discussions
                </Link>
              </li>
              <li>
                <Link to="/community?category=market_insights" className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                  Market Insights
                </Link>
              </li>
              <li>
                <Link to="/community?category=reference_guides" className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                  Reference Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="font-serif text-sm font-medium mb-4">Trust & Safety</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/verification" className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                  Seller Verification
                </Link>
              </li>
              <li>
                <Link to="/buyer-protection" className="text-sm text-muted-foreground hover:text-secondary-foreground transition-colors">
                  Buyer Protection
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="separator-gold my-12" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Prestige Watch Exchange. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-secondary-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-secondary-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
