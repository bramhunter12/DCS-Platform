import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/ui/tier-badge';
import { 
  Watch, 
  Plus, 
  Settings, 
  Shield, 
  CreditCard,
  ArrowRight,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted w-1/3" />
            <div className="h-48 bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !profile) return null;

  const isObserver = role === 'observer';
  const isAdmin = role === 'admin';
  const canSell = role === 'individual_seller' || role === 'super_seller' || role === 'admin';
  const needsVerification = canSell && profile.kyc_status !== 'verified';

  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-serif text-3xl font-medium">
                {profile.full_name || 'Welcome'}
              </h1>
              {role && <TierBadge tier={role} />}
            </div>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>
          
          {canSell && (
            <Link to="/sell/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </Link>
          )}
        </div>

        {/* Verification Alert */}
        {needsVerification && (
          <div className="bg-primary/10 border border-primary/20 p-6 mb-8 flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium mb-1">Complete Identity Verification</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To list watches on the exchange, you must complete identity verification. 
                This helps maintain trust in our community.
              </p>
              <Link to="/verification">
                <Button size="sm">
                  Start Verification
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Private Holder CTA - observers can sell up to 3 listings */}
        {isObserver && (
          <div className="bg-secondary border border-border p-8 mb-8">
            <h3 className="font-serif text-xl font-medium mb-2">
              Start Selling as a Private Holder
            </h3>
            <p className="text-muted-foreground mb-4">
              As a Private Holder, you can list up to 3 watches with a 3.5% commission per sale. 
              No monthly subscription required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/onboarding/seller">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/80">
                  Start Selling
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  View All Tiers
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isAdmin && (
            <Link 
              to="/admin" 
              className="border border-primary/50 bg-primary/5 p-6 hover:border-primary transition-colors group"
            >
              <ShieldCheck className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                Admin Panel
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage users, listings & settings
              </p>
            </Link>
          )}

          <Link 
            to="/browse" 
            className="border border-border p-6 hover:border-primary/50 transition-colors group"
          >
            <Watch className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
              Browse Exchange
            </h3>
            <p className="text-sm text-muted-foreground">
              Explore verified listings
            </p>
          </Link>

          {canSell && (
            <Link 
              to="/dashboard/listings" 
              className="border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <Watch className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                My Listings
              </h3>
              <p className="text-sm text-muted-foreground">
                Manage your active listings
              </p>
            </Link>
          )}

          <Link 
            to="/settings" 
            className="border border-border p-6 hover:border-primary/50 transition-colors group"
          >
            <Settings className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
              Account Settings
            </h3>
            <p className="text-sm text-muted-foreground">
              Update your profile
            </p>
          </Link>

          {canSell && (
            <Link 
              to="/verification" 
              className="border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <Shield className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                Verification
              </h3>
              <p className="text-sm text-muted-foreground">
                {profile.kyc_status === 'verified' ? 'Verified ✓' : 'Complete verification'}
              </p>
            </Link>
          )}

          {canSell && (
            <Link 
              to="/dashboard/transactions" 
              className="border border-border p-6 hover:border-primary/50 transition-colors group"
            >
              <CreditCard className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                Transactions
              </h3>
              <p className="text-sm text-muted-foreground">
                View your sales and purchases
              </p>
            </Link>
          )}
        </div>

        {/* Account Status */}
        <div className="border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-xl font-medium">Account Status</h2>
          </div>
          <div className="p-6 grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Membership
              </p>
              <p className="font-medium">
                {role === 'observer' ? 'Private Holder' :
                 role === 'individual_seller' ? 'Verified Dealer' :
                 role === 'super_seller' ? 'Certified Partner' :
                 role === 'admin' ? 'Admin' :
                 role === 'buyer' ? 'Buyer' : 'Private Holder'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Verification
              </p>
              <p className="font-medium capitalize">
                {profile.kyc_status.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Subscription
              </p>
              <p className="font-medium capitalize">
                {profile.subscription_status || 'None'}
                {profile.zero_fee_eligible && (
                  <span className="text-primary ml-2">(Zero-fee period)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
